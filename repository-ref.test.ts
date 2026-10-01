import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import path from "node:path";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import {
  checkRepositoryReference,
  checkMarkdownRepositoryReferences,
  extractRepositoryReferences,
  parseRepositoryReference,
  registerRepository,
  resolveRepositoryReference,
} from "./repository-ref";

const testRoot = path.join(import.meta.dir, "tmp", `repository-ref-${process.pid}`);
const configPath = path.join(testRoot, "gitconfig");
const environment = {
  env: {
    ...process.env,
    GIT_CONFIG_GLOBAL: configPath,
    GIT_CONFIG_NOSYSTEM: "1",
  },
};

async function createRepository(name: string, alias: "app" | "spec") {
  const repositoryRoot = path.join(testRoot, "unrelated", name);
  await mkdir(repositoryRoot, { recursive: true });
  await writeFile(path.join(repositoryRoot, ".gf-repository"), `${alias}\n`);
  const process = Bun.spawn(["git", "init", "--quiet", repositoryRoot], {
    stdout: "pipe",
    stderr: "pipe",
  });
  expect(await process.exited).toBe(0);
  return repositoryRoot;
}

beforeEach(async () => {
  await rm(testRoot, { recursive: true, force: true });
  await mkdir(testRoot, { recursive: true });
});

afterEach(async () => {
  await rm(testRoot, { recursive: true, force: true });
});

describe("repository reference parsing", () => {
  test("parses a repository path and optional symbol", () => {
    expect(parseRepositoryReference("app::src/core/services.ts#symbol=OpportunitiesService")).toEqual({
      alias: "app",
      relativePath: "src/core/services.ts",
      symbol: "OpportunitiesService",
    });
    expect(parseRepositoryReference("spec::MAP.md")).toEqual({
      alias: "spec",
      relativePath: "MAP.md",
    });
  });

  test.each([
    ["other::README.md", "Unknown repository alias"],
    ["app::../secret.txt", "cannot contain '..'"],
    ["app::/absolute.txt", "must be repository-relative"],
    ["app::README.md#heading=intro", "Unsupported reference fragment"],
  ])("rejects unsafe or unsupported reference %s", (reference, message) => {
    expect(() => parseRepositoryReference(reference)).toThrow(message);
  });
});

describe("local repository resolution", () => {
  test("registers unrelated local checkouts and resolves an absolute path", async () => {
    const appRoot = await createRepository("application-checkout", "app");
    await mkdir(path.join(appRoot, "src", "core"), { recursive: true });
    await writeFile(path.join(appRoot, "src", "core", "services.ts"), "export class OpportunitiesService {}\n");

    await registerRepository("app", appRoot, environment);

    expect(await resolveRepositoryReference("app::src/core/services.ts", environment)).toEqual({
      alias: "app",
      repositoryRoot: appRoot,
      relativePath: "src/core/services.ts",
      absolutePath: path.join(appRoot, "src", "core", "services.ts"),
    });
  });

  test("checks an existing symbol and the show command reads the local file", async () => {
    const specRoot = await createRepository("documentation-checkout", "spec");
    await writeFile(path.join(specRoot, "MAP.md"), "# Documentation Map\n\nLocal content.\n");
    await registerRepository("spec", specRoot, environment);

    await expect(checkRepositoryReference("spec::MAP.md#symbol=Documentation Map", environment)).resolves.toMatchObject({
      absolutePath: path.join(specRoot, "MAP.md"),
      symbol: "Documentation Map",
    });

    const child = Bun.spawn([path.join(import.meta.dir, "gf-ref"), "show", "spec::MAP.md"], {
      cwd: import.meta.dir,
      env: environment.env,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(await child.exited).toBe(0);
    expect(await new Response(child.stdout).text()).toBe("# Documentation Map\n\nLocal content.\n");
  });

  test("rejects a checkout registered under the wrong alias", async () => {
    const appRoot = await createRepository("wrong-identity", "app");
    await expect(registerRepository("spec", appRoot, environment)).rejects.toThrow(
      "Repository marker identifies 'app', not 'spec'",
    );
  });

  test("revalidates a registered checkout before resolving a reference", async () => {
    const appRoot = await createRepository("replaced-application", "app");
    await writeFile(path.join(appRoot, "README.md"), "# Application\n");
    await registerRepository("app", appRoot, environment);

    await writeFile(path.join(appRoot, ".gf-repository"), "spec\n");
    await expect(resolveRepositoryReference("app::README.md", environment)).rejects.toThrow(
      "Repository marker identifies 'spec', not 'app'",
    );

    await writeFile(path.join(appRoot, ".gf-repository"), "app\n");
    await rm(path.join(appRoot, ".git"), { recursive: true, force: true });
    await expect(resolveRepositoryReference("app::README.md", environment)).rejects.toThrow(
      "Registered checkout for 'app' is not a repository root",
    );
  });

  test("fails locally for missing registration, files, and symbols", async () => {
    await expect(resolveRepositoryReference("app::README.md", environment)).rejects.toThrow(
      "No local checkout is registered for 'app'",
    );

    const appRoot = await createRepository("incomplete-application", "app");
    await writeFile(path.join(appRoot, "README.md"), "# Application\n");
    await registerRepository("app", appRoot, environment);

    await expect(checkRepositoryReference("app::missing.ts", environment)).rejects.toThrow(
      "Referenced file does not exist",
    );
    await expect(checkRepositoryReference("app::README.md#symbol=MissingThing", environment)).rejects.toThrow(
      "Symbol 'MissingThing' was not found",
    );
  });
});

describe("Markdown repository references", () => {
  test("extracts only app and spec link targets", () => {
    const markdown = [
      "[service](app::src/core/services.ts)",
      "[map](<spec::MAP.md#symbol=Documentation Map>)",
      "[local](../domain/model.md)",
      "[web](https://example.com/reference)",
      "[other](custom::value)",
    ].join("\n");

    expect(extractRepositoryReferences(markdown)).toEqual([
      "app::src/core/services.ts",
      "spec::MAP.md#symbol=Documentation Map",
    ]);
  });

  test("checks every extracted target against local registrations", async () => {
    const appRoot = await createRepository("markdown-application", "app");
    await writeFile(path.join(appRoot, "README.md"), "# Application\n");
    await registerRepository("app", appRoot, environment);

    await expect(checkMarkdownRepositoryReferences("[app](app::README.md)", environment)).resolves.toHaveLength(1);
    await expect(checkMarkdownRepositoryReferences("[missing](app::missing.md)", environment)).rejects.toThrow(
      "Referenced file does not exist",
    );
  });
});

describe("repository entrypoints", () => {
  test("agent and maintainer guidance use registered aliases without sibling assumptions", async () => {
    const [agents, readme] = await Promise.all([
      readFile(path.join(import.meta.dir, "AGENTS.md"), "utf8"),
      readFile(path.join(import.meta.dir, "README.md"), "utf8"),
    ]);

    expect(agents).toContain("app::");
    expect(agents).toContain("./gf-ref");
    expect(agents).not.toMatch(/sibling [`']?gig-finder/);
    expect(readme).toContain("./gf-ref register spec .");
    expect(readme).toContain("./gf-ref register app /path/to/gig-finder");
    expect(readme).not.toMatch(/sibling [`']?gig-finder/);
  });
});
