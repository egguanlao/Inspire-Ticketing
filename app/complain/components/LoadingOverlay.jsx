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
      <p className="absolute top-[calc(50%+70px)] sm:top-[calc(50%+90px)] left-0 right-0 text-2xl sm:text-4xl font-semibold text-[#F2F6FF] text-center z-10 px-4">
        Please Wait...
      </p>
    </div>
  );
}

