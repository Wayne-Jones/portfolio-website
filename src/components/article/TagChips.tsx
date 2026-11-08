interface TagChipsProps {
  tags?: readonly string[];
}

/** Muted pill row for a content item's tags. Renders nothing when empty. */
export function TagChips({ tags }: TagChipsProps) {
  if (tags === undefined || tags.length === 0) return null;

  return (
    <ul aria-label="Tags" className="m-0 flex list-none flex-wrap gap-2 p-0">
      {tags.map((tag) => (
        <li key={tag}>
          <span className="inline-flex rounded-full bg-muted/10 px-3 py-1 text-xs tracking-wide text-muted uppercase">
            {tag}
          </span>
        </li>
      ))}
    </ul>
  );
}
