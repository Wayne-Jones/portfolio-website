/**
 * Decorative section divider. `data-content-divider` is the styling hook used
 * by the editor theme; the `<hr>` keeps the separator semantic.
 */
export function Divider() {
  return <hr data-content-divider className="my-12 border-0 border-t border-fg/10" />;
}
