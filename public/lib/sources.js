// Numbered sources shown on the card. Wording on the card is our own; these pages are where
// a reader can check the advice. `checked` is the date the page was last opened by the team.

export const SOURCES = [
  {
    n: 1,
    org: 'Earthquake Country Alliance',
    title: 'Step 1: Secure your space',
    url: 'https://www.earthquakecountry.org/step1/',
    checked: '2026-10-11',
  },
  {
    n: 2,
    org: 'Great ShakeOut',
    title: 'Drop, Cover, and Hold On',
    url: 'https://www.shakeout.org/dropcoverholdon/',
    checked: '2026-10-11',
  },
  {
    n: 3,
    org: 'Earthquake Country Alliance',
    title: 'Step 3: Organize disaster supplies',
    url: 'https://www.earthquakecountry.org/step3/',
    checked: '2026-10-11',
  },
  {
    n: 4,
    org: 'AFAD',
    title: 'Emergency assembly area lookup (e-Devlet, login required)',
    url: 'https://www.turkiye.gov.tr/afet-ve-acil-durum-yonetimi-acil-toplanma-alani-sorgulama',
    checked: '2026-10-11',
  },
  {
    n: 5,
    org: 'Earthquake Country Alliance',
    title: 'Step 2: Plan to be safe',
    url: 'https://www.earthquakecountry.org/step2/',
    checked: '2026-10-11',
  },
  {
    n: 6,
    org: 'Republic of Turkey, Law No. 6306',
    title: 'Law on the Transformation of Areas under Disaster Risk, Article 3(1), as amended by Law No. 7471',
    url: 'https://www.mevzuat.gov.tr/MevzuatMetin/1.5.6306.pdf',
    checked: '2026-10-11',
  },
];

export const APP_RULE = 'App rule';

export function sourceByNumber(n) {
  return SOURCES.find((s) => s.n === n);
}

export function tagLabel(n) {
  const s = sourceByNumber(n);
  return `[${s.n}] ${s.org}, ${s.title}`;
}
