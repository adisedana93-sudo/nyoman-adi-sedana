import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingDown, 
  Building2, 
  BarChart3, 
  PieChart, 
  Activity, 
  FileSpreadsheet, 
  ArrowRight, 
  Check, 
  Filter, 
  Layers, 
  Grid3X3,
  ExternalLink,
  Info,
  ShieldCheck,
  ChevronRight,
  Shield,
  Plus,
  GitBranch,
  Sparkles
} from 'lucide-react';
import { UnitRiskItem, RiskLevel } from '../types/clinical';
import { ALL_HOSPITAL_UNITS } from '../data/mockRiskManagementData';
import { getRiskBadgeStyle } from '../utils/riskCalculators';
import { exportRiskRegisterToExcel } from '../utils/excelExport';

interface DashboardViewProps {
  risks: UnitRiskItem[];
  onNavigateTab: (tab: string) => void;
  onSelectUnit?: (unitKey: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  risks,
  onNavigateTab,
  onSelectUnit,
}) => {
  const [unitSortMetric, setUnitSortMetric] = useState<'total' | 'extreme'>('total');

  const riskData = risks;
  const totalRisks = riskData.length;
  const extremeRisks = riskData.filter(r => r.grade === 'EKSTREM');
  const highRisks = riskData.filter(r => r.grade === 'TINGGI');
  const moderateRisks = riskData.filter(r => r.grade === 'SEDANG');
  const lowRisks = riskData.filter(r => r.grade === 'RENDAH');

  const controlledRisks = riskData.filter(r => r.status === 'Controlled');
  const inProgressRisks = riskData.filter(r => r.status === 'In Progress');
  const openRisks = riskData.filter(r => r.status === 'Open');

  const approvedRisks = riskData.filter(r => r.verifStatus === 'Disetujui');
  const pctControlled = totalRisks > 0 ? Math.round((controlledRisks.length / totalRisks) * 100) : 0;
  const pctApproved = totalRisks > 0 ? Math.round((approvedRisks.length / totalRisks) * 100) : 0;

  const ppiRisksCount = riskData.filter(r => r.categoryKey.startsWith('PPI_')).length;
  const mfkRisksCount = riskData.filter(r => r.categoryKey.startsWith('MFK_')).length;

  // Unit breakdown data
  const unitStats = useMemo(() => {
    return ALL_HOSPITAL_UNITS.map(unit => {
      const unitItems = riskData.filter(r => r.unit === unit.key);
      const total = unitItems.length;
      const extreme = unitItems.filter(r => r.grade === 'EKSTREM').length;
      const high = unitItems.filter(r => r.grade === 'TINGGI').length;
      const moderate = unitItems.filter(r => r.grade === 'SEDANG').length;
      const low = unitItems.filter(r => r.grade === 'RENDAH').length;
      const controlled = unitItems.filter(r => r.status === 'Controlled').length;
      return {
        ...unit,
        total,
        extreme,
        high,
        moderate,
        low,
        controlled,
      };
    }).sort((a, b) => {
      if (unitSortMetric === 'extreme') {
        return (b.extreme + b.high) - (a.extreme + a.high);
      }
      return b.total - a.total;
    });
  }, [riskData, unitSortMetric]);

  // Priority risks (Ekstrem & Tinggi)
  const priorityRisks = useMemo(() => {
    return [...extremeRisks, ...highRisks].sort((a, b) => b.score - a.score).slice(0, 8);
  }, [extremeRisks, highRisks]);

  // Export full hospital risk report
  const handleExportFullHospitalXls = () => {
    exportRiskRegisterToExcel(riskData, {
      title: 'Laporan Eksekutif Manajemen Risiko Rumah Sakit',
      scopeLabel: 'Seluruh 22 Unit Kerja RSU SHANTI GRAHA',
      officerName: 'Ns.Nyoman adi Sedana,S.Kep',
    });
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-[6px] bg-[#005d42] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-[#005d42] bg-[#eff4ff] border border-[#d5e3fc] px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
                  IKHTISAR EKSEKUTIF MANAJEMEN RISIKO
                </span>
                <span className="text-[11px] font-medium text-[#64748b]">
                  Standar Akreditasi STARKES KARS 2026 • ISO 31000:2018
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0b1c30] tracking-tight mt-1">
                Dashboard Profil & Matriks Risiko Rumah Sakit
              </h2>
              <p className="text-xs text-[#515f74] mt-0.5 max-w-3xl">
                Pantauan terintegrasi seluruh profil risiko 22 unit kerja RSU SHANTI GRAHA, pengawasan risiko prioritas eskalasi Direktur, serta integrasi otomatis ke Manajemen Risiko PPI dan MFK.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
            <button
              onClick={() => onNavigateTab('rca-workspace')}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-[4px] text-xs font-semibold cursor-pointer transition shadow-xs"
              title="Buka Investigasi RCA 6 Langkah & AI"
            >
              <GitBranch className="w-4 h-4 text-purple-200" />
              <span>Investigasi RCA</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </button>
            <button
              onClick={handleExportFullHospitalXls}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#eff4ff] hover:bg-[#dbeafe] text-[#005683] border border-[#bfdbfe] rounded-[4px] text-xs font-semibold cursor-pointer transition shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#005683]" />
              <span>Unduh XLS Rapi</span>
            </button>
            <button
              onClick={() => onNavigateTab('unit-risk')}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#005d42] hover:bg-[#064e3b] text-white rounded-[4px] text-xs font-semibold cursor-pointer transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Input Risiko Unit Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards: Key Risk Management Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Risiko Terdaftar */}
        <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-[#64748b] text-[11px] font-semibold uppercase tracking-wider">
            <span>Total Risiko Terdaftar</span>
            <span className="text-[#005d42] bg-[#ecfdf5] border border-[#a7f3d0] px-1.5 py-0.5 rounded-[4px] font-bold text-[10px]">
              22 Unit RS
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-[#0f172a] tabular-nums">
              {totalRisks}
            </span>
            <span className="text-xs text-[#005d42] font-semibold bg-[#e6f4ea] px-2 py-0.5 rounded-full">
              {pctApproved}% Tervalidasi
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] text-[#475569]">
            <span>Risiko PPI: <strong className="text-[#005683]">{ppiRisksCount}</strong></span>
            <span>Risiko MFK: <strong className="text-[#9a3412]">{mfkRisksCount}</strong></span>
            <button
              onClick={() => onNavigateTab('unit-risk')}
              className="text-[#005d42] hover:underline font-semibold"
            >
              Lihat Unit &rarr;
            </button>
          </div>
        </div>

        {/* Card 2: Risiko Ekstrem (Merah) */}
        <div className="bg-white border border-[#fecdd3] rounded-[8px] p-4 shadow-xs bg-gradient-to-br from-white to-[#fff1f2]/40">
          <div className="flex items-center justify-between text-[#9f1239] text-[11px] font-semibold uppercase tracking-wider">
            <span>Risiko Ekstrem (Skor 15-25)</span>
            <span className="text-[#991b1b] bg-[#fee2e2] border border-[#fca5a5] px-1.5 py-0.5 rounded-[4px] font-bold text-[10px]">
              Eskalasi Direktur
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-[#991b1b] tabular-nums">
              {extremeRisks.length}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-[#b91c1c]">
              <ShieldAlert className="w-4 h-4 text-[#dc2626]" />
              <span>Tindakan &lt; 24 Jam</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#fecdd3]/60 flex items-center justify-between text-[11px] text-[#7f1d1d]">
            <button
              onClick={() => onNavigateTab('rca-workspace')}
              className="font-bold underline hover:text-[#991b1b] cursor-pointer flex items-center gap-1"
            >
              <GitBranch className="w-3 h-3 text-red-700" />
              <span>Investigasi RCA &rarr;</span>
            </button>
            <button
              onClick={() => onNavigateTab('rs-risk')}
              className="font-semibold text-slate-600 hover:text-[#0b1c30] cursor-pointer"
            >
              Prioritas RS &rarr;
            </button>
          </div>
        </div>

        {/* Card 3: Risiko Tinggi (Kuning) */}
        <div className="bg-white border border-[#fef08a] rounded-[8px] p-4 shadow-xs bg-gradient-to-br from-white to-[#fefce8]/60">
          <div className="flex items-center justify-between text-[#854d0e] text-[11px] font-semibold uppercase tracking-wider">
            <span>Risiko Tinggi (Skor 10-14)</span>
            <span className="text-[#854d0e] bg-[#fef9c3] border border-[#fef08a] px-1.5 py-0.5 rounded-[4px] font-bold text-[10px]">
              Perhatian Manajemen
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-[#a16207] tabular-nums">
              {highRisks.length}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#a16207]">
              <AlertTriangle className="w-4 h-4 text-[#d97706]" />
              <span>Mitigasi Aktif</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#fef08a]/60 flex items-center justify-between text-[11px] text-[#713f12]">
            <span>Kajian Manajemen Berkala</span>
            <span className="font-semibold">{totalRisks > 0 ? Math.round((highRisks.length / totalRisks) * 100) : 0}% Total</span>
          </div>
        </div>

        {/* Card 4: Status Mitigasi & Efektivitas Kontrol */}
        <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#64748b] text-[11px] font-semibold uppercase tracking-wider">
            <span>Efektivitas Pengendalian</span>
            <span className="text-[#0369a1] bg-[#e0f2fe] border border-[#bae6fd] px-1.5 py-0.5 rounded-[4px] font-bold text-[10px]">
              Target &gt; 80%
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-[#0f172a] tabular-nums">
              {pctControlled}%
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#005d42]">
              <CheckCircle2 className="w-4 h-4 text-[#005d42]" />
              <span>{controlledRisks.length} Terkendali</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] text-[#475569]">
            <span>In Progress: <strong className="text-[#d97706]">{inProgressRisks.length}</strong></span>
            <span>Open: <strong className="text-[#e11d48]">{openRisks.length}</strong></span>
            <span>Validasi KMKP: <strong className="text-[#005d42]">{pctApproved}%</strong></span>
          </div>
        </div>
      </div>

      {/* Row 1: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Distribusi Derajat Risiko RS - 5 Cols */}
        <div className="lg:col-span-5 bg-white border border-[#e2e8f0] rounded-[8px] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#005d42]" />
                <h3 className="text-sm font-bold text-[#0b1c30]">
                  Distribusi Tingkat Risiko Rumah Sakit
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-[#eff4ff] text-[#005683] px-2 py-0.5 rounded-[4px] border border-[#d5e3fc]">
                Matriks 5x5 KNKP
              </span>
            </div>

            {/* Visual Stacked Bar */}
            <div className="mt-4">
              {totalRisks === 0 ? (
                <div className="h-6 w-full rounded-[4px] bg-slate-100 flex items-center justify-center text-[11px] text-slate-400 font-medium">
                  Belum ada data risiko
                </div>
              ) : (
                <div className="h-6 w-full rounded-[4px] overflow-hidden flex shadow-xs border border-slate-200">
                  <div 
                    style={{ width: `${(extremeRisks.length / totalRisks) * 100}%` }}
                    className="bg-[#dc2626] h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-500"
                    title={`Ekstrem: ${extremeRisks.length}`}
                  >
                    {extremeRisks.length > 0 && `${Math.round((extremeRisks.length / totalRisks) * 100)}%`}
                  </div>
                  <div 
                    style={{ width: `${(highRisks.length / totalRisks) * 100}%` }}
                    className="bg-[#f59e0b] h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-500"
                    title={`Tinggi: ${highRisks.length}`}
                  >
                    {highRisks.length > 0 && `${Math.round((highRisks.length / totalRisks) * 100)}%`}
                  </div>
                  <div 
                    style={{ width: `${(moderateRisks.length / totalRisks) * 100}%` }}
                    className="bg-[#10b981] h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-500"
                    title={`Sedang: ${moderateRisks.length}`}
                  >
                    {moderateRisks.length > 0 && `${Math.round((moderateRisks.length / totalRisks) * 100)}%`}
                  </div>
                  <div 
                    style={{ width: `${(lowRisks.length / totalRisks) * 100}%` }}
                    className="bg-[#3b82f6] h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-500"
                    title={`Rendah: ${lowRisks.length}`}
                  >
                    {lowRisks.length > 0 && `${Math.round((lowRisks.length / totalRisks) * 100)}%`}
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Legend & Proportions with Bar Gauges */}
            <div className="mt-4 space-y-3">
              {/* Ekstrem */}
              <div className="p-2.5 rounded-[6px] border border-[#fecdd3] bg-[#fff1f2]/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-[3px] bg-[#dc2626] shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#991b1b]">EKSTREM (Merah)</span>
                      <span className="text-[10px] text-[#9f1239] font-medium">Skor 15 - 25</span>
                    </div>
                    <p className="text-[10px] text-[#64748b]">Wajib eskalasi Direktur, tindakan segera &lt; 24 jam</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#991b1b] tabular-nums">{extremeRisks.length}</span>
                  <span className="text-[11px] text-[#64748b] ml-1.5 font-medium">
                    ({totalRisks > 0 ? Math.round((extremeRisks.length / totalRisks) * 100) : 0}%)
                  </span>
                </div>
              </div>

              {/* Tinggi */}
              <div className="p-2.5 rounded-[6px] border border-[#fef08a] bg-[#fefce8]/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-[3px] bg-[#f59e0b] shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#a16207]">TINGGI (Kuning)</span>
                      <span className="text-[10px] text-[#854d0e] font-medium">Skor 10 - 14</span>
                    </div>
                    <p className="text-[10px] text-[#64748b]">Perhatian Manajemen RS, tindakan spesifik paling lambat 7 hari</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#a16207] tabular-nums">{highRisks.length}</span>
                  <span className="text-[11px] text-[#64748b] ml-1.5 font-medium">
                    ({totalRisks > 0 ? Math.round((highRisks.length / totalRisks) * 100) : 0}%)
                  </span>
                </div>
              </div>

              {/* Sedang */}
              <div className="p-2.5 rounded-[6px] border border-[#bbf7d0] bg-[#f0fdf4]/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-[3px] bg-[#10b981] shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#15803d]">SEDANG (Hijau)</span>
                      <span className="text-[10px] text-[#166534] font-medium">Skor 4 - 9</span>
                    </div>
                    <p className="text-[10px] text-[#64748b]">Tanggung jawab Kepala Unit, tindakan rutin &lt; 30 hari</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#15803d] tabular-nums">{moderateRisks.length}</span>
                  <span className="text-[11px] text-[#64748b] ml-1.5 font-medium">
                    ({totalRisks > 0 ? Math.round((moderateRisks.length / totalRisks) * 100) : 0}%)
                  </span>
                </div>
              </div>

              {/* Rendah */}
              <div className="p-2.5 rounded-[6px] border border-[#bfdbfe] bg-[#eff6ff]/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-[3px] bg-[#3b82f6] shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1d4ed8]">RENDAH (Biru)</span>
                      <span className="text-[10px] text-[#1e40af] font-medium">Skor 1 - 3</span>
                    </div>
                    <p className="text-[10px] text-[#64748b]">Dikelola prosedur SOP normal di unit kerja</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#1d4ed8] tabular-nums">{lowRisks.length}</span>
                  <span className="text-[11px] text-[#64748b] ml-1.5 font-medium">
                    ({totalRisks > 0 ? Math.round((lowRisks.length / totalRisks) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
            <span className="text-[11px] text-[#64748b]">
              Kriteria Matriks: <strong>Peluang (1-5) &times; Dampak (1-5)</strong>
            </span>
            <button
              onClick={() => onNavigateTab('matrix-5x5')}
              className="text-xs font-semibold text-[#005d42] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Matriks 5x5</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Chart 2: Peta Sebaran Risiko per Unit Kerja RS - 7 Cols */}
        <div className="lg:col-span-7 bg-white border border-[#e2e8f0] rounded-[8px] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#005d42]" />
                <div>
                  <h3 className="text-sm font-bold text-[#0b1c30]">
                    Peta Sebaran Risiko per Unit Kerja (22 Unit RS)
                  </h3>
                  <p className="text-[11px] text-[#64748b]">
                    Pemeringkatan beban risiko unit pelayanan klinis dan penunjang medis
                  </p>
                </div>
              </div>

              {/* Sort Switch */}
              <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-[4px] self-start sm:self-auto">
                <button
                  onClick={() => setUnitSortMetric('total')}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-[3px] transition cursor-pointer ${
                    unitSortMetric === 'total' ? 'bg-white text-[#0b1c30] shadow-xs' : 'text-[#64748b]'
                  }`}
                >
                  Total Risiko
                </button>
                <button
                  onClick={() => setUnitSortMetric('extreme')}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-[3px] transition cursor-pointer ${
                    unitSortMetric === 'extreme' ? 'bg-[#991b1b] text-white shadow-xs' : 'text-[#64748b]'
                  }`}
                >
                  Ekstrem & Tinggi
                </button>
              </div>
            </div>

            {/* Units Visual Horizontal Bar Chart */}
            <div className="mt-4 space-y-2.5">
              {totalRisks === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs border border-dashed border-slate-200 rounded-[6px]">
                  Belum ada risiko terdata di 22 unit kerja. Tambahkan risiko baru di Manajemen Risiko Unit.
                </div>
              ) : (
                unitStats.slice(0, 8).map((unit) => {
                  const maxVal = Math.max(...unitStats.map(u => u.total), 1);
                  const pct = Math.round((unit.total / maxVal) * 100);
                  const hasExtreme = unit.extreme > 0;
                  const hasHigh = unit.high > 0;

                  return (
                    <div key={unit.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (onSelectUnit) onSelectUnit(unit.key);
                              onNavigateTab('unit-risk');
                            }}
                            className="font-semibold text-[#0b1c30] hover:text-[#005d42] hover:underline cursor-pointer flex items-center gap-1 text-left"
                          >
                            <span>{unit.label}</span>
                            <ChevronRight className="w-3 h-3 text-[#94a3b8]" />
                          </button>
                          {hasExtreme && (
                            <span className="px-1.5 py-0.2 rounded-[3px] text-[9px] font-bold bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]">
                              {unit.extreme} Ekstrem
                            </span>
                          )}
                          {hasHigh && (
                            <span className="px-1.5 py-0.2 rounded-[3px] text-[9px] font-bold bg-[#fef9c3] text-[#854d0e] border border-[#fef08a]">
                              {unit.high} Tinggi
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-semibold text-[#475569] tabular-nums">
                          {unit.total} Risiko
                        </div>
                      </div>

                      {/* Multi-segmented Progress Bar */}
                      <div className="h-2.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden flex">
                        <div 
                          style={{ width: `${(unit.extreme / (unit.total || 1)) * pct}%` }}
                          className="bg-[#dc2626] h-full"
                          title={`${unit.extreme} Ekstrem`}
                        />
                        <div 
                          style={{ width: `${(unit.high / (unit.total || 1)) * pct}%` }}
                          className="bg-[#f59e0b] h-full"
                          title={`${unit.high} Tinggi`}
                        />
                        <div 
                          style={{ width: `${(unit.moderate / (unit.total || 1)) * pct}%` }}
                          className="bg-[#10b981] h-full"
                          title={`${unit.moderate} Sedang`}
                        />
                        <div 
                          style={{ width: `${(unit.low / (unit.total || 1)) * pct}%` }}
                          className="bg-[#3b82f6] h-full"
                          title={`${unit.low} Rendah`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
            <span className="text-[#64748b] text-[11px]">
              Menampilkan beban risiko di 22 unit pelayanan klinis & penunjang medis.
            </span>
            <button
              onClick={() => onNavigateTab('unit-risk')}
              className="text-xs font-semibold text-[#005d42] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Kelola Semua 22 Unit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Priority Hospital Risk Table (Ekstrem & Tinggi) */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#dc2626]" />
            <div>
              <h3 className="text-sm font-bold text-[#0b1c30]">
                Daftar Risiko Prioritas Eskalasi Direktur (Grade Ekstrem & Tinggi)
              </h3>
              <p className="text-[11px] text-[#64748b]">
                Risiko dengan nilai matriks tertinggi (Skor &ge; 10) yang dipantau dalam rapat komite mutu bulanan
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('rs-risk')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#991b1b] hover:bg-[#7f1d1d] text-white rounded-[4px] text-xs font-semibold cursor-pointer transition shadow-xs self-start sm:self-auto"
          >
            <span>Buka Manajemen Risiko RS Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Priority Risks Table or Empty */}
        {priorityRisks.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs border border-dashed border-slate-200 rounded-[6px] mt-4">
            Saat ini tidak ada risiko berderajat Ekstrem atau Tinggi terdaftar.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#475569] font-bold text-[11px]">
                  <th className="py-2.5 px-3">Kode & Unit Kerja</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Pernyataan Risiko & Dampak</th>
                  <th className="py-2.5 px-2 text-center">P &times; D</th>
                  <th className="py-2.5 px-2 text-center">Skor</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3">Rencana Pengendalian & PIC</th>
                  <th className="py-2.5 px-3 text-center">Target</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {priorityRisks.map((item) => {
                  const badgeStyle = getRiskBadgeStyle(item.grade);

                  return (
                    <tr key={item.id} className="hover:bg-[#f8fafc] transition">
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span className="font-mono font-bold text-[#005d42] block text-[11px]">
                          {item.id}
                        </span>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-[3px] text-[10px] font-semibold bg-[#eff4ff] text-[#005683] border border-[#d5e3fc]">
                          {item.unitLabel}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top max-w-[180px]">
                        <span className="text-[11px] font-medium text-[#475569] leading-tight block">
                          {item.categoryName}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top max-w-[340px]">
                        <p className="font-semibold text-[#0b1c30] text-xs leading-snug">
                          {item.statement}
                        </p>
                        {item.rootCause && (
                          <p className="text-[11px] text-[#64748b] mt-1 leading-snug italic">
                            Akar Penyebab: {item.rootCause}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-2 align-top text-center font-mono font-semibold text-[#334155] whitespace-nowrap">
                        {item.p} &times; {item.d}
                      </td>

                      <td className="py-3 px-2 align-top text-center font-bold text-[#0b1c30] tabular-nums text-sm">
                        {item.score}
                      </td>

                      <td className="py-3 px-3 align-top text-center whitespace-nowrap">
                        <span 
                          style={{ backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border, color: badgeStyle.text }}
                          className="inline-block px-2 py-0.5 rounded-[4px] text-[10px] font-bold border"
                        >
                          {item.grade}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top max-w-[280px]">
                        <p className="text-xs text-[#1e293b] leading-snug">
                          {item.mitigation}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#64748b] mt-1">
                          <span className="font-semibold text-[#005d42]">PIC:</span>
                          <span>{item.pic}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 align-top text-center whitespace-nowrap text-[11px] text-[#475569] font-medium">
                        {item.target}
                      </td>

                      <td className="py-3 px-3 align-top text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Controlled' ? 'bg-[#dcfce7] text-[#15803d]' :
                          item.status === 'In Progress' ? 'bg-[#fef9c3] text-[#854d0e]' :
                          'bg-[#fee2e2] text-[#991b1b]'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
