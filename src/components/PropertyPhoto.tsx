import React, { useState } from 'react';
import { Camera, CheckCircle2, ImageOff } from 'lucide-react';
import { PHOTO_ASSETS } from '../data/photoAssets';

interface PropertyPhotoProps {
  photoId: string;
  customOverrides?: Record<string, string>;
  className?: string;
  aspectClass?: string;
  showBadge?: boolean;
  slotTitle?: string;
}

export const PropertyPhoto: React.FC<PropertyPhotoProps> = ({
  photoId,
  customOverrides = {},
  className = '',
  aspectClass = 'aspect-[16/10]',
  showBadge = true,
  slotTitle,
}) => {
  const [imgError, setImgError] = useState(false);
  const asset = PHOTO_ASSETS[photoId] ?? PHOTO_ASSETS['placeholder-non-ac'];
  const overrideUrl = customOverrides[photoId];
  const resolvedUrl = overrideUrl || (!imgError ? asset.url : null);

  if (resolvedUrl) {
    return (
      <div
        className={`relative overflow-hidden bg-stone-200 ${aspectClass} ${className}`}
      >
        <img
          src={resolvedUrl}
          alt={asset.caption}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
        />
        {showBadge && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
            <span className="inline-flex items-center gap-1 rounded-full bg-stone-900/75 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              {overrideUrl ? 'Owner Uploaded Preview' : 'Verified Property Photo'}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center border border-dashed border-stone-300 bg-gradient-to-br from-[#f6f2ea] to-[#ede7dc] p-4 text-center ${aspectClass} ${className}`}
    >
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-500 shadow-xs">
        {imgError ? <ImageOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
      </div>
      <p className="text-xs font-semibold text-stone-700">
        {slotTitle ?? asset.label}
      </p>
      <p className="mt-1 max-w-[230px] text-[11px] leading-snug text-stone-500">
        {asset.sourceNote}
      </p>
      {showBadge && (
        <span className="mt-2.5 inline-flex items-center rounded-full border border-amber-300/80 bg-amber-50/90 px-2.5 py-0.5 text-[10px] font-medium text-amber-900">
          Photo Placeholder • Replace in Settings
        </span>
      )}
    </div>
  );
};

