import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TOOLS } from '../src/data/tools.ts';
import { CATEGORIES } from '../src/data/categories.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const BASE_URL = 'https://novatools.app';
const currentDate = new Date().toISOString().split('T')[0];

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

const entries: SitemapEntry[] = [
  // Core pages
  { loc: `${BASE_URL}/`, lastmod: currentDate, changefreq: 'daily', priority: '1.0' },
  { loc: `${BASE_URL}/studio`, lastmod: currentDate, changefreq: 'daily', priority: '0.9' },
  { loc: `${BASE_URL}/bot`, lastmod: currentDate, changefreq: 'daily', priority: '0.9' },
  { loc: `${BASE_URL}/directory`, lastmod: currentDate, changefreq: 'weekly', priority: '0.8' },
  { loc: `${BASE_URL}/categories`, lastmod: currentDate, changefreq: 'weekly', priority: '0.8' },
  { loc: `${BASE_URL}/popular`, lastmod: currentDate, changefreq: 'weekly', priority: '0.8' },
  { loc: `${BASE_URL}/guides`, lastmod: currentDate, changefreq: 'weekly', priority: '0.7' },
  { loc: `${BASE_URL}/about`, lastmod: currentDate, changefreq: 'monthly', priority: '0.6' },
  { loc: `${BASE_URL}/privacy`, lastmod: currentDate, changefreq: 'monthly', priority: '0.5' },
  { loc: `${BASE_URL}/terms`, lastmod: currentDate, changefreq: 'monthly', priority: '0.5' },
  { loc: `${BASE_URL}/cookies`, lastmod: currentDate, changefreq: 'monthly', priority: '0.4' },
  { loc: `${BASE_URL}/disclaimer`, lastmod: currentDate, changefreq: 'monthly', priority: '0.4' },
  { loc: `${BASE_URL}/contact`, lastmod: currentDate, changefreq: 'monthly', priority: '0.5' },
];

// Add all categories
for (const cat of CATEGORIES) {
  entries.push({
    loc: `${BASE_URL}/categories/${cat.id}`,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: '0.8',
  });
}

// Add all 89+ tools from data/tools.ts
for (const tool of TOOLS) {
  entries.push({
    loc: `${BASE_URL}/tools/${tool.slug}`,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: tool.isPopular ? '0.9' : '0.8',
  });
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    entry => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
console.log(`Generated public/sitemap.xml with ${entries.length} URLs.`);

const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');
console.log(`Generated public/robots.txt pointing to ${BASE_URL}/sitemap.xml.`);
