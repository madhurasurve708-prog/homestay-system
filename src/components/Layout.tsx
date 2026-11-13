import React, { useState } from 'react';
import {
  BarChart3,
  BedDouble,
  CalendarDays,
  CalendarPlus,
  ClipboardCheck,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  Menu,
  ReceiptIndianRupee,
  RotateCcw,
  Settings,
  Sun,
  UserCheck,
  X,
} from 'lucide-react';
import type { NavSection, PropertySettings } from '../types/hms';
import { formatFullDate, getTodayISO } from '../utils/dateUtils';

interface LayoutProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  onOpenNewBooking: () => void;
  onResetDemo: () => void;
  settings: PropertySettings;
  children: React.ReactNode;
}

const NAV_ITEMS: {
  id: NavSection;
  label: string;
  sublabel: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: "1. Today's Summary", sublabel: 'See all rooms & hotel counts', icon: LayoutDashboard },
  { id: 'rooms', label: '2. All 15 Rooms', sublabel: 'Room 101 to 115 prices & status', icon: BedDouble },
  { id: 'checkin', label: '3. Check In & Out', sublabel: 'Give room keys & take bills', icon: UserCheck },
  { id: 'bookings', label: '4. Bookings List', sublabel: 'Phone, WhatsApp & online guests', icon: ClipboardCheck },
  { id: 'calendar', label: '5. Date Calendar', sublabel: 'See which days are free or full', icon: CalendarDays },
  { id: 'billing', label: '6. Food & Bills', sublabel: 'Add meals, tea & print guest bill', icon: ReceiptIndianRupee },
  { id: 'reports', label: '7. Money Reports', sublabel: 'Daily & monthly collection', icon: BarChart3 },
  { id: 'settings', label: '8. Hotel Info', sublabel: 'Address, phone & photos', icon: Settings },
];

export const Layout: React.FC<LayoutProps> = ({
  activeSection,
  onNavigate,
  onOpenNewBooking,
  onResetDemo,
  settings,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const today = getTodayISO();

  const currentNav = NAV_ITEMS.find((item) => item.id === activeSection);

  const handleSelect = (id: NavSection) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen bg-[#faf8f5] text-stone-900 font-sans">
      {/* Desktop Sidebar with clear large items */}
      <aside className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:border-r lg:border-stone-200/80 lg:bg-[#0f292e] lg:text-stone-100">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/30">
              <Sun className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-bold tracking-tight text-white">
                {settings.propertyName}
              </h1>
              <p className="flex items-center gap-1 text-xs text-amber-200 font-medium">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                {settings.city}, Maharashtra
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-1.5 text-xs text-stone-200">
            <span className="font-bold text-amber-300">Easy Hotel System</span>
            <span className="rounded-full bg-amber-400/25 px-2 py-0.5 text-[11px] font-bold text-amber-200">
              Sample Demo
            </span>
          </div>
        </div>

        {/* Clear Step-by-Step Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3.5 py-4">
          <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-teal-200/70">
            Main Pages (Click Any Page)
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-left transition-all ${
                  active
                    ? 'bg-white text-[#0f292e] shadow-md font-bold'
                    : 'text-stone-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    active ? 'bg-[#c27d38] text-white' : 'bg-white/10 text-teal-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-tight">{item.label}</p>
                  <p
                    className={`truncate text-xs ${
                      active ? 'text-stone-600 font-medium' : 'text-stone-400'
                    }`}
                  >
                    {item.sublabel}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-white/10 p-4 space-y-2.5">
          <button
            type="button"
            onClick={onOpenNewBooking}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c27d38] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#b06d2c] active:scale-[0.98]"
          >
            <CalendarPlus className="h-5 w-5" />
            + Book a Room Now
          </button>
          <button
            type="button"
            onClick={onResetDemo}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-stone-300 transition hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Sample Data
          </button>
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 flex w-80 max-w-[85vw] flex-col bg-[#0f292e] text-stone-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Sun className="h-6 w-6 text-amber-300" />
                <div>
                  <p className="font-display text-base font-bold text-white">
                    {settings.propertyName}
                  </p>
                  <p className="text-xs text-amber-200">Malvan • Simple Menu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-stone-300 hover:bg-white/10"
                aria-label="Close navigation menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-left transition ${
                      active
                        ? 'bg-white text-[#0f292e] font-bold shadow-md'
                        : 'text-stone-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${
                        active ? 'text-[#c27d38]' : 'text-teal-200'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-bold">{item.label}</p>
                      <p
                        className={`text-xs ${
                          active ? 'text-stone-600' : 'text-stone-400'
                        }`}
                      >
                        {item.sublabel}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-white/10 p-4 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenNewBooking();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c27d38] px-4 py-3 text-sm font-bold text-white shadow-md"
              >
                <CalendarPlus className="h-5 w-5" />
                + Book a Room Now
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDemo();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/20 px-3 py-2 text-xs font-medium text-stone-300"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to Sample Data
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header with Large Readable Information */}
        <header className="sticky top-0 z-30 border-b border-stone-200/90 bg-[#faf8f5]/95 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-800 shadow-xs lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5 text-[#0f292e]" />
                <span className="text-xs font-bold">Menu</span>
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h2 className="truncate font-display text-xl font-bold text-stone-900 sm:text-2xl">
                    {currentNav?.label.replace(/^\d+\.\s*/, '')}
                  </h2>
                  <span className="hidden sm:inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-0.5 text-xs font-bold text-amber-900">
                    Sample Data Demo
                  </span>
                </div>
                <p className="truncate text-xs text-stone-600 sm:text-sm">
                  {settings.propertyName} • Malvan • Today: {formatFullDate(today)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onOpenNewBooking}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f292e] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#173a41] active:scale-[0.98] sm:px-5 sm:text-sm"
              >
                <CalendarPlus className="h-4 w-4 text-amber-300" />
                <span>+ Book Room</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </main>

        {/* Senior-Friendly Quick Helper Footer */}
        <footer className="border-t border-stone-200 bg-white/70 py-4 px-6 text-center text-xs text-stone-600">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <HelpCircle className="h-4 w-4 text-stone-400" />
            <span>
              <strong>Hotel Owner Guide:</strong> Click any page on the left menu. You can test checking in guests, viewing rooms, or printing bills.
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};
