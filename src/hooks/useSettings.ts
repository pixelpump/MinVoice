import { useLiveQuery } from 'dexie-react-hooks';
import { useState, useCallback, useEffect } from 'react';
import { getSettings, saveSettings } from '../lib/db';
import { loadFontPairing, applyFontPairingStyles, getDefaultPairingKey } from '../lib/fonts';
import type { Settings } from '../lib/types';

const defaultSettings: Settings = {
  businessName: '',
  businessEmail: '',
  businessAddress: '',
  businessPhone: '',
  logo: '',
  defaultCurrency: 'USD',
  defaultTaxRate: 0,
  defaultDueDays: 30,
  invoicePrefix: 'INV-',
  nextNumber: 1,
  primaryColor: '#1a1a2e',
  fontPairing: getDefaultPairingKey(),
};

export function useSettings() {
  const settings = useLiveQuery(() => getSettings(), []);
  const [loading, setLoading] = useState(false);

  const resolved = settings ?? defaultSettings;

  useEffect(() => {
    const key = resolved.fontPairing || getDefaultPairingKey();
    loadFontPairing(key);
    applyFontPairingStyles(key);
  }, [resolved.fontPairing]);

  const save = useCallback(async (s: Settings) => {
    setLoading(true);
    await saveSettings(s);
    setLoading(false);
  }, []);

  return {
    settings: resolved,
    loading,
    save,
    isConfigured: !!settings?.businessName,
  };
}
