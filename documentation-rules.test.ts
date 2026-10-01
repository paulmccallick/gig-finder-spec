import { describe, expect, test } from "bun:test";
import { findUnmappedImplementationReference, validateImplementationMapRows } from "./documentation-rules";

describe("documentation validation rules", () => {
  test("recognizes implementation references that must live in the map", () => {
    expect(findUnmappedImplementationReference("See `app::src/core/gigs.ts`." )).toBe(true);
    expect(findUnmappedImplementationReference("The test is in `src/core/test/gigs.test.ts`." )).toBe(true);
    expect(findUnmappedImplementationReference("The service validates the opportunity." )).toBe(false);
  });

  test("requires unique, complete map rows with a spec link and implementation reference", () => {
    const row = "| `TASK-FB-001` | [Task behavior](capabilities/tasks.md#functional-behavior) | `app::src/core/tasks.ts` | `app::src/core/test/tasks.test.ts` | inspected |";
    expect(validateImplementationMapRows(`# Map\n${row}`)).toEqual([]);
    expect(validateImplementationMapRows(`# Map\n${row}\n${row}`)).toContain("duplicate statement ID TASK-FB-001");
    expect(validateImplementationMapRows("| `TASK-FB-001` | Task behavior | none | | inspected |")).toEqual([
      "missing specification link for TASK-FB-001",
      "TASK-FB-001 has no app implementation reference",
    ]);
  });
});
