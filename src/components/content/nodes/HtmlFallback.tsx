import DOMPurify from "isomorphic-dompurify";

/**
 * Escape-hatch renderer for unknown Ghost cards. The markup is sanitized with
 * DOMPurify, which strips `<script>`, inline event handlers, and
 * `javascript:` URLs before it reaches `dangerouslySetInnerHTML`.
 */
export function HtmlFallback({ html }: { html: string }) {
  const safeHtml = DOMPurify.sanitize(html);
  return <div className="my-8" dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}
