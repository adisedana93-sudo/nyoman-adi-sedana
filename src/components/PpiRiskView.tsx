import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  FileSpreadsheet, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Eye,
  Trash2,
  Edit
} from 'lucide-react';
import { UnitRiskItem, HospitalUnit, StarkesRiskCategory } from '../types/clinical';
import { 
  ALL_HOSPITAL_UNITS, 
  PPI_CATEGORIES_CONFIG 
} from '../data/mockRiskManagementData';
import { getRiskBadgeStyle } from '../utils/riskCalculators';
import { exportRiskRegisterToExcel } from '../utils/excelExport';

interface PpiRiskViewProps {
  risks: UnitRiskItem[];
  onAddOrUpdateRisk: (item: UnitRiskItem) => void;
  onDeleteRisk: (id: string) => void;
  onOpenAddModalWithCategory?: (category: StarkesRiskCategory) => void;
}

export const PpiRiskView: React.FC<PpiRiskViewProps> = ({
  risks,
  onAddOrUpdateRisk,
  onDeleteRisk,
  onOpenAddModalWithCategory
}) => {
  const [selectedPpiKey, setSelectedPpiKey] = useState<string>('ALL');
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter only PPI risks
  const allPpiRisks = useMemo(() => {
    return risks.filter(r => r.categoryKey.startsWith('PPI_'));
  }, [risks]);

  // Filtered PPI risks based on user criteria
  const filteredPpiRisks = useMemo(() => {
    return allPpiRisks.filter((item) => {
      if (selectedPpiKey !== 'ALL' && item.categoryKey !== selectedPpiKey) return false;
      if (selectedUnit !== 'ALL' && item.unit !== selectedUnit) return false;
      if (selectedGrade !== 'ALL' && item.grade !== selectedGrade) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const match = item.id.toLowerCase().includes(q) ||
                      item.statement.toLowerCase().includes(q) ||
                      item.rootCause.toLowerCase().includes(q) ||
                      item.pic.toLowerCase().includes(q) ||
                      item.mitigation.toLowerCase().includes(q) ||
                      item.unit.toLowerCase().includes(q) ||
                      item.unitLabel.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [allPpiRisks, selectedPpiKey, selectedUnit, selectedGrade, searchQuery]);

  // Stats
  const statTotal = filteredPpiRisks.length;
  const statExtreme = filteredPpiRisks.filter(r => r.grade === 'EKSTREM').length;
  const statHigh = filteredPpiRisks.filter(r => r.grade === 'TINGGI').length;
  const statModerate = filteredPpiRisks.filter(r => r.grade === 'SEDANG').length;
  const statLow = filteredPpiRisks.filter(r => r.grade === 'RENDAH').length;
  const statControlled = filteredPpiRisks.filter(r => r.status === 'Controlled').length;

  // Active Category Details
  const activeCategoryObj = PPI_CATEGORIES_CONFIG.find(c => c.key === selectedPpiKey);

  // Export to Excel
  const handleExportPpiExcel = () => {
    const title = selectedPpiKey === 'ALL'
      ? 'Risk Register Program PPI (11 Kategori Standar Infeksi)'
      : `Risk Register PPI: ${activeCategoryObj?.label}`;

    const scopeLabel = selectedPpiKey === 'ALL'
      ? 'Seluruh 11 Kategori Standar PPI (RSU SHANTI GRAHA)'
      : `${activeCategoryObj?.code} - ${activeCategoryObj?.label}`;

    exportRiskRegisterToExcel(filteredPpiRisks, {
      title,
      scopeLabel,
      officerName: 'Ns.Nyoman adi Sedana,S.Kep',
    });
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Top Banner Context */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-5 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-[6px] bg-[#005683] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-[#005683] bg-[#eff4ff] border border-[#d5e3fc] px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
                  KOMITE PENCEGAHAN & PENGENDALIAN INFEKSI (PPI)
                </span>
                <span className="text-[11px] font-medium text-[#64748b]">
                  11 Kategori Standar PPI STARKES Kemenkes RI
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0b1c30] tracking-tight mt-1">
                Manajemen Risiko PPI Rumah Sakit
              </h2>
              <p className="text-xs text-[#515f74] mt-0.5 max-w-3xl">
                Otomatis terisi langsung dari inputan Risk Register di seluruh 22 unit kerja yang memilih salah satu dari 11 Kategori Standar PPI.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start xl:self-auto">
            <button
              onClick={handleExportPpiExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#eff4ff] hover:bg-[#dbeafe] text-[#005683] border border-[#bfdbfe] rounded-[4px] text-xs font-semibold cursor-pointer transition shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#005683]" />
              <span>Unduh Matriks Excel PPI (.xls)</span>
            </button>
            {onOpenAddModalWithCategory && (
              <button
                onClick={() => onOpenAddModalWithCategory(
                  (selectedPpiKey !== 'ALL' ? selectedPpiKey : 'PPI_SURVEILANCE') as StarkesRiskCategory
                )}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#005683] hover:bg-[#004b73] text-white rounded-[4px] text-xs font-semibold cursor-pointer transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Risiko PPI</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#e2e8f0] p-4 rounded-[6px] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider block">
            Total Risiko PPI Terdata
          </span>
          <span className="text-2xl font-bold text-[#0b1c30] mt-1 block tabular-nums">
            {allPpiRisks.length}
          </span>
          <span className="text-[10px] text-[#515f74] mt-1 block">
            Tersebar di {new Set(allPpiRisks.map(r => r.unit)).size} Unit Kerja RS
          </span>
        </div>

        <div className="bg-white border border-[#fecdd3] p-4 rounded-[6px] shadow-xs bg-gradient-to-br from-white to-[#fff1f2]/40">
          <span className="text-[11px] font-semibold text-[#9f1239] uppercase tracking-wider block">
            Risiko PPI Ekstrem (Merah)
          </span>
          <span className="text-2xl font-bold text-[#991b1b] mt-1 block tabular-nums">
            {allPpiRisks.filter(r => r.grade === 'EKSTREM').length}
          </span>
          <span className="text-[10px] text-[#7f1d1d] mt-1 block">
            Perlu tindakan cepat &lt; 24 jam
          </span>
        </div>

        <div className="bg-white border border-[#fef08a] p-4 rounded-[6px] shadow-xs bg-gradient-to-br from-white to-[#fefce8]/60">
          <span className="text-[11px] font-semibold text-[#854d0e] uppercase tracking-wider block">
            Risiko PPI Tinggi (Kuning)
          </span>
          <span className="text-2xl font-bold text-[#a16207] mt-1 block tabular-nums">
            {allPpiRisks.filter(r => r.grade === 'TINGGI').length}
          </span>
          <span className="text-[10px] text-[#713f12] mt-1 block">
            Dipantau rutin Komite PPI
          </span>
        </div>

        <div className="bg-white border border-[#e2e8f0] p-4 rounded-[6px] shadow-xs">
          <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider block">
            Terkendali (Controlled)
          </span>
          <span className="text-2xl font-bold text-[#15803d] mt-1 block tabular-nums">
            {allPpiRisks.filter(r => r.status === 'Controlled').length}
          </span>
          <span className="text-[10px] text-[#475569] mt-1 block">
            Dari total {allPpiRisks.length} item risiko
          </span>
        </div>
      </div>

      {/* 11 PPI Categories Quick Navigation Grid */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-[#f1f5f9] pb-2">
          <h3 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
            <span>Pilih 11 Kategori Standar PPI</span>
            <span className="text-[10px] font-normal text-[#64748b] normal-case">(Klik salah satu untuk memfilter)</span>
          </h3>
          <button
            onClick={() => setSelectedPpiKey('ALL')}
            className={`text-xs font-bold px-2.5 py-1 rounded-[4px] cursor-pointer transition ${
              selectedPpiKey === 'ALL'
                ? 'bg-[#005683] text-white shadow-xs'
                : 'text-[#005683] hover:bg-[#eff4ff]'
            }`}
          >
            Tampilkan Semua 11 Kategori ({allPpiRisks.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {PPI_CATEGORIES_CONFIG.map((cat, idx) => {
            const count = allPpiRisks.filter(r => r.categoryKey === cat.key).length;
            const isSelected = selectedPpiKey === cat.key;

            return (
              <button
                key={cat.key}
                onClick={() => setSelectedPpiKey(cat.key)}
                className={`p-2.5 rounded-[6px] border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#005683] bg-[#eff4ff] shadow-xs ring-1 ring-[#005683]'
                    : 'border-[#e2e8f0] bg-white hover:border-[#005683]/50 hover:bg-[#f8fafc]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-[#005683] bg-white border border-[#bfdbfe] px-1.5 py-0.2 rounded-[3px]">
                      {cat.code}
                    </span>
                    <span className={`text-[11px] font-bold tabular-nums px-1.5 py-0.2 rounded-[3px] ${
                      count > 0 ? 'bg-[#005683] text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count} Risiko
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#0b1c30] leading-snug line-clamp-2">
                    {cat.label}
                  </h4>
                </div>
                <p className="text-[10px] text-[#64748b] mt-2 line-clamp-1">
                  {cat.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Table Section */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-5 shadow-xs space-y-4">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {/* Unit Filter */}
            <div className="min-w-[180px]">
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full bg-[#f8fafc] text-[#0b1c30] text-xs font-semibold px-2.5 py-1.5 rounded-[4px] border border-[#cbd5e1] cursor-pointer"
              >
                <option value="ALL">🏢 Semua Unit Kerja RS</option>
                {ALL_HOSPITAL_UNITS.map(u => (
                  <option key={u.key} value={u.key}>
                    📍 {u.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Filter */}
            <div className="min-w-[140px]">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full bg-[#f8fafc] text-[#0b1c30] text-xs font-semibold px-2.5 py-1.5 rounded-[4px] border border-[#cbd5e1] cursor-pointer"
              >
                <option value="ALL">Semua Grade</option>
                <option value="EKSTREM">EKSTREM (15-25)</option>
                <option value="TINGGI">TINGGI (10-14)</option>
                <option value="SEDANG">SEDANG (4-9)</option>
                <option value="RENDAH">RENDAH (1-3)</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari risiko PPI, akar penyebab, unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-[4px] text-xs focus:outline-none focus:border-[#005683]"
              />
            </div>
          </div>

          <div className="text-[11px] text-[#64748b] font-medium">
            Menampilkan <strong>{filteredPpiRisks.length}</strong> risiko PPI
          </div>
        </div>

        {/* Table or Empty State */}
        {filteredPpiRisks.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#cbd5e1] rounded-[6px] space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#eff4ff] text-[#005683] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-[#0b1c30]">Belum Ada Risiko PPI Terdata</h4>
            <p className="text-xs text-[#64748b] max-w-md mx-auto">
              {allPpiRisks.length === 0
                ? 'Semua isian risk register saat ini kosong. Saat petugas unit menginput risk register dan memilih salah satu dari 11 Kategori PPI, data akan langsung muncul otomatis di sini.'
                : 'Tidak ada data risiko PPI yang sesuai dengan kriteria filter yang Anda pilih.'}
            </p>
            {onOpenAddModalWithCategory && (
              <div className="pt-2">
                <button
                  onClick={() => onOpenAddModalWithCategory('PPI_SURVEILANCE')}
                  className="px-3.5 py-2 bg-[#005683] hover:bg-[#004b73] text-white rounded-[4px] text-xs font-semibold transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Input Risiko PPI Baru</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#475569] font-bold text-[11px]">
                  <th className="py-2.5 px-3">Kode & Unit</th>
                  <th className="py-2.5 px-3">Kategori PPI (11 Standar)</th>
                  <th className="py-2.5 px-3">Pernyataan Risiko & Dampak Infeksi</th>
                  <th className="py-2.5 px-2 text-center">P &times; D</th>
                  <th className="py-2.5 px-2 text-center">Skor</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3">Pengendalian & SOP PPI</th>
                  <th className="py-2.5 px-3 bg-emerald-50/70 text-[#047857]">Implementasi Yang Sudah Dilakukan</th>
                  <th className="py-2.5 px-3">PIC & Target</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredPpiRisks.map((item) => {
                  const badgeStyle = getRiskBadgeStyle(item.grade);

                  return (
                    <tr key={item.id} className="hover:bg-[#f8fafc] transition">
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span className="font-mono font-bold text-[#005683] block text-[11px]">
                          {item.id}
                        </span>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-[3px] text-[10px] font-semibold bg-[#eff4ff] text-[#005683] border border-[#d5e3fc]">
                          {item.unitLabel}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top max-w-[190px]">
                        <span className="text-[11px] font-bold text-[#1e293b] leading-tight block">
                          {item.categoryName}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top max-w-[320px]">
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

                      <td className="py-3 px-3 align-top max-w-[260px]">
                        <p className="text-xs text-[#1e293b] leading-snug">
                          {item.mitigation}
                        </p>
                      </td>

                      <td className="py-3 px-3 align-top max-w-[260px] bg-emerald-50/20">
                        {item.implementedActions ? (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-[#047857] leading-snug">
                              {item.implementedActions}
                            </p>
                            <div className="flex flex-wrap items-center gap-1 text-[10px]">
                              {item.implementationDate && (
                                <span className="text-emerald-700 font-mono">📅 {item.implementationDate}</span>
                              )}
                              {item.effectivenessEvaluation && (
                                <span className="font-bold text-[#047857] bg-emerald-100/70 px-1.5 py-0.2 rounded">
                                  {item.effectivenessEvaluation}
                                </span>
                              )}
                            </div>
                            {item.implementationEvidence && (
                              <span className="text-[10px] text-[#64748b] block italic">
                                Bukti: {item.implementationEvidence}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#94a3b8] italic">Belum dicatat</span>
                        )}
                      </td>

                      <td className="py-3 px-3 align-top text-[11px] whitespace-nowrap">
                        <div className="font-semibold text-[#0b1c30]">{item.pic}</div>
                        <div className="text-[10px] text-[#64748b]">{item.target}</div>
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

                      <td className="py-3 px-3 align-top text-center whitespace-nowrap">
                        <button
                          onClick={() => onDeleteRisk(item.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition cursor-pointer"
                          title="Hapus Risiko"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
