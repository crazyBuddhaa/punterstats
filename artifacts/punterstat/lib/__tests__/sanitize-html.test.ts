import { describe, expect, it } from "vitest";
import { sanitizeContentHtml } from "@/lib/sanitize-html";

describe("sanitizeContentHtml", () => {
  it("keeps lesson structural markup", () => {
    const html =
      '<h2>Key Takeaways</h2><p>Stake <strong>₦5,000</strong> on <a href="https://punterstat.com" target="_blank" rel="noopener">SportyBet</a></p><table><tr><td colspan="2">x</td></tr></table>';
    const out = sanitizeContentHtml(html);
    expect(out).toContain("<h2>Key Takeaways</h2>");
    expect(out).toContain("<strong>₦5,000</strong>");
    expect(out).toContain('href="https://punterstat.com"');
    expect(out).toContain('colspan="2"');
  });

  it("preserves data-block marker attributes", () => {
    const out = sanitizeContentHtml(
      '<div data-block="stat" data-factor="btts_rate" data-league="E0" data-seasons="5"></div>',
    );
    expect(out).toContain('data-block="stat"');
    expect(out).toContain('data-factor="btts_rate"');
  });

  it("strips scripts, event handlers, iframes and javascript: URLs", () => {
    const out = sanitizeContentHtml(
      '<p onclick="alert(1)">hi</p><script>alert(1)</script><iframe src="https://evil"></iframe><a href="javascript:alert(1)">x</a><img src="x" onerror="alert(1)">',
    );
    expect(out).not.toMatch(/script|onclick|onerror|iframe|javascript:/i);
    expect(out).toContain("<p>hi</p>");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeContentHtml("")).toBe("");
  });
});
