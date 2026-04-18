export function SvgIcon({ html, className }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
