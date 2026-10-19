/**
 * Approximation of the filtering Gmail web applies to an HTML email before showing it.
 * Not Gmail's real sanitizer — it covers the rules that affect this app's templates:
 * only the body is kept, `<style>`/`<head>`/`<script>` are dropped, event handlers are removed,
 * and inline CSS Gmail ignores (positioning, CSS variables, gradients, malformed declarations) is stripped.
 */

const REMOVED_ELEMENTS = "script, style, link, meta, title, head, base";

const UNSUPPORTED_PROPERTIES = new Set(["position", "top", "right", "bottom", "left", "inset", "z-index"]);

const UNSUPPORTED_VALUE = /var\(|gradient\(|expression\(/i;

const PROPERTY_NAME = /^-?[a-z][a-z-]*$/i;

/** Split a style attribute on `;`, ignoring semicolons inside parentheses (e.g. data URLs). */
function splitDeclarations(style: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of style) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);
    if (char === ";" && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
}

/** A `:` outside parentheses in the value means two declarations ran together (Gmail drops them). */
function hasStrayColon(value: string): boolean {
  let depth = 0;
  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);
    if (char === ":" && depth === 0) return true;
  }
  return false;
}

function keepDeclaration(declaration: string): boolean {
  const colon = declaration.indexOf(":");
  if (colon <= 0) return false;
  const property = declaration.slice(0, colon).trim().toLowerCase();
  const value = declaration.slice(colon + 1).trim();
  if (!PROPERTY_NAME.test(property) || !value || hasStrayColon(value)) return false;
  return !UNSUPPORTED_PROPERTIES.has(property) && !UNSUPPORTED_VALUE.test(value);
}

export function sanitizeInlineStyle(style: string): string {
  return splitDeclarations(style).filter(keepDeclaration).join(";");
}

function sanitizeElement(element: Element) {
  for (const attribute of [...element.attributes]) {
    if (attribute.name.toLowerCase().startsWith("on")) element.removeAttribute(attribute.name);
  }
  const style = element.getAttribute("style");
  if (style !== null) {
    const cleaned = sanitizeInlineStyle(style);
    if (cleaned) element.setAttribute("style", cleaned);
    else element.removeAttribute("style");
  }
  if (element.tagName === "A" && element.hasAttribute("href")) {
    element.setAttribute("target", "_blank");
    element.setAttribute("rel", "noreferrer");
  }
}

/** Returns the body HTML as Gmail web would roughly render it. */
export function sanitizeForGmail(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll(REMOVED_ELEMENTS).forEach((node) => node.remove());
  doc.body.querySelectorAll("*").forEach(sanitizeElement);
  return doc.body.innerHTML;
}
