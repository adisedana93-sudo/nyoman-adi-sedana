import React from 'react';
import { 
  Activity, 
  Layers, 
  ShieldAlert, 
  Grid3X3,
  Building2,
  FileSpreadsheet,
  ShieldCheck,
  Shield,
  Cloud,
  GitBranch,
  Sparkles
} from 'lucide-react';

interface HeaderNavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onExportAllUnitsExcel?: () => void;
  onOpenGoogleDriveModal?: () => void;
  totalRisks?: number;
  totalPpiRisks?: number;
  totalMfkRisks?: number;
  totalEkstremRisks?: number;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentTab,
  setCurrentTab,
  onExportAllUnitsExcel,
  onOpenGoogleDriveModal,
  totalRisks = 0,
  totalPpiRisks = 0,
  totalMfkRisks = 0,
  totalEkstremRisks = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e2e8f0] shadow-xs">
      {/* Main Brand & Identity Header */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {/* Logo RSU SHANTI GRAHA - Ditampilkan penuh dan tidak terpotong */}
          <div className="h-12 sm:h-14 flex items-center shrink-0">
            <img
              src="/assets/aistudio/15_4_2021_23.23.16__1__f9550c83.png"
              alt="Logo RSU SHANTI GRAHA"
              className="h-full w-auto max-w-[220px] sm:max-w-[280px] object-contain block drop-shadow-xs"
              loading="eager"
            />
          </div>

          <div className="border-l border-[#cbd5e1] pl-3.5 hidden sm:block">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-[#0b1c30] tracking-tight">
                SIM MANAJEMEN RISIKO <span className="text-[#005d42] font-bold text-xs sm:text-sm">| RSU SHANTI GRAHA</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-[#eff4ff] text-[#005683] border border-[#d5e3fc] uppercase tracking-wider">
                STARKES 2026
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#515f74] mt-0.5">
              <span className="font-semibold text-[#005d42]">RSU SHANTI GRAHA</span>
              <span className="text-[#cbd5e1]">•</span>
              <span className="text-[#64748b]">Komite Mutu & Manajemen Risiko (KMKP)</span>
            </div>
          </div>
        </div>

        {/* Right Section: Google Drive + Officer Profile */}
        <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
          {onOpenGoogleDriveModal && (
            <button
              onClick={onOpenGoogleDriveModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-[#0b1c30] border border-[#cbd5e1] rounded-[4px] text-xs font-semibold cursor-pointer transition shadow-xs"
              title="Cadangkan dan Kelola File ke Google Drive"
            >
              <Cloud className="w-4 h-4 text-[#005683]" />
              <span>Google Drive</span>
            </button>
          )}

          {onExportAllUnitsExcel && (
            <button
              onClick={onExportAllUnitsExcel}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#eff4ff] hover:bg-[#dbeafe] text-[#005683] border border-[#bfdbfe] rounded-[4px] text-xs font-semibold cursor-pointer transition shadow-xs"
              title="Unduh format Excel bergaris pembatas rapi"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#005683]" />
              <span>Unduh Excel Semua Unit</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 pl-3 border-l border-[#e2e8f0]">
            <div className="w-8 h-8 rounded-full bg-[#005d42] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              AS
            </div>
            <div className="text-left text-xs leading-tight">
              <p className="font-semibold text-[#0b1c30]">Ns.Nyoman adi Sedana,S.Kep</p>
              <p className="text-[11px] text-[#64748b]">Sub Komite Manajemen Risiko</p>
            </div>
          </div>
        </div>
      </div>

      {/* Distinct High-Contrast Navigation Menu Bar */}
      <div className="bg-[#003b29] border-t-2 border-[#005d42] border-b border-[#002b1e] shadow-md py-1.5 px-3 sm:px-6">
        <div className="max-w-[1600px] mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-bold text-[#7bd8b1] uppercase tracking-wider pr-2 border-r border-white/15 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#00e699] animate-pulse" />
            <span>Menu Utama RS:</span>
          </div>

          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-[5px] transition whitespace-nowrap cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-[#00a86b] text-white shadow-md ring-2 ring-white/40'
                : 'text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15'
            }`}
          >
            <Activity className="w-4 h-4 text-white" />
            <span>Ikhtisar Eksekutif</span>
          </button>

          <button
            onClick={() => setCurrentTab('unit-risk')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-[5px] transition whitespace-nowrap cursor-pointer ${
              currentTab === 'unit-risk'
                ? 'bg-[#00a86b] text-white shadow-md ring-2 ring-white/40'
                : 'text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15'
            }`}
          >
            <Building2 className="w-4 h-4 text-white" />
            <span>Manajemen Risiko Unit</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] tabular-nums font-bold ${
              currentTab === 'unit-risk' ? 'bg-black/25 text-white' : 'bg-white/20 text-[#a7f3d0]'
            }`}>
              22 Unit
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('rs-risk')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-[5px] transition whitespace-nowrap cursor-pointer ${
              currentTab === 'rs-risk'
                ? 'bg-[#dc2626] text-white shadow-md ring-2 ring-white/40'
                : 'text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-[#fca5a5]" />
            <span>Manajemen Risiko Rumah Sakit</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] tabular-nums font-bold bg-[#fee2e2] text-[#991b1b]">
              Ekstrem &amp; Tinggi
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('rca-workspace')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-[5px] transition whitespace-nowrap cursor-pointer ${
              currentTab === 'rca-workspace'
                ? 'bg-[#7c3aed] text-white shadow-md ring-2 ring-white/40'
                : 'text-purple-100 hover:text-white bg-purple-900/40 hover:bg-purple-900/60 border border-purple-400/30'
            }`}
          >
            <GitBranch className="w-4 h-4 text-[#d8b4fe]" />
            <span className="flex items-center gap-1.5">
              <span>Investigasi RCA</span>
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            </span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] tabular-nums font-bold ${
              currentTab === 'rca-workspace' ? 'bg-black/25 text-white' : 'bg-[#f3e8ff] text-[#6b21a8]'
            }`}>
              {totalEkstremRisks > 0 ? `${totalEkstremRisks} Mandatori` : 'RCA & AI'}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('ppi-risk')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-[5px] transition whitespace-nowrap cursor-pointer ${
              currentTab === 'ppi-risk'
                ? 'bg-[#0284c7] text-white shadow-md ring-2 ring-white/40'
                : 'text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#7dd3fc]" />
            <span>Manajemen Risiko PPI</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] tabular-nums font-bold ${
              currentTab === 'ppi-risk' ? 'bg-black/25 text-white' : 'bg-[#e0f2fe] text-[#0369a1]'
            }`}>
              11 Kategori {totalPpiRisks > 0 && `(${totalPpiRisks})`}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('mfk-risk')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-[5px] transition whitespace-nowrap cursor-pointer ${
              currentTab === 'mfk-risk'
                ? 'bg-[#ea580c] text-white shadow-md ring-2 ring-white/40'
                : 'text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15'
            }`}
          >
            <Shield className="w-4 h-4 text-[#fdba74]" />
            <span>Manajemen Risiko MFK</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] tabular-nums font-bold ${
              currentTab === 'mfk-risk' ? 'bg-black/25 text-white' : 'bg-[#ffedd5] text-[#c2410c]'
            }`}>
              7 Standar {totalMfkRisks > 0 && `(${totalMfkRisks})`}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('matrix-5x5')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-[5px] transition whitespace-nowrap cursor-pointer ${
              currentTab === 'matrix-5x5'
                ? 'bg-[#00a86b] text-white shadow-md ring-2 ring-white/40'
                : 'text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15'
            }`}
          >
            <Grid3X3 className="w-4 h-4 text-white" />
            <span>Matriks 5x5 RS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
