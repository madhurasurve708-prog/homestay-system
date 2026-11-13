import React, { useState } from 'react';
import {
  CheckCircle2,
  Database,
  Globe,
  RotateCcw,
  Save,
  Upload,
} from 'lucide-react';
import { DemoNoticeBanner } from '../components/DemoNoticeBanner';
import { PropertyPhoto } from '../components/PropertyPhoto';
import { PHOTO_ASSET_LIST } from '../data/photoAssets';
import type { PropertySettings } from '../types/hms';

interface SettingsPageProps {
  settings: PropertySettings;
  customPhotoOverrides: Record<string, string>;
  onUpdateSettings: (patch: Partial<PropertySettings>) => void;
  onSetPhotoOverride: (photoId: string, dataUrl: string | null) => void;
  onResetDemo: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  customPhotoOverrides,
  onUpdateSettings,
  onSetPhotoOverride,
  onResetDemo,
}) => {
  const [form, setForm] = useState<PropertySettings>(settings);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handlePhotoUpload = (
    photoId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSetPhotoOverride(photoId, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <DemoNoticeBanner
        title="Hotel Details & Photo Settings"
        message="Here you can set your hotel name, address, phone number, standard room prices, and test uploading photos of Sunshine Home Stay."
      />

      {savedNotice && (
        <div className="flex items-center gap-2 rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-950 shadow-md">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          Hotel details saved successfully!
        </div>
      )}

      {/* Hotel Profile & Standard Rates */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl border-2 border-stone-200 bg-white p-6 shadow-sm space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4">
          <div>
            <h3 className="font-display text-xl font-bold text-stone-900">
              Hotel Information &amp; Standard Prices
            </h3>
            <p className="text-xs sm:text-sm text-stone-600">
              Hotel address, phone number, check-in time, and daily room rates
            </p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f292e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#173a41] shadow-xs active:scale-[0.98]"
          >
            <Save className="h-4 w-4 text-amber-300" />
            Save Details
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-bold text-stone-700">
              Hotel Name
            </label>
            <input
              type="text"
              value={form.propertyName}
              onChange={(e) => setForm({ ...form, propertyName: e.target.value })}
              className="w-full rounded-xl border-2 border-stone-300 px-3.5 py-2.5 text-sm font-bold text-stone-900"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs sm:text-sm font-bold text-stone-700">
              Hotel Address &amp; Landmark
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-xl border-2 border-stone-300 px-3.5 py-2.5 text-sm text-stone-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-bold text-stone-700">
              Contact Phone Number
            </label>
            <input
              type="text"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              className="w-full rounded-xl border-2 border-stone-300 px-3.5 py-2.5 text-sm text-stone-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-bold text-stone-700">
              Check-In Time
            </label>
            <input
              type="text"
              value={form.checkInTime}
              onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
              className="w-full rounded-xl border-2 border-stone-300 px-3.5 py-2.5 text-sm text-stone-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-bold text-stone-700">
              Check-Out Time
            </label>
            <input
              type="text"
              value={form.checkOutTime}
              onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
              className="w-full rounded-xl border-2 border-stone-300 px-3.5 py-2.5 text-sm text-stone-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-bold text-stone-700">
              Default AC Room Price (₹)
            </label>
            <input
              type="number"
              value={form.defaultAcRate}
              onChange={(e) =>
                setForm({ ...form, defaultAcRate: Number(e.target.value) })
              }
              className="w-full rounded-xl border-2 border-stone-300 px-3.5 py-2.5 text-sm font-bold text-stone-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-bold text-stone-700">
              Default Non-AC Room Price (₹)
            </label>
            <input
              type="number"
              value={form.defaultNonAcRate}
              onChange={(e) =>
                setForm({ ...form, defaultNonAcRate: Number(e.target.value) })
              }
              className="w-full rounded-xl border-2 border-stone-300 px-3.5 py-2.5 text-sm font-bold text-stone-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-bold text-stone-700">
              GST / Tax Percentage (%)
            </label>
            <input
              type="number"
              min={0}
              max={28}
              value={form.defaultTaxPercent}
              onChange={(e) =>
                setForm({ ...form, defaultTaxPercent: Number(e.target.value) })
              }
              className="w-full rounded-xl border-2 border-stone-300 px-3.5 py-2.5 text-sm font-bold text-stone-900"
            />
          </div>
        </div>
      </form>

      {/* Real Photos vs Placeholders */}
      <section className="rounded-2xl border-2 border-stone-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-display text-xl font-bold text-stone-900">
            Hotel Photographs (Real Photos &amp; Test Slots)
          </h3>
          <p className="text-xs sm:text-sm text-stone-600">
            Real, verified photos of Sunshine Home Stay, Malvan are shown below.
            You can click &ldquo;Test Owner Photo&rdquo; to test putting any photo from your phone or computer.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PHOTO_ASSET_LIST.map((asset) => {
            const hasOverride = Boolean(customPhotoOverrides[asset.id]);
            return (
              <div
                key={asset.id}
                className="flex flex-col overflow-hidden rounded-2xl border-2 border-stone-200 bg-stone-50/50 shadow-2xs"
              >
                <PropertyPhoto
                  photoId={asset.id}
                  customOverrides={customPhotoOverrides}
                  aspectClass="aspect-[16/10]"
                />
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-stone-900">
                        {asset.label}
                      </h4>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          asset.verified || hasOverride
                            ? 'bg-emerald-100 text-emerald-950'
                            : 'bg-amber-100 text-amber-950'
                        }`}
                      >
                        {hasOverride
                          ? 'Uploaded'
                          : asset.verified
                          ? 'Real Photo'
                          : 'Photo Slot'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-stone-600">
                      {asset.sourceNote}
                    </p>
                  </div>

                  <div className="mt-3.5 flex items-center gap-2.5 border-t border-stone-200 pt-3">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-800 hover:bg-stone-50">
                      <Upload className="h-3.5 w-3.5" />
                      Test My Own Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(asset.id, e)}
                        className="hidden"
                      />
                    </label>
                    {hasOverride && (
                      <button
                        type="button"
                        onClick={() => onSetPhotoOverride(asset.id, null)}
                        className="text-xs font-bold text-rose-700 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Online Booking Apps & Reset */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border-2 border-stone-200 bg-white p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <Globe className="h-5 w-5 text-[#0f292e]" />
            <h3 className="font-display text-lg font-bold text-stone-900">
              Online Booking Apps (Coming in Phase 2)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            In the final stage, we will connect the system to an Indian Channel Manager so your MakeMyTrip and Goibibo bookings sync automatically without any double booking:
          </p>
          <div className="space-y-2 mt-2">
            {[
              {
                name: 'MakeMyTrip & Goibibo 2-Way Sync',
                status: 'Planned for Phase 2',
              },
              {
                name: 'Booking.com & Agoda Sync',
                status: 'Planned for Phase 2',
              },
              {
                name: 'UPI / QR Code & Online Payments',
                status: 'Planned for Phase 2',
              },
            ].map((item) => (
              <div
                key={item.name}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs sm:text-sm"
              >
                <span className="font-bold text-stone-800">{item.name}</span>
                <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-semibold text-stone-700">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border-2 border-stone-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Database className="h-5 w-5 text-[#c27d38]" />
              <h3 className="font-display text-lg font-bold text-stone-900">
                Reset Demo Data Anytime
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              If you want to clear your test bookings and restore the original 15 sample rooms and guests, click the reset button below anytime.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
            <div>
              <p className="text-sm font-bold text-amber-950">
                Start Fresh with Sample Data
              </p>
              <p className="text-xs text-amber-900">
                Restores original 15 rooms, sample bookings &amp; bills.
              </p>
            </div>
            <button
              type="button"
              onClick={onResetDemo}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-amber-900 shadow-xs"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
