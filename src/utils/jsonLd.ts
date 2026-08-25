/**
 * Helpers for embedding JSON-LD structured data inside inline <script> tags.
 */

/**
 * `JSON.stringify` does not escape characters that are significant to an HTML
 * parser, so a value containing `</script>` would close the tag early and allow
 * arbitrary markup to be injected. U+2028/U+2029 are also escaped because they
 * are valid JSON but invalid inside JavaScript string literals.
 *
 * Every replacement is a standard JSON unicode escape, so the emitted payload
 * stays valid JSON and parses to exactly the same value for consumers.
 */
const SCRIPT_UNSAFE_CHARS: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(
    /[<>&\u2028\u2029]/g,
    (char) => SCRIPT_UNSAFE_CHARS[char] ?? char
  );
}
