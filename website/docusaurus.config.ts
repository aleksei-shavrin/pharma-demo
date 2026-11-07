import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import crossRefAutolink from './src/remark/cross-ref-autolink.mjs';

// Publish _templates (default GlobExclude drops underscore directories).
const docsExclude = [
  '**/_*.{js,jsx,ts,tsx,md,mdx}',
  '**/*.test.{js,jsx,ts,tsx}',
  '**/__tests__/**',
];

const docsRemarkPlugins = [crossRefAutolink];

const config: Config = {
  title: 'Pharma Demo',
  tagline: 'инженерная документация',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // Server Compose: DOCUSAURUS_URL + DOCUSAURUS_BASE_URL=/docs/
  // Local ADR-0003 defaults: docs.localhost + /
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
              // Root docs/README.md (id DOC-PORTAL-001) is the docs index at `/`,
              // not a `/DOC-PORTAL-001` slug — registry href is `/docs/` under compose baseUrl.
              label: 'Карта docs',
              to: '/',
            },
            {
              label: 'Портал',
              to: '/portal/DOC-PORTAL-HOME-001',
            },
            {
              label: 'OpenSpec',
              to: '/openspec/',
            },
          ],
        },
        {
          title: 'Стандарты',
          items: [
            {
              label: 'Документация',
              to: '/standards/DOC-STD-001',
            },
            {
              label: 'Терминология',
              to: '/standards/DOC-STD-002',
            },
            {
              label: 'Шаблоны',
              to: '/_templates/',
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
