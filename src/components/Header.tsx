import React from 'react';

export default function Header() {
  return (
    <header className="bg-slate-800 text-slate-100 border-b-4 border-blue-500 shadow-sm">
      {/* Clean Minimalist Header */}
      <div className="py-6 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-sans text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Moon Explorer WebQuest
          </h1>
          <p className="font-sans text-xs md:text-sm text-slate-300 mt-1 uppercase tracking-wider font-medium">
            An Inquiry-Based Lunar Adventure
          </p>
        </div>
      </div>
    </header>
  );
}
