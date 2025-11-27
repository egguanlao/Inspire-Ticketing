'use client';

import GearLoad from './GearLoad';

export default function LoadingOverlay({ isSubmitting }) {
  if (!isSubmitting) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-hidden">
      {/* Gear Loading Animation */}
      <div className="relative w-full h-full flex items-center justify-center">
        <GearLoad />
      </div>
      
      {/* Text - Positioned directly below the gears */}
      <p className="absolute top-[calc(50%+90px)] left-5 right-0 text-4xl font-semibold text-[#F2F6FF] text-center z-10">
        Please Wait...
      </p>
    </div>
  );
}

