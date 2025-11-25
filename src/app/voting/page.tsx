'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { VotingData } from '@/types/voting';

// Director names mapping
const DIRECTOR_NAMES = {
  vote1: 'Ong, Romeo A.',
  vote2: 'Lee, Patrick',
  vote3: 'Pichel, James Robertson C.',
  vote4: 'Tamin, Jonathan F.',
  vote5: 'Gimena, Giovanni Paolo C.',
  vote6: 'Sahi, Lieza G.',
  vote7: 'Tan, Yolanda M.',
  vote8: 'Belleza, Linda Ann D.',
  independent1: 'Policarpio, Ronald D.',
  independent2: 'Cerrillo, Alex Escolastico L.',
};

// Resolution titles mapping
const RESOLUTION_TITLES = [
  "Approval of the Minutes of the 26 January 2025 Annual Stockholders' Meeting",
  'Noting and Approval of the 2024 Annual Report and Audited Financial Statement as of 31 December 2024',
  'Ratification and Approval of the previous acts and resolutions of the Board of Directors and Corporate Officers',
  'Amendment of Article I - Changing the corporate name from "ALLIED CARE MEDICAL EXPERTS (ACE) MEDICAL CENTER-ZAMBOANGA CITY INC." to "PREMIER MEDICAL CENTER ZAMBOANGA INC."',
  'Amendment of Article VI - Adding provision for three (3) Independent Directors',
  'Amendment of Article II, Section 3 - Place of Meeting (allowing remote communication)',
  'Amendment of Article II, Section 4 - Notice of Meeting (changing from 1 week to 21 days prior notice)',
  'Amendment of Article II, Section 5 - Quorum (remote participation deemed present)',
  'Amendment of Article II, Section 6 - Conduct of Meeting (detailed remote participation procedures)',
  'Amendment of Article II, Section 7 - Manner of Voting (proxy deadline changed from 1 day to 7 days prior)',
  'Amendment of Article III, Section 8 - Qualification of Director (changing from 10 to 15 common shares per block)',
  'Election of QUILAB and GARSUTA, CPAs as External Auditor for the Current Year and Fixing of its Remuneration',
  'Election of the 2025 Board of Directors',
];

const RESOLUTION_NUMBERS = ['01', '03', '04', '07', '07', '08', '08', '08', '08', '09', '08', '10', '13'];

interface DirectorVotes {
  name: string;
  votes: number;
}

interface ResolutionResult {
  number: string;
  title: string;
  for: number;
  against: number;
  abstain: number;
  total: number;
}

export default function VotingResults() {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Results data
  const [regularDirectors, setRegularDirectors] = useState<DirectorVotes[]>([]);
  const [independentDirectors, setIndependentDirectors] = useState<DirectorVotes[]>([]);
  const [resolutions, setResolutions] = useState<ResolutionResult[]>([]);
  const [totalVoters, setTotalVoters] = useState(0);

  // Live date and time update
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const year = now.getFullYear();

      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;

      const formattedDateTime = `${month}/${day}/${year} ${hours}:${minutes}${ampm}`;
      setCurrentDateTime(formattedDateTime);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch and calculate voting data
  const generateResults = async () => {
    try {
      setIsGenerating(true);
      setLoading(true);

      // Fetch all documents from pmc2026
      const querySnapshot = await getDocs(collection(db, 'pmc2026'));
      const allData: VotingData[] = [];

      querySnapshot.forEach((doc) => {
        allData.push({ ...doc.data() as VotingData, email: doc.id });
      });

      console.log(`📊 Total documents fetched: ${allData.length}`);

      // Filter only users who have BOTH ratified AND voted
      const votedUsers = allData.filter(
        (user) => user.hasRatified === true && user.hasVoted === true
      );

      console.log(`✅ Users who voted: ${votedUsers.length}`);
      setTotalVoters(votedUsers.length);

      // Calculate Director Votes
      const directorTotals = {
        vote1: 0,
        vote2: 0,
        vote3: 0,
        vote4: 0,
        vote5: 0,
        vote6: 0,
        vote7: 0,
        vote8: 0,
        independent1: 0,
        independent2: 0,
      };

      votedUsers.forEach((user) => {
        directorTotals.vote1 += user.vote1 || 0;
        directorTotals.vote2 += user.vote2 || 0;
        directorTotals.vote3 += user.vote3 || 0;
        directorTotals.vote4 += user.vote4 || 0;
        directorTotals.vote5 += user.vote5 || 0;
        directorTotals.vote6 += user.vote6 || 0;
        directorTotals.vote7 += user.vote7 || 0;
        directorTotals.vote8 += user.vote8 || 0;
        directorTotals.independent1 += user.independent1 || 0;
        directorTotals.independent2 += user.independent2 || 0;
      });

      // Format Regular Directors
      const regularDirs: DirectorVotes[] = [
        { name: DIRECTOR_NAMES.vote1, votes: directorTotals.vote1 },
        { name: DIRECTOR_NAMES.vote2, votes: directorTotals.vote2 },
        { name: DIRECTOR_NAMES.vote3, votes: directorTotals.vote3 },
        { name: DIRECTOR_NAMES.vote4, votes: directorTotals.vote4 },
        { name: DIRECTOR_NAMES.vote5, votes: directorTotals.vote5 },
        { name: DIRECTOR_NAMES.vote6, votes: directorTotals.vote6 },
        { name: DIRECTOR_NAMES.vote7, votes: directorTotals.vote7 },
        { name: DIRECTOR_NAMES.vote8, votes: directorTotals.vote8 },
      ];

      // Format Independent Directors
      const independentDirs: DirectorVotes[] = [
        { name: DIRECTOR_NAMES.independent1, votes: directorTotals.independent1 },
        { name: DIRECTOR_NAMES.independent2, votes: directorTotals.independent2 },
      ];

      setRegularDirectors(regularDirs);
      setIndependentDirectors(independentDirs);

      // Calculate Resolution Results
      const resolutionResults: ResolutionResult[] = [];

      for (let i = 1; i <= 13; i++) {
        const selectionKey = `selection${i}` as keyof VotingData;
        let forCount = 0;
        let againstCount = 0;
        let abstainCount = 0;

        votedUsers.forEach((user) => {
          const selection = user[selectionKey];
          if (selection === 'For') forCount++;
          else if (selection === 'Against') againstCount++;
          else if (selection === 'Abstain') abstainCount++;
        });

        const total = forCount + againstCount + abstainCount;

        resolutionResults.push({
          number: RESOLUTION_NUMBERS[i - 1],
          title: RESOLUTION_TITLES[i - 1],
          for: forCount,
          against: againstCount,
          abstain: abstainCount,
          total: total,
        });
      }

      setResolutions(resolutionResults);
      console.log('✅ Data calculation complete');
      
      // Close popup and show results
      setShowPopup(false);
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('❌ Error fetching voting data:', err);
      setError(err.message || 'Failed to fetch voting data');
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', { minimumIntegerDigits: 1 });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#033E78] to-[#0085BB]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-lg max-w-md">
          <p className="font-bold text-xl mb-2">Error Loading Data</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative p-4 sm:p-6 lg:p-8">
      {/* Generate Results Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full mx-4 transform transition-all">
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-[#033E78] to-[#0085BB] rounded-full flex items-center justify-center">
                  <span className="text-4xl">📊</span>
                </div>
              </div>
              
              <h2 className="text-3xl font-black text-[#033E78] mb-4">
                Ready to Generate Results?
              </h2>
              
              <p className="text-gray-600 mb-8 text-lg">
                Click the button below to calculate and display the voting results
              </p>
              
              <button
                onClick={generateResults}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-[#033E78] to-[#0085BB] text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  '🚀 Generate Results'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#033E78] mx-auto mb-4"></div>
                  <p className="text-[#033E78] text-xl font-bold">Calculating results...</p>
                </div>
              </div>
            ) : currentPage === 1 ? (
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
                    {regularDirectors.map((director, index) => (
                      <div
                        key={index}
                        className="group bg-gradient-to-r from-[#033E78] via-[#0085BB] to-[#033E78] rounded-2xl px-6 sm:px-8 py-5 sm:py-6 flex justify-between items-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-[#0085BB]/50"
                      >
                        <span className="text-white text-base sm:text-lg lg:text-xl font-semibold group-hover:text-[#E2B016] transition-colors">
                          {director.name}
                        </span>
                        <div className="bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-xl">
                          <span className="text-white text-xl sm:text-2xl lg:text-3xl font-black tabular-nums">
                            {formatNumber(director.votes)}
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
                    {independentDirectors.map((director, index) => (
                      <div
                        key={index}
                        className="group bg-gradient-to-r from-[#033E78] via-[#0085BB] to-[#033E78] rounded-2xl px-6 sm:px-8 py-5 sm:py-6 flex justify-between items-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-[#0085BB]/50"
                      >
                        <span className="text-white text-base sm:text-lg lg:text-xl font-semibold group-hover:text-[#E2B016] transition-colors">
                          {director.name}
                        </span>
                        <div className="bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-xl">
                          <span className="text-white text-xl sm:text-2xl lg:text-3xl font-black tabular-nums">
                            {formatNumber(director.votes)}
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
                              {formatNumber(resolution.for)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-red-100 px-4 sm:px-5 py-3 rounded-xl shadow-md border border-red-200 hover:scale-105 transition-transform">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm font-bold text-red-800">
                              AGAINST
                            </span>
                            <span className="font-black text-lg sm:text-xl text-red-900 tabular-nums">
                              {formatNumber(resolution.against)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 sm:px-5 py-3 rounded-xl shadow-md border border-blue-200 hover:scale-105 transition-transform">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm font-bold text-blue-800">
                              ABSTAIN
                            </span>
                            <span className="font-black text-lg sm:text-xl text-blue-900 tabular-nums">
                              {formatNumber(resolution.abstain)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-[#033E78] to-[#0085BB] text-white px-4 sm:px-5 py-3 rounded-xl shadow-lg border border-[#0085BB] hover:scale-105 transition-transform">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm font-bold">TOTAL</span>
                            <span className="font-black text-lg sm:text-xl tabular-nums">
                              {formatNumber(resolution.total)}
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