'use client';

import { Suspense } from 'react';

function BlockedContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-red-500/20 border border-red-500/50">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-red-400 mb-3">
            Access Denied
          </h1>

          {/* Error Message */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            You do not have permission to access this resource. This website is only accessible from authorized network locations.
          </p>

          {/* Additional Info */}
          <div className="bg-gray-900/50 rounded-lg p-4 mb-6 border border-gray-700/50">
            <p className="text-sm text-gray-400">
              If you believe this is an error, please contact your system administrator.
            </p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BlockedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-3">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <BlockedContent />
    </Suspense>
  );
}

