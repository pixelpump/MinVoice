import { jsPDF } from 'jspdf';

export interface FontPairing {
  key: string;
  label: string;
  heading: string;
  body: string;
  headingWeight: number;
  bodyWeight: number;
  googleFontsUrl: string;
  ttfUrl: string;
}

const FONT_PAIRINGS: FontPairing[] = [
  {
    key: 'inter',
    label: 'Inter',
    heading: 'Inter',
    body: 'Inter',
    headingWeight: 600,
    bodyWeight: 400,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
    ttfUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz,wght%5D.ttf',
  },
  {
    key: 'spectral-work-sans',
    label: 'Spectral + Work Sans',
    heading: 'Spectral',
    body: 'Work Sans',
    headingWeight: 600,
    bodyWeight: 400,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Spectral:wght@600&family=Work+Sans:wght@400;500&display=swap',
    ttfUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/worksans/WorkSans%5Bwght%5D.ttf',
  },
  {
    key: 'playfair-source-sans',
    label: 'Playfair Display + Source Sans 3',
    heading: 'Playfair Display',
    body: 'Source Sans 3',
    headingWeight: 600,
    bodyWeight: 400,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Source+Sans+3:wght@400;500&display=swap',
    ttfUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/sourcesans3/SourceSans3%5Bwght%5D.ttf',
  },
  {
    key: 'dm-serif-dm-sans',
    label: 'DM Serif Display + DM Sans',
    heading: 'DM Serif Display',
    body: 'DM Sans',
    headingWeight: 400,
    bodyWeight: 400,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap',
    ttfUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/DMSans%5Bopsz,wght%5D.ttf',
  },
  {
    key: 'lora-lato',
    label: 'Lora + Lato',
    heading: 'Lora',
    body: 'Lato',
    headingWeight: 600,
    bodyWeight: 400,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Lora:wght@600&family=Lato:wght@400;700&display=swap',
    ttfUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/lato/Lato-Regular.ttf',
  },
  {
    key: 'cormorant-montserrat',
    label: 'Cormorant Garamond + Montserrat',
    heading: 'Cormorant Garamond',
    body: 'Montserrat',
    headingWeight: 600,
    bodyWeight: 400,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Montserrat:wght@400;500&display=swap',
    ttfUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf',
  },
  {
    key: 'space-grotesk',
    label: 'Space Grotesk',
    heading: 'Space Grotesk',
    body: 'Space Grotesk',
    headingWeight: 500,
    bodyWeight: 400,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500&display=swap',
    ttfUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf',
  },
  {
    key: 'ibm-plex',
    label: 'IBM Plex Serif + IBM Plex Sans',
    heading: 'IBM Plex Serif',
    body: 'IBM Plex Sans',
    headingWeight: 600,
    bodyWeight: 400,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@600&family=IBM+Plex+Sans:wght@400;500&display=swap',
    ttfUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexsans/IBMPlexSans%5Bwght%5D.ttf',
  },
];

const defaultPairing = FONT_PAIRINGS[0];

export function getPairing(key: string): FontPairing {
  return FONT_PAIRINGS.find((p) => p.key === key) ?? defaultPairing;
}

export function getPairings(): FontPairing[] {
  return FONT_PAIRINGS;
}

export function getDefaultPairingKey(): string {
  return defaultPairing.key;
}

let loadedKey: string | null = null;

export function loadFontPairing(key: string): FontPairing {
  const pairing = getPairing(key);
  if (loadedKey === key) return pairing;

  const existing = document.getElementById('minvoice-fonts');
  if (existing) existing.remove();

  const link = document.createElement('link');
  link.id = 'minvoice-fonts';
  link.rel = 'stylesheet';
  link.href = pairing.googleFontsUrl;
  document.head.appendChild(link);

  loadedKey = key;
  return pairing;
}

export function applyFontPairingStyles(key: string): void {
  const pairing = getPairing(key);
  const root = document.documentElement;
  root.style.setProperty('--font-heading', `"${pairing.heading}", serif`);
  root.style.setProperty('--font-body', `"${pairing.body}", sans-serif`);
  root.style.setProperty('--font-heading-weight', String(pairing.headingWeight));
  root.style.setProperty('--font-body-weight', String(pairing.bodyWeight));
}

// ── PDF font embedding ──

const fontCache = new Map<string, string>();
const registeredFonts = new Set<string>();

async function fetchFontBase64(url: string): Promise<string> {
  if (fontCache.has(url)) return fontCache.get(url)!;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Font fetch failed: ${resp.status}`);
  const buf = await resp.arrayBuffer();

  // Convert ArrayBuffer to base64 string
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  fontCache.set(url, base64);
  return base64;
}

export async function registerFontForPDF(pdf: jsPDF, key: string): Promise<string> {
  const pairing = getPairing(key);
  const fontName = 'CustomBody';
  const vfsKey = `${fontName}.ttf`;

  if (registeredFonts.has(fontName)) {
    return fontName;
  }

  try {
    const base64 = await fetchFontBase64(pairing.ttfUrl);
    pdf.addFileToVFS(vfsKey, base64);
    pdf.addFont(vfsKey, fontName, 'normal');
    pdf.addFont(vfsKey, fontName, 'bold');
    registeredFonts.add(fontName);
    return fontName;
  } catch {
    // Fallback: use built-in font
    // Detect serif vs sans-serif from the font name
    const serifFonts = ['spectral', 'playfair', 'lora', 'cormorant', 'ibmplexserif', 'dmserifdisplay'];
    const isSerif = serifFonts.some((s) => pairing.body.toLowerCase().replace(/ /g, '').includes(s));
    return isSerif ? 'times' : 'helvetica';
  }
}
