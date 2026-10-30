import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Publish _templates (default GlobExclude drops underscore directories).
const docsExclude = [
  '**/_*.{js,jsx,ts,tsx,md,mdx}',
  '**/*.test.{js,jsx,ts,tsx}',
  '**/__tests__/**',
];

const config: Config = {
  title: 'Pharma Project Control',
  tagline: 'инженерная документация',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'http://docs.localhost',
  baseUrl: '/',

  organizationName: 'pharma-project-control',
  projectName: 'pharma-project-control',

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
        docsRouteBasePath: ['docs', 'openspec'],
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
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          exclude: docsExclude,
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
      title: 'Pharma Project Control',
      logo: {
        alt: 'Pharma Project Control',
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
              label: 'Карта docs',
              to: '/docs/',
            },
            {
              label: 'Портал',
              to: '/docs/portal/DOC-PORTAL-HOME-001',
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
              to: '/docs/standards/DOC-STD-001',
            },
            {
              label: 'Терминология',
              to: '/docs/standards/DOC-STD-002',
            },
            {
              label: 'Шаблоны',
              to: '/docs/_templates/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Pharma Project Control. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
