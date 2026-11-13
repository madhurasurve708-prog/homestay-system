import React from 'react';
import { Info } from 'lucide-react';

interface DemoNoticeBannerProps {
  title?: string;
  message: string;
}

export const DemoNoticeBanner: React.FC<DemoNoticeBannerProps> = ({
  title = 'Interactive Demo Mode',
  message,
}) => {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-xs text-amber-950">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
      <div className="leading-relaxed">
        <span className="font-semibold">{title}: </span>
        <span className="text-amber-900/90">{message}</span>
      </div>
    </div>
  );
};

