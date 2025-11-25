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
  'Amendment of Article III, Section 8 - Qualification of Director (changing from 10 to 15 common shares per block)',
  'Amendment of Article II, Section 7 - Manner of Voting (proxy deadline changed from 1 day to 7 days prior)',
  'Election of QUILAB and GARSUTA, CPAs as External Auditor for the Current Year and Fixing of its Remuneration',
  'Election of the 2025 Board of Directors',
];

const RESOLUTION_NUMBERS = ['NO : 01', 'NO : 02', 'NO : 03', 'NO : 07', 'NO : 07', 'NO : 08', 'NO : 08', 'NO : 08', 'NO : 08', 'NO : 08', 'NO : 09', 'NO : 10', ''];

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
  const [currentPage, setCurrentPage] = useState(2);
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
  const [totalShares, setTotalShares] = useState(0);
  const [totalMaxVotes, setTotalMaxVotes] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

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

      // Calculate total shares and maxVotes
      let sharesSum = 0;
      let maxVotesSum = 0;

      votedUsers.forEach((user) => {
        sharesSum += user.shares || 0;
        // Parse maxVotes as it's stored as string in Firestore
        const maxVotes = parseInt(user.maxVotes) || 0;
        maxVotesSum += maxVotes;
      });

      setTotalShares(sharesSum);
      setTotalMaxVotes(maxVotesSum);

      console.log(`📊 Total Shares: ${sharesSum}`);
      console.log(`📊 Total Max Votes: ${maxVotesSum}`);

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

  // Export to Excel
  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      const XLSX = await import('xlsx');

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Statistics Sheet
      const statsData = [
        ['PREMIER MEDICAL CENTER ZAMBOANGA'],
        ['2025 Annual Stockholders Meeting - Voting Results'],
        ['Generated:', currentDateTime],
        [],
        ['Statistics'],
        ['Total Voters', totalVoters],
        ['Total Shares', totalShares],
        ['Total Max Votes', totalMaxVotes],
      ];
      const statsWs = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, statsWs, 'Statistics');

      // Regular Directors Sheet
      const regularData = [
        ['REGULAR DIRECTORS'],
        ['Name', 'Votes'],
        ...regularDirectors.map((d) => [d.name, d.votes]),
      ];
      const regularWs = XLSX.utils.aoa_to_sheet(regularData);
      XLSX.utils.book_append_sheet(wb, regularWs, 'Regular Directors');

      // Independent Directors Sheet
      const independentData = [
        ['INDEPENDENT DIRECTORS'],
        ['Name', 'Votes'],
        ...independentDirectors.map((d) => [d.name, d.votes]),
      ];
      const independentWs = XLSX.utils.aoa_to_sheet(independentData);
      XLSX.utils.book_append_sheet(wb, independentWs, 'Independent Directors');

      // Resolutions Sheet
      const resolutionsData = [
        ['RESOLUTIONS'],
        ['Resolution No.', 'Title', 'For', 'Against', 'Abstain', 'Total'],
        ...resolutions.map((r) => [r.number, r.title, r.for, r.against, r.abstain, r.total]),
      ];
      const resolutionsWs = XLSX.utils.aoa_to_sheet(resolutionsData);
      XLSX.utils.book_append_sheet(wb, resolutionsWs, 'Resolutions');

      // Generate file
      XLSX.writeFile(wb, `PMC_Voting_Results_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      let yPosition = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('PREMIER MEDICAL CENTER ZAMBOANGA', 105, yPosition, { align: 'center' });
      yPosition += 8;

      doc.setFontSize(14);
      doc.text('2025 Annual Stockholders Meeting', 105, yPosition, { align: 'center' });
      yPosition += 6;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Voting Results', 105, yPosition, { align: 'center' });
      yPosition += 6;

      doc.setFontSize(10);
      doc.text(`Generated: ${currentDateTime}`, 105, yPosition, { align: 'center' });
      yPosition += 10;

      // Statistics
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Statistics', 14, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Voters: ${formatNumber(totalVoters)}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Total Shares: ${formatNumber(totalShares)}`, 14, yPosition);
      yPosition += 5;
      doc.text(`Total Max Votes: ${formatNumber(totalMaxVotes)}`, 14, yPosition);
      yPosition += 10;

      // Regular Directors Table
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('REGULAR DIRECTORS', 14, yPosition);
      yPosition += 5;

      autoTable(doc, {
        startY: yPosition,
        head: [['Name', 'Votes']],
        body: regularDirectors.map((d) => [d.name, formatNumber(d.votes)]),
        theme: 'striped',
        headStyles: { fillColor: [3, 62, 120] },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yPosition = (doc as any).lastAutoTable.finalY + 10;

      // Independent Directors Table
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('INDEPENDENT DIRECTORS', 14, yPosition);
      yPosition += 5;

      autoTable(doc, {
        startY: yPosition,
        head: [['Name', 'Votes']],
        body: independentDirectors.map((d) => [d.name, formatNumber(d.votes)]),
        theme: 'striped',
        headStyles: { fillColor: [3, 62, 120] },
      });

      // Add new page for resolutions
      doc.addPage();
      yPosition = 20;

      // Resolutions
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RESOLUTIONS', 105, yPosition, { align: 'center' });
      yPosition += 10;

      autoTable(doc, {
        startY: yPosition,
        head: [['No.', 'Title', 'For', 'Against', 'Abstain', 'Total']],
        body: resolutions.map((r) => [
          r.number,
          r.title,
          formatNumber(r.for),
          formatNumber(r.against),
          formatNumber(r.abstain),
          formatNumber(r.total),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [3, 62, 120] },
        styles: { fontSize: 8 },
        columnStyles: {
          1: { cellWidth: 80 },
        },
      });

      // Save PDF
      doc.save(`PMC_Voting_Results_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export to PDF');
    } finally {
      setIsExporting(false);
    }
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
                <div className="relative mx-auto w-24 h-24 bg-white rounded-full p-2 shadow-xl ring-4 ring-[#E2B016]">
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
              </div>

              <h2 className="text-3xl font-black text-[#033E78] mb-4 uppercase">
                Ready to Generate Results?
              </h2>

              <p className="text-gray-600 mb-8 text-lg">
                Click the button below to calculate and display the voting results
              </p>

              <button
                onClick={generateResults}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-[#033E78] to-[#0085BB] text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 uppercase"
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
                  'Generate Results'
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 sm:mb-8">
          {/* Page Navigation */}
          <div className="flex justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-6 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all duration-300 transform hover:scale-105 ${
                currentPage === 1
                  ? 'bg-gradient-to-r from-[#033E78] to-[#0085BB] text-white shadow-[#033E78]/50'
                  : 'bg-white text-[#033E78] hover:shadow-xl'
              }`}
            >
              Board of Directors
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`px-6 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all duration-300 transform hover:scale-105 ${
                currentPage === 2
                  ? 'bg-gradient-to-r from-[#033E78] to-[#0085BB] text-white shadow-[#033E78]/50'
                  : 'bg-white text-[#033E78] hover:shadow-xl'
              }`}
            >
              Resolutions
            </button>
          </div>

          {/* Export Buttons */}
          {!loading && !showPopup && (
            <div className="flex gap-3">
              <button
                onClick={exportToExcel}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Export Excel</span>
                <span className="sm:hidden">Excel</span>
              </button>
              <button
                onClick={exportToPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Export PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#033E78] via-[#033E78] to-[#0085BB] px-6 sm:px-8 lg:px-12 py-6 sm:py-8 border-b-4 border-[#E2B016]">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              {/* Logo and Title */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-white rounded-full p-1 shadow-xl ring-4 ring-[#0085BB]/50">
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
                  <h1 className="text-white text-lg sm:text-xl lg:text-2xl font-black tracking-tight uppercase">
                    PREMIER MEDICAL CENTER
                  </h1>
                  <h2 className="text-[#E2B016] text-base sm:text-lg lg:text-xl font-bold uppercase">
                    ZAMBOANGA
                  </h2>
                </div>
              </div>

              <div className="text-left lg:text-right">
                <h3 className="text-white text-lg sm:text-xl lg:text-2xl italic font-bold">
                  2025 Annual Stockholders&apos; Meeting
                </h3>
              </div>
            </div>

            {/* Main Title with LIVE Date/Time */}
            <div className="mt-6 sm:mt-8 bg-white/95 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
              <h1 className="text-[#033E78] text-2xl sm:text-3xl lg:text-4xl font-black text-center tracking-tight uppercase">
                {currentPage === 1 ? 'VOTING RESULTS' : 'RESOLUTION RESULTS'}
              </h1>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-[#E2B016] text-lg sm:text-xl font-black uppercase">AS OF</span>
                <span className="text-[#033E78] text-lg sm:text-xl lg:text-2xl font-black tabular-nums">
                  {currentDateTime || 'Loading...'}
                </span>
              </div>
            </div>

            {/* Statistics Cards - New Section */}
            {!loading && !showPopup && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Voters */}
                <div className="bg-[#0085BB] rounded-xl p-4 shadow-lg border-2 border-white/20">
                  <div className="text-white/90 text-xs sm:text-sm font-bold mb-1 uppercase tracking-wide">
                    TOTAL VOTERS
                  </div>
                  <div className="text-white text-2xl sm:text-3xl font-black tabular-nums">
                    {formatNumber(totalVoters)}
                  </div>
                </div>

                {/* Total Shares */}
                <div className="bg-[#E2B016] rounded-xl p-4 shadow-lg border-2 border-white/20">
                  <div className="text-white text-xs sm:text-sm font-bold mb-1 uppercase tracking-wide">
                    TOTAL SHARES
                  </div>
                  <div className="text-white text-2xl sm:text-3xl font-black tabular-nums">
                    {formatNumber(totalShares)}
                  </div>
                </div>

                {/* Total Max Votes */}
                <div className="bg-[#033E78] rounded-xl p-4 shadow-lg border-2 border-white/20">
                  <div className="text-white/90 text-xs sm:text-sm font-bold mb-1 uppercase tracking-wide">
                    TOTAL MAX VOTES
                  </div>
                  <div className="text-white text-2xl sm:text-3xl font-black tabular-nums">
                    {formatNumber(totalMaxVotes)}
                  </div>
                </div>
              </div>
            )}
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
                    <div className="bg-gradient-to-r from-[#033E78] to-[#0085BB] text-white px-8 py-3 rounded-full shadow-lg border-2 border-[#E2B016]">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide uppercase">
                        REGULAR DIRECTOR
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {regularDirectors.map((director, index) => (
                      <div
                        key={index}
                        className="group bg-gradient-to-r from-[#033E78] via-[#0085BB] to-[#033E78] rounded-2xl px-6 sm:px-8 py-5 sm:py-6 flex justify-between items-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-[#0085BB]/50 hover:border-[#E2B016]"
                      >
                        <span className="text-white text-base sm:text-lg lg:text-xl font-bold group-hover:text-[#E2B016] transition-colors uppercase">
                          {director.name}
                        </span>
                        <div className="bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-white/30">
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
                    <div className="bg-gradient-to-r from-[#033E78] to-[#0085BB] text-white px-8 py-3 rounded-full shadow-lg border-2 border-[#E2B016]">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide uppercase">
                        INDEPENDENT DIRECTOR
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {independentDirectors.map((director, index) => (
                      <div
                        key={index}
                        className="group bg-gradient-to-r from-[#033E78] via-[#0085BB] to-[#033E78] rounded-2xl px-6 sm:px-8 py-5 sm:py-6 flex justify-between items-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-[#0085BB]/50 hover:border-[#E2B016]"
                      >
                        <span className="text-white text-base sm:text-lg lg:text-xl font-bold group-hover:text-[#E2B016] transition-colors uppercase">
                          {director.name}
                        </span>
                        <div className="bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-white/30">
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
                          <span>RESOLUTION {resolution.number}</span>
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