'use client';

import AdminGearLoad from './AdminGearLoad';

export default function AdminLoadingOverlay({ isActive, message = 'Authenticating...' }) {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        <AdminGearLoad />
      </div>
      <p className="absolute top-[calc(50%+90px)] left-5 right-0 text-2xl font-semibold text-[#F2F6FF] text-center z-10">
        {message}
      </p>
    </div>
  );
}


