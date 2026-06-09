// Sanitizes a user-supplied URL before it is placed in an href/src attribute.
//
// React escapes text content automatically, so the remaining XSS vector in this
// app is a stored link whose scheme executes script when clicked — e.g.
// `javascript:alert(document.cookie)` or `data:text/html,<script>…`. Anchor and
// image targets are the one place React does NOT protect us.
//
// Returns a safe URL string, or `undefined` so the attribute is dropped entirely
// (a non-navigable link) when the value is missing or uses a dangerous scheme.

// Only these schemes may appear in a user-provided absolute URL.
const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

export const safeUrl = (value) => {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // Same-page anchors and root-relative paths carry no scheme and stay on our
  // own origin — always safe.
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;

  try {
    // Resolve against the current origin so protocol-relative ("//host") and
    // absolute URLs are both parsed; the base is only used when one is missing.
    const base = typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const parsed = new URL(trimmed, base);
    return SAFE_PROTOCOLS.has(parsed.protocol) ? parsed.href : undefined;
  } catch {
    // Not parseable as a URL (e.g. a bare "example.com" with no scheme) — refuse
    // it rather than guess, since we can't prove the scheme is safe.
    return undefined;
  }
};

export default safeUrl;
