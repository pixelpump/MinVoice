import { useState, type FormEvent, useRef } from 'react';
import { useSettings } from '../hooks/useSettings';
import { exportAllData, importAllData } from '../lib/db';
import { getPairings } from '../lib/fonts';
import type { Settings } from '../lib/types';

export default function SettingsPage() {
  const { settings, save } = useSettings();
  const [saved, setSaved] = useState(false);
  const [importError, setImportError] = useState('');
  const [exporting, setExporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const updated: Settings = {
      id: settings.id,
      businessName: form.get('businessName') as string,
      businessEmail: form.get('businessEmail') as string,
      businessAddress: form.get('businessAddress') as string,
      businessPhone: form.get('businessPhone') as string,
      logo: settings.logo,
      defaultCurrency: form.get('defaultCurrency') as string,
      defaultTaxRate: Number(form.get('defaultTaxRate')) || 0,
      defaultDueDays: Number(form.get('defaultDueDays')) || 30,
      invoicePrefix: form.get('invoicePrefix') as string,
      nextNumber: Number(form.get('nextNumber')) || 1,
      primaryColor: form.get('primaryColor') as string,
      fontPairing: settings.fontPairing,
    };
    await save(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      save({ ...settings, logo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleExport = async () => {
    setExporting(true);
    const json = await exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minvoice-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importAllData(text);
      setImportError('');
      window.location.reload();
    } catch {
      setImportError('Invalid backup file.');
    }
  };

  const defaultValues = {
    businessName: settings.businessName,
    businessEmail: settings.businessEmail,
    businessAddress: settings.businessAddress,
    businessPhone: settings.businessPhone,
    defaultCurrency: settings.defaultCurrency,
    defaultTaxRate: settings.defaultTaxRate,
    defaultDueDays: settings.defaultDueDays,
    invoicePrefix: settings.invoicePrefix,
    nextNumber: settings.nextNumber,
    primaryColor: settings.primaryColor,
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-lg">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Settings</h2>
        <p className="text-sm text-muted mt-1">Business information and defaults</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 sm:space-y-6">
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Logo</label>
          <div className="flex items-center gap-4">
            {settings.logo && (
              <img src={settings.logo} alt="Logo" className="h-10 object-contain" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Business Name</label>
          <input
            name="businessName"
            type="text"
            defaultValue={defaultValues.businessName}
            placeholder="Your Business Inc."
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              name="businessEmail"
              type="email"
              defaultValue={defaultValues.businessEmail}
              placeholder="hello@yourbusiness.com"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
            <input
              name="businessPhone"
              type="text"
              defaultValue={defaultValues.businessPhone}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Address</label>
          <textarea
            name="businessAddress"
            defaultValue={defaultValues.businessAddress}
            rows={2}
            placeholder="123 Main St&#10;New York, NY 10001"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
          />
        </div>

        <hr className="border-border" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Default Currency
            </label>
            <input
              name="defaultCurrency"
              type="text"
              defaultValue={defaultValues.defaultCurrency}
              placeholder="USD"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Default Tax Rate (%)
            </label>
            <input
              name="defaultTaxRate"
              type="number"
              defaultValue={defaultValues.defaultTaxRate}
              min={0}
              max={100}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Default Due (days)
            </label>
            <input
              name="defaultDueDays"
              type="number"
              defaultValue={defaultValues.defaultDueDays}
              min={1}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                name="primaryColor"
                type="color"
                defaultValue={defaultValues.primaryColor}
                className="w-10 h-10 rounded border border-border cursor-pointer shrink-0"
              />
              <input
                type="text"
                readOnly
                value={defaultValues.primaryColor}
                className="flex-1 min-w-0 px-3 py-2 border border-border rounded-lg text-sm font-mono bg-neutral-50"
              />
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Font Pairing */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Invoice Font
          </label>
          <div className="grid grid-cols-2 gap-2">
            {getPairings().map((pairing) => {
              const isActive = (settings.fontPairing || 'inter') === pairing.key;
              const headingW = pairing.headingWeight;
              const bodyW = pairing.bodyWeight;
              return (
                <button
                  key={pairing.key}
                  type="button"
                  onClick={() => save({ ...settings, fontPairing: pairing.key })}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    isActive
                      ? 'border-accent bg-accent/5 ring-1 ring-accent/20'
                      : 'border-border hover:border-neutral-300'
                  }`}
                >
                  <div className="text-xs font-semibold text-neutral-700 mb-1">
                    {pairing.label}
                  </div>
                  <div className="space-y-0.5">
                    <div
                      style={{ fontFamily: `"${pairing.heading}", serif`, fontWeight: headingW }}
                      className="text-sm text-neutral-900 truncate"
                    >
                      {pairing.heading}
                    </div>
                    <div
                      style={{ fontFamily: `"${pairing.body}", sans-serif`, fontWeight: bodyW }}
                      className="text-xs text-muted truncate"
                    >
                      {pairing.body}
                    </div>
                  </div>
                  {isActive && (
                    <div className="mt-1.5 text-[10px] text-accent font-medium">Active</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-border" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Invoice Prefix
            </label>
            <input
              name="invoicePrefix"
              type="text"
              defaultValue={defaultValues.invoicePrefix}
              placeholder="INV-"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white font-mono focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Next Invoice #
            </label>
            <input
              name="nextNumber"
              type="number"
              defaultValue={defaultValues.nextNumber}
              min={1}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white font-mono focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex items-center gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-accent rounded-lg hover:opacity-90 transition-opacity"
          >
            Save Settings
          </button>
          {saved && (
            <span className="text-sm text-emerald-600 font-medium">Saved!</span>
          )}
        </div>
      </form>

      {/* Data management */}
      <div className="pt-6 border-t border-border">
        <h3 className="text-sm font-semibold text-neutral-800 mb-3">Data Management</h3>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Export All Data'}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Import Data
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
        {importError && (
          <p className="mt-2 text-sm text-red-600">{importError}</p>
        )}
      </div>
    </div>
  );
}
