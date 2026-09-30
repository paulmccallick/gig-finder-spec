import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import path from "node:path";
import { mkdir, rm, writeFile } from "node:fs/promises";
import {
  checkRepositoryReference,
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
