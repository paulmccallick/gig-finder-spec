const statementIdPattern = /^[A-Z][A-Z0-9]*-(?:BR|FB|WF|API|ARCH)-\d{3}$/;
const implementationReferencePattern = /\bapp::|\b(?:src|scripts|bin)\/[\w./-]+\.(?:[cm]?[jt]sx?|json|sql|sh|cjs)|\b[\w.-]+\.test\.(?:[jt]sx?)\b/;

export function findUnmappedImplementationReference(text: string): boolean {
  return implementationReferencePattern.test(text);
}

export function validateImplementationMapRows(text: string): string[] {
  const failures: string[] = [];
  const rows = text.split("\n").filter(line => /^\|\s*`[A-Z][A-Z0-9]*-(?:BR|FB|WF|API|ARCH)-\d{3}`\s*\|/.test(line));
  const ids = new Set<string>();
  if (!rows.length) failures.push("no stable-statement rows found");

  for (const row of rows) {
    const cells = row.split("|").slice(1, -1).map(cell => cell.trim());
    const id = cells[0]?.replaceAll("`", "");
    if (!id || !statementIdPattern.test(id)) failures.push(`invalid statement ID ${id ?? ""}`);
    else if (ids.has(id)) failures.push(`duplicate statement ID ${id}`);
    else ids.add(id);
    if (cells.length !== 5) failures.push(`expected five columns for ${id ?? "row"}`);
    if (!cells[1]?.match(/\[[^\]]+\]\([^)]+\)/)) failures.push(`missing specification link for ${id ?? "row"}`);
    if (!cells[2]?.includes("app::")) failures.push(`${id ?? "row"} has no app implementation reference`);
  }
  return failures;
}
