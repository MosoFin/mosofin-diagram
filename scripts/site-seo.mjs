// One SEO head for every page on diagram.mosofin.com.
//
// Each page gets the same set: canonical URL, robots, Open Graph, Twitter card
// and JSON-LD structured data. Pages come from several templates and one is
// hand-authored, so the tags live here once instead of drifting per page.

export const SITE_URL = 'https://diagram.mosofin.com';
export const SITE_NAME = 'MosoFin-diagram';
export const REPO_URL = 'https://github.com/MosoFin/mosofin-diagram';
const SOCIAL_IMAGE = {
  url: `${SITE_URL}/assets/mosofin-social-preview.png`,
  width: 1200,
  height: 630,
  alt: 'A MosoFin-diagram business operating map: procure to pay, order to cash and record to report meeting at the bank.',
};

const escapeAttr = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[c]);

// JSON inside <script> must not be able to close the element.
const scriptJson = (value) => JSON.stringify(value, null, 2)
  .replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026');

export function absoluteUrl(pathname = '/') {
  return new URL(pathname, `${SITE_URL}/`).href;
}

const publisher = { '@type': 'Organization', name: 'MosoFin', url: 'https://mosofin.com/' };

export function breadcrumb(name, pathname) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name, item: absoluteUrl(pathname) },
    ],
  };
}

export function softwareApplication(version) {
  return {
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Business diagram agent skill',
    operatingSystem: 'Windows, macOS, Linux',
    softwareVersion: version,
    description: 'A free, open-source agent skill that turns a short interview about a business into a validated, self-contained diagram of how it runs.',
    url: absoluteUrl('/'),
    downloadUrl: `${REPO_URL}/raw/main/mosofin.zip`,
    license: `${REPO_URL}/blob/main/LICENSE`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher,
  };
}

/**
 * The head block for one page.
 * @param {object} page
 * @param {string} page.path       site path, e.g. "/gallery.html"
 * @param {string} page.title      the <title> text (also og:title)
 * @param {string} page.description meta and social description, ideally 110–160 characters
 * @param {object[]} [page.jsonLd]  schema.org nodes for this page
 * @param {string} [page.markdown]   site path of this page's Markdown twin, for agents
 */
export function seoHead({ path, title, description, jsonLd = [], markdown = null }) {
  if (!path || !title || !description) throw new Error('seoHead: path, title and description are required');
  const url = absoluteUrl(path);
  const graph = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', '@id': `${absoluteUrl('/')}#website`, name: SITE_NAME, url: absoluteUrl('/'), inLanguage: 'en', publisher },
    ...jsonLd,
  ] };
  return [
    `<link rel="canonical" href="${escapeAttr(url)}">`,
    ...(markdown ? [`<link rel="alternate" type="text/markdown" href="${escapeAttr(absoluteUrl(markdown))}" title="Markdown version">`] : []),
    `<link rel="alternate" type="text/plain" href="${absoluteUrl('/llms.txt')}" title="llms.txt: site summary for AI agents">`,
    '<meta name="robots" content="index, follow, max-image-preview:large">',
    '<meta property="og:type" content="website">',
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    '<meta property="og:locale" content="en_US">',
    `<meta property="og:title" content="${escapeAttr(title)}">`,
    `<meta property="og:description" content="${escapeAttr(description)}">`,
    `<meta property="og:url" content="${escapeAttr(url)}">`,
    `<meta property="og:image" content="${SOCIAL_IMAGE.url}">`,
    `<meta property="og:image:width" content="${SOCIAL_IMAGE.width}">`,
    `<meta property="og:image:height" content="${SOCIAL_IMAGE.height}">`,
    `<meta property="og:image:alt" content="${escapeAttr(SOCIAL_IMAGE.alt)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeAttr(title)}">`,
    `<meta name="twitter:description" content="${escapeAttr(description)}">`,
    `<meta name="twitter:image" content="${SOCIAL_IMAGE.url}">`,
    `<meta name="twitter:image:alt" content="${escapeAttr(SOCIAL_IMAGE.alt)}">`,
    `<script type="application/ld+json">\n${scriptJson(graph)}\n  </script>`,
  ].map((line) => `  ${line}`).join('\n');
}
