// Repo-authored markdown is rendered on the same origin as /admin, so raw HTML is
// never allowed through: comments are dropped and any other tag is escaped to text.
// Script-scheme links are neutralised. Code spans and fenced blocks are left alone (markdown escapes them itself).
const CODE = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g;

export function sanitizeMarkdown(md: string): string {
  return md
    .replace(/<!--[\s\S]*?-->/g, '')
    .split(CODE)
    .map((part, i) => (i % 2 === 1 ? part : part
      .replace(/<(?=[A-Za-z/!?])/g, '&lt;')
      .replace(/\]\(\s*(javascript|data|vbscript):/gi, '](#')))
    .join('');
}
