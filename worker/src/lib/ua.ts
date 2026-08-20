/**
 * Reduces a user-agent header to a coarse family name.
 *
 * The raw header is a fingerprinting surface — version numbers, build ids,
 * device models — so it is never stored. Only the return value of this
 * function reaches the database, and it is drawn from a closed list.
 *
 * Order matters: Edge and Opera both claim to be Chrome, Chrome claims to be
 * Safari, so the most specific matcher has to win first.
 */
const FAMILIES: ReadonlyArray<readonly [string, RegExp]> = [
  ['Bot',       /bot|crawler|spider|slurp|facebookexternalhit|preview|curl|wget|headless/i],
  ['Edge',      /\bedg(e|a|ios)?\//i],
  ['Opera',     /\bopr\/|\bopera\//i],
  ['Samsung',   /samsungbrowser/i],
  ['Firefox',   /\bfirefox\/|\bfxios\//i],
  ['Chrome',    /\bchrome\/|\bcrios\//i],
  ['Safari',    /\bsafari\//i],
  ['PDF viewer',/\bpdf|acrobat|preview\//i],
];

export function userAgentFamily(raw: string | null): string {
  if (!raw) return 'Unknown';
  for (const [name, re] of FAMILIES) if (re.test(raw)) return name;
  return 'Other';
}

/**
 * Two-letter country code from the Cloudflare request property.
 *
 * This is the ONLY geographic signal captured. The client IP is never read,
 * never passed on, and has no column to live in.
 */
export function coarseCountry(request: Request): string | null {
  const cf = (request as Request & { cf?: { country?: string } }).cf;
  const c = cf?.country;
  return typeof c === 'string' && /^[A-Z]{2}$/.test(c) ? c : null;
}
