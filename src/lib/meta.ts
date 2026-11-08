/** Joins non-empty metadata fragments with the editorial middle dot. */
export function joinMetadata(parts: readonly (string | undefined | null)[]): string {
  return parts
    .filter((part): part is string => typeof part === "string" && part !== "")
    .join(" · ");
}

/** Project metadata row; missing fields keep an em-dash placeholder. */
export function joinProjectMetadata(project: {
  role?: string;
  client?: string;
  year?: number;
}): string {
  return [project.role ?? "—", project.client ?? "—", project.year?.toString() ?? "—"].join(" · ");
}
