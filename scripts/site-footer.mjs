// The one site footer.
//
// Every page on diagram.mosofin.com renders this markup, so the footer cannot
// drift between the landing page, the gallery, the guide, the start page and
// the logo catalogue. Pages are generated from different templates and one is
// hand-authored, which is exactly how five different footers appeared before.
//
// `page` is the page's own location, used only to resolve links that are
// in-page anchors on the landing page and must become absolute elsewhere.

const MOSOFIN_REFERRAL = 'https://mosofin.com/?utm_source=diagram.mosofin.com'
  + '&utm_medium=referral&utm_campaign=mosofin-diagram&utm_content=footer-credit';

const REPO = 'https://github.com/MosoFin/mosofin-diagram';

export function siteFooter({ version, page = 'index', assetPrefix = '' } = {}) {
  if (!version) throw new Error('siteFooter: version is required');
  // On the landing page these are in-page anchors; everywhere else they have
  // to travel back to it, or the link silently does nothing.
  const home = page === 'index' ? '' : '/';
  const amp = '&amp;';
  const referral = MOSOFIN_REFERRAL.replace(/&/g, amp);
  return `<footer class="site-footer">
  <div class="site-footer-inner">
    <div class="site-footer-top">
      <a class="site-footer-brand" href="${page === 'index' ? '#' : '/'}">
        <img src="${assetPrefix}assets/mosofin-mark.png" alt="" width="26" height="26">
        <span>MosoFin-diagram</span>
      </a>
      <div class="site-footer-cols">
        <div class="site-footer-col">
          <p class="site-footer-heading">Product</p>
          <a href="${home}#how">How it works</a>
          <a href="${home}#types">Examples</a>
          <a href="${home}#install">Get started</a>
        </div>
        <div class="site-footer-col">
          <p class="site-footer-heading">Explore</p>
          <a href="/gallery.html">Gallery</a>
          <a href="/guide.html">Guide</a>
          <a href="/logos.html">Logos</a>
        </div>
        <div class="site-footer-col">
          <p class="site-footer-heading">Project</p>
          <a href="${REPO}" target="_blank" rel="noopener">GitHub</a>
          <a href="${REPO}/blob/main/CHANGELOG.md" target="_blank" rel="noopener">Changelog</a>
          <a href="${REPO}/blob/main/LICENSE" target="_blank" rel="noopener">License</a>
        </div>
        <div class="site-footer-col">
          <p class="site-footer-heading">MosoFin</p>
          <a href="${referral}" target="_blank" rel="noopener">mosofin.com ↗</a>
        </div>
      </div>
    </div>
    <p class="site-footer-legal">development · v${version} · MIT License · a fork of <a href="https://github.com/tt-a1i/archify" target="_blank" rel="noopener">Archify</a></p>
  </div>
</footer>`;
}

/** Styles for the shared footer, scoped to its own class names. */
export function siteFooterStyles() {
  return `.guide-cli-hint{width:min(1120px,calc(100% - 48px));margin:0 auto 8px;font:400 12px/1.6 'JetBrains Mono',ui-monospace,monospace;color:#8b919c;text-align:center}
.guide-cli-hint code{color:#5c6370}
.site-provenance{width:min(1120px,calc(100% - 48px));margin:0 auto 8px;font:400 12px/1.6 'JetBrains Mono',ui-monospace,monospace;color:#8b919c;text-align:center}
.site-provenance a{color:#5c6370}
.site-footer{border-top:1px solid #e6e8ec;background:#f7f8f9;padding:44px 0;margin-top:96px;
  /* Host pages set different body fonts, so the footer states its own. */
  font-family:'Onest',system-ui,-apple-system,sans-serif}
.site-footer a,.site-footer span,.site-footer p{font-family:inherit}
.site-footer-inner{width:min(1120px,calc(100% - 48px));margin:0 auto}
.site-footer-top{display:flex;flex-wrap:wrap;justify-content:space-between;gap:32px;align-items:flex-start}
.site-footer-brand{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700;color:#0a0b0d;text-decoration:none}
.site-footer-cols{display:flex;gap:40px;flex-wrap:wrap}
.site-footer-col{display:grid;gap:8px;align-content:start}
.site-footer-heading{margin:0;font:600 11px/1 'JetBrains Mono',ui-monospace,monospace !important;letter-spacing:.07em;text-transform:uppercase;color:#8b919c}
.site-footer-col a{font-size:13.5px;color:#5c6370;text-decoration:none}
.site-footer-col a:hover{color:#0bb330}
.site-footer-legal{margin:32px 0 0;padding-top:18px;border-top:1px solid #e6e8ec;font:400 12px/1.6 'JetBrains Mono',ui-monospace,monospace !important;color:#8b919c}
.site-footer-legal a{color:#8b919c;text-decoration:underline}
@media (max-width:720px){.site-footer-cols{gap:28px}.site-footer{margin-top:64px}}`;
}
