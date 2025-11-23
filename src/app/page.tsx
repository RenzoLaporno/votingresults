'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function VotingResults() {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDateTime, setCurrentDateTime] = useState('');

  // Live date and time update
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Format: MM/DD/YYYY H:MMAM/PM
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const year = now.getFullYear();

      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12

      const formattedDateTime = `${month}/${day}/${year} ${hours}:${minutes}${ampm}`;
      setCurrentDateTime(formattedDateTime);
    };

    // Update immediately
    updateDateTime();

    // Update every second
    const interval = setInterval(updateDateTime, 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  const directors = {
    regular: [
      { name: 'Belleza, Linda Ann D.', votes: '000,000' },
      { name: 'Pichel, James Robertson C.', votes: '000,000' },
      { name: 'Gimena, Giovanni Paolo C.', votes: '000,000' },
      { name: 'Sahi, Lieza P. Gonzaga', votes: '000,000' },
      { name: 'Lee, Patrick G.', votes: '000,000' },
      { name: 'Tamin, Jonathan John F.', votes: '000,000' },
      { name: 'Ong, Romeo A.', votes: '000,000' },
      { name: 'Tan, Yolanda M.', votes: '000,000' },
    ],
    independent: [
      { name: 'Cerrillo, Alex Escolastico L.', votes: '000,000' },
      { name: 'Policarpio, Ronald D.', votes: '000,000' },
    ],
  };

  const resolutions = [
    {
      number: '01',
      title: "Approval of the Minutes of the 26 January 2025 Annual Stockholders' Meeting",
      for: '000,000',
      against: '000,000',
      abstain: '000,000',
      total: '000,000',
    },
    {
      number: '03',
      title:
        'Noting and Approval of the 2024 Annual Report and Audited Financial Statement as of 31 December 2024',
      for: '000,000',
      against: '000,000',
      abstain: '000,000',
      total: '000,000',
    },
    {
      number: '04',
      title:
        'Ratification and Approval of the previous acts and resolutions of the Board of Directors and Corporate Officers',
      for: '000,000',
      against: '000,000',
      abstain: '000,000',
      total: '000,000',
    },
    {
      number: '07',
      title:
        'Amendment of Article I - Changing the corporate name from "ALLIED CARE MEDICAL EXPERTS (ACE) MEDICAL CENTER-ZAMBOANGA CITY INC." to "PREMIER MEDICAL CENTER ZAMBOANGA INC."',
      for: '000,000',
      against: '000,000',
      abstain: '000,000',
      total: '000,000',
    },
    {
      number: '07',
      title: 'Amendment of Article VI - Adding provision for three (3) Independent Directors',
      for: '000,000',
      against: '000,000',
      abstain: '000,000',
      total: '000,000',
    },
    {
      number: '08',
      title:
        'Amendment of Article II, Section 3 - Place of Meeting (allowing remote communication)',
      for: '000,000',
      against: '000,000',
      abstain: '000,000',
      total: '000,000',
    },
    {
      number: '08',
      title:
        'Amendment of Article II, Section 4 - Notice of Meeting (changing from 1 week to 21 days prior notice)',
      for: '000,000',
      against: '000,000',
      abstain: '000,000',
      total: '000,000',
    },
    {
      number: '08',
      title: 'Amendment of Article II, Section 5 - Quorum (remote participation deemed present)',
      for: '000,000',
      against: '000,000',
      abstain: '000,000',
      total: '000,000',
    },
    {
      number: '08',
      title:
        'Amendment of Article II, Section 6 - Conduct of Meeting (detailed remote participation procedures)',
      for: '000,000',
      against: '000,000',
      abstain: '000,000',
      total: '000,000',
    },
    {
      number: '09',
      title:
        'Amendment of Article II, Section 7 - Manner of Voting (proxy deadline changed from 1 day to 7 days prior)',
      for: '000,000',
      against: '000,000',
      abstain: '000,000',
      total: '000,000',
    },
    {
      number: '08',
      title:
        'Amendment of Article III, Section 8 - Qualification of Director (changing from 10 to 15 common shares per block)',
      for: '000,000',
      against: '000,000',
      abstain: '000,000',
      total: '000,000',
    },
    {
      number: '10',
      title:
        'Election of QUILAB and GARSUTA, CPAs as External Auditor for the Current Year and Fixing of its Remuneration',
      for: '000,000',
      against: '000,000',
      abstain: '000,000',
      total: '000,000',
    },
  ];

  return (
    <div className="min-h-screen relative p-4 sm:p-6 lg:p-8">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/PMC_Background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#033E78]/70 via-[#033E78]/65 to-[#0085BB]/60"></div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#0085BB]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E2B016]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Navigation Buttons */}
        <div className="flex justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => setCurrentPage(1)}
            className={`px-6 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all duration-300 transform hover:scale-105 ${
              currentPage === 1
                ? 'bg-gradient-to-r from-[#033E78] to-[#0085BB] text-white shadow-[#033E78]/50'
                : 'bg-white text-[#033E78] hover:shadow-xl'
            }`}
          >
            📊 Voting Results
          </button>
          <button
            onClick={() => setCurrentPage(2)}
            className={`px-6 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all duration-300 transform hover:scale-105 ${
              currentPage === 2
                ? 'bg-gradient-to-r from-[#033E78] to-[#0085BB] text-white shadow-[#033E78]/50'
                : 'bg-white text-[#033E78] hover:shadow-xl'
            }`}
          >
            📋 Resolutions
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 px-6 sm:px-8 lg:px-12 py-6 sm:py-8 border-b-4 border-[#033E78]">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              {/* Logo and Title */}
              <div className="flex items-center gap-4 sm:gap-6">
                {/* PMC Logo */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-white rounded-full p-1 shadow-xl ring-4 ring-[#0085BB]/30">
                  <div className="w-full h-full relative">
                    <Image
                      src="/logo.webp"
                      alt="PMC Logo"
                      fill
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                <div>
                  <h1 className="text-[#033E78] text-lg sm:text-xl lg:text-2xl font-black tracking-tight">
                    PREMIER MEDICAL CENTER
                  </h1>
                  <h2 className="text-[#0085BB] text-base sm:text-lg lg:text-xl font-semibold">
                    ZAMBOANGA
                  </h2>
                </div>
              </div>

              {/* Right Title */}
              <div className="text-left lg:text-right">
                <h3 className="text-[#033E78] text-lg sm:text-xl lg:text-2xl italic font-bold">
                  2025 Annual Stockholders&apos; Meeting
                </h3>
              </div>
            </div>

            {/* Main Title with LIVE Date/Time */}
            <div className="mt-6 sm:mt-8 bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
              <h1 className="text-[#033E78] text-2xl sm:text-3xl lg:text-4xl font-black text-center tracking-tight">
                {currentPage === 1 ? '🗳️ VOTING RESULTS' : '📊 RESOLUTION RESULTS'}
              </h1>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-[#E2B016] text-lg sm:text-xl font-bold">AS OF</span>
                <span className="text-[#033E78] text-lg sm:text-xl lg:text-2xl font-black tabular-nums">
                  {currentDateTime || 'Loading...'}
                </span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-6 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12">
            {currentPage === 1 ? (
              // VOTING RESULTS PAGE
              <div className="space-y-12">
                {/* REGULAR DIRECTOR Section */}
                <div className="animate-fadeIn">
                  <div className="flex items-center justify-center mb-8 sm:mb-10">
                    <div className="bg-gradient-to-r from-[#033E78] to-[#0085BB] text-white px-8 py-3 rounded-full shadow-lg">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide">
                        👔 REGULAR DIRECTOR
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {directors.regular.map((director, index) => (
                      <div
                        key={index}
                        className="group bg-gradient-to-r from-[#033E78] via-[#0085BB] to-[#033E78] rounded-2xl px-6 sm:px-8 py-5 sm:py-6 flex justify-between items-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-[#0085BB]/50"
                      >
                        <span className="text-white text-base sm:text-lg lg:text-xl font-semibold group-hover:text-[#E2B016] transition-colors">
                          {director.name}
                        </span>
                        <div className="bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-xl">
                          <span className="text-white text-xl sm:text-2xl lg:text-3xl font-black tabular-nums">
                            {director.votes}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* INDEPENDENT DIRECTOR Section */}
                <div className="animate-fadeIn">
                  <div className="flex items-center justify-center mb-8 sm:mb-10">
                    <div className="bg-gradient-to-r from-[#033E78] to-[#0085BB] text-white px-8 py-3 rounded-full shadow-lg">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide">
                        🎯 INDEPENDENT DIRECTOR
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {directors.independent.map((director, index) => (
                      <div
                        key={index}
                        className="group bg-gradient-to-r from-[#033E78] via-[#0085BB] to-[#033E78] rounded-2xl px-6 sm:px-8 py-5 sm:py-6 flex justify-between items-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-[#0085BB]/50"
                      >
                        <span className="text-white text-base sm:text-lg lg:text-xl font-semibold group-hover:text-[#E2B016] transition-colors">
                          {director.name}
                        </span>
                        <div className="bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-xl">
                          <span className="text-white text-xl sm:text-2xl lg:text-3xl font-black tabular-nums">
                            {director.votes}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // RESOLUTION RESULTS PAGE
              <div className="space-y-6 sm:space-y-8">
                {resolutions.map((resolution, index) => (
                  <div
                    key={index}
                    className="group bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-5 sm:p-6 lg:p-8 border-2 border-gray-200 hover:border-[#0085BB] shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-start gap-4 sm:gap-6">
                      {/* Resolution Number */}
                      <div className="bg-gradient-to-r from-[#033E78] to-[#0085BB] text-white px-6 sm:px-8 py-4 rounded-xl font-black text-base sm:text-lg shadow-lg flex-shrink-0 xl:w-56">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📄</span>
                          <span>RESOLUTION NO: {resolution.number}</span>
                        </div>
                      </div>

                      {/* Vote Counts */}
                      <div className="flex flex-wrap gap-3 sm:gap-4 flex-1 justify-start xl:justify-end">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 px-4 sm:px-5 py-3 rounded-xl shadow-md border border-green-200 hover:scale-105 transition-transform">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm font-bold text-green-800">FOR</span>
                            <span className="font-black text-lg sm:text-xl text-green-900 tabular-nums">
                              {resolution.for}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-red-100 px-4 sm:px-5 py-3 rounded-xl shadow-md border border-red-200 hover:scale-105 transition-transform">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm font-bold text-red-800">
                              AGAINST
                            </span>
                            <span className="font-black text-lg sm:text-xl text-red-900 tabular-nums">
                              {resolution.against}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 sm:px-5 py-3 rounded-xl shadow-md border border-blue-200 hover:scale-105 transition-transform">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm font-bold text-blue-800">
                              ABSTAIN
                            </span>
                            <span className="font-black text-lg sm:text-xl text-blue-900 tabular-nums">
                              {resolution.abstain}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-[#033E78] to-[#0085BB] text-white px-4 sm:px-5 py-3 rounded-xl shadow-lg border border-[#0085BB] hover:scale-105 transition-transform">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm font-bold">TOTAL</span>
                            <span className="font-black text-lg sm:text-xl tabular-nums">
                              {resolution.total}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resolution Title */}
                    <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t-2 border-gray-200">
                      <p className="text-[#033E78] text-sm sm:text-base font-medium leading-relaxed">
                        {resolution.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/90 text-sm font-semibold drop-shadow-lg">
            © 2025 Premier Medical Center Zamboanga. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
