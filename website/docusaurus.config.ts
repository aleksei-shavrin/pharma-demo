import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import crossRefAutolink from './src/remark/cross-ref-autolink.mjs';
import demoteOutOfTreeLinks from './src/remark/demote-out-of-tree-links.mjs';

// Publish _templates (default GlobExclude drops underscore directories).
const docsExclude = [
  '**/_*.{js,jsx,ts,tsx,md,mdx}',
  '**/*.test.{js,jsx,ts,tsx}',
  '**/__tests__/**',
];

// demote first: repo-file links → code; then ID autolink on remaining text.
const docsRemarkPlugins = [demoteOutOfTreeLinks, crossRefAutolink];

/**
 * Join deployment baseUrl once onto a site path (routeBasePath `/`).
 * Avoids `/portal/` + hardcoded `/portal/DOC-…` skipping prepend, and
 * avoids baking `/docs/` into links when CI uses baseUrl `/portal/`.
 */
function withDocsBase(sitePath: string): string {
  const base = process.env.DOCUSAURUS_BASE_URL ?? '/';
  const path = sitePath.startsWith('/') ? sitePath : `/${sitePath}`;
  if (base === '/') return path;
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${b}${path}`;
}

const config: Config = {
  title: 'Pharma Demo',
  tagline: 'инженерная документация',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // Compose: DOCUSAURUS_BASE_URL=/docs/ ; alternate deploy: /portal/ ; local ADR-0003: /
  // Registry/footer store site paths; join base once (see withDocsBase / remark).
  url: process.env.DOCUSAURUS_URL ?? 'http://docs.localhost',
  baseUrl: process.env.DOCUSAURUS_BASE_URL ?? '/',

  organizationName: 'pharma-demo',
  projectName: 'pharma-demo',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'ru',
    locales: ['ru'],
  },

  markdown: {
    mermaid: true,
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: [
    '@docusaurus/theme-mermaid',
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['ru', 'en'],
        indexBlog: false,
        docsRouteBasePath: ['/', 'openspec'],
        docsDir: ['../docs', '../openspec/specs'],
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          path: '../docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          exclude: docsExclude,
          beforeDefaultRemarkPlugins: docsRemarkPlugins,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'openspec',
        path: '../openspec/specs',
        routeBasePath: 'openspec',
        sidebarPath: './sidebarsOpenSpec.ts',
        beforeDefaultRemarkPlugins: docsRemarkPlugins,
        // Publish living specs only; never include OpenSpec change drafts.
        exclude: [
          ...docsExclude,
          '**/changes/**',
          '**/changes',
          '**/archive/**',
        ],
      },
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Pharma Demo',
      logo: {
        alt: 'Pharma Demo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/',
          label: 'Обзор',
          position: 'left',
        },
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Документация',
        },
        {
          type: 'docSidebar',
          sidebarId: 'openspecSidebar',
          docsPluginId: 'openspec',
          position: 'left',
          label: 'OpenSpec',
        },
        {
          type: 'doc',
          docId: 'standards/DOC-STD-001',
          label: 'Стандарт',
          position: 'left',
        },
        {
          type: 'doc',
          docId: 'guides/DOC-GUIDES-README-001',
          label: 'Гайды',
          position: 'left',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Документация',
          items: [
            {
              // docs/README.md index at site `/` (joined with baseUrl once).
              label: 'Карта docs',
              to: withDocsBase('/'),
            },
            {
              // Site path `/portal/DOC-PORTAL-HOME-001` — not deployment prefix.
              label: 'Портал',
              to: withDocsBase('/portal/DOC-PORTAL-HOME-001'),
            },
            {
              label: 'OpenSpec',
              to: withDocsBase('/openspec/'),
            },
          ],
        },
        {
          title: 'Стандарты',
          items: [
            {
              label: 'Документация',
              to: withDocsBase('/standards/DOC-STD-001'),
            },
            {
              label: 'Терминология',
              to: withDocsBase('/standards/DOC-STD-002'),
            },
            {
              label: 'Шаблоны',
              to: withDocsBase('/_templates/'),
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Pharma Demo. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
