import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Plus, 
  Eye, 
  GitBranch, 
  Calendar, 
  ArrowUpDown, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { ClinicalIncident, RiskLevel, IncidentType, IncidentStatus } from '../types/clinical';
import { getRiskBadgeStyle, getIncidentTypeDetails } from '../utils/riskCalculators';
import { exportIncidentsToExcel } from '../utils/excelExport';

interface IncidentRegistryViewProps {
  incidents: ClinicalIncident[];
  onSelectIncident: (incident: ClinicalIncident) => void;
  onOpenRca: (incident: ClinicalIncident) => void;
  onOpenNewForm: () => void;
}

export const IncidentRegistryView: React.FC<IncidentRegistryViewProps> = ({
  incidents,
  onSelectIncident,
  onOpenRca,
  onOpenNewForm,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'id'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtered & Sorted Incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch =
        inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.patientHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.chronology.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.riskOfficer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRisk = selectedRiskFilter === 'ALL' || inc.riskLevel === selectedRiskFilter;
      const matchesType = selectedTypeFilter === 'ALL' || inc.incidentType === selectedTypeFilter;
      const matchesDept = selectedDeptFilter === 'ALL' || inc.department === selectedDeptFilter;
      const matchesStatus = selectedStatusFilter === 'ALL' || inc.status === selectedStatusFilter;

      return matchesSearch && matchesRisk && matchesType && matchesDept && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.incidentDate).getTime();
        const dateB = new Date(b.incidentDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'score') {
        return sortOrder === 'asc' ? a.riskScore - b.riskScore : b.riskScore - a.riskScore;
      } else {
        return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
      }
    });
  }, [incidents, searchQuery, selectedRiskFilter, selectedTypeFilter, selectedDeptFilter, selectedStatusFilter, sortBy, sortOrder]);

  // Export to Structured Excel (.xls)
  const handleExportCSV = () => {
    exportIncidentsToExcel(filteredIncidents, 'Ns.Nyoman adi Sedana,S.Kep');
  };

  const departments = Array.from(new Set(incidents.map(i => i.department)));

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0b1c30] tracking-tight">
            Registri Insiden Keselamatan Pasien (IKP)
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
            Buku Register Resmi Laporan Insiden Rumah Sakit Terakreditasi STARKES Kemenkes RI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#334155] border border-[#cbd5e1] hover:bg-[#f8fafc] text-xs font-semibold rounded-[4px] cursor-pointer transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#475569]" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#334155] border border-[#cbd5e1] hover:bg-[#f8fafc] text-xs font-semibold rounded-[4px] cursor-pointer transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#475569]" />
            <span>Cetak Berkas</span>
          </button>
          <button
            onClick={onOpenNewForm}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#005d42] hover:bg-[#064e3b] text-white text-xs font-semibold rounded-[4px] cursor-pointer transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Lapor Insiden Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID IKP, Kode Pasien, Kronologi, Petugas..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] placeholder-[#94a3b8] focus:border-[#005d42] focus:ring-2 focus:ring-[#005d42]/20 outline-none"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="w-full py-2 px-2.5 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] outline-none"
            >
              <option value="ALL">Semua Tingkat Risiko</option>
              <option value="EKSTREM">[15-25] EKSTREM</option>
              <option value="TINGGI">[10-14] TINGGI</option>
              <option value="SEDANG">[4-9] SEDANG</option>
              <option value="RENDAH">[1-3] RENDAH</option>
            </select>
          </div>

          {/* Incident Type Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full py-2 px-2.5 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] outline-none"
            >
              <option value="ALL">Semua Klasifikasi (IKP)</option>
              <option value="SENTINEL">Kejadian Sentinel</option>
              <option value="KTD">KTD (Adverse Event)</option>
              <option value="KNC">KNC (Near Miss)</option>
              <option value="KTC">KTC (No Harm)</option>
              <option value="KPC">KPC (Reportable)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full py-2 px-2.5 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] outline-none"
            >
              <option value="ALL">Semua Status Investigasi</option>
              <option value="DILAPORKAN">DILAPORKAN</option>
              <option value="INVESTIGASI_SEDERHANA">INVESTIGASI SEDERHANA</option>
              <option value="RCA_BERJALAN">RCA BERJALAN</option>
              <option value="CAPA_DISETUJUI">CAPA DISETUJUI</option>
              <option value="SELESAI">SELESAI / TERVERIFIKASI</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Tag Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#f1f5f9] text-xs">
          <span className="text-[#64748b] text-[11px] font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter Cepat:
          </span>
          <button
            onClick={() => setSelectedRiskFilter('EKSTREM')}
            className={`px-2 py-0.5 rounded-[4px] border text-[11px] font-bold cursor-pointer transition ${
              selectedRiskFilter === 'EKSTREM'
                ? 'bg-[#e11d48] text-white border-[#e11d48]'
                : 'bg-[#fff1f2] text-[#9f1239] border-[#fecdd3]'
            }`}
          >
            Ekstrem Saja
          </button>
          <button
            onClick={() => setSelectedTypeFilter('SENTINEL')}
            className={`px-2 py-0.5 rounded-[4px] border text-[11px] font-bold cursor-pointer transition ${
              selectedTypeFilter === 'SENTINEL'
                ? 'bg-[#be123c] text-white border-[#be123c]'
                : 'bg-[#ffe4e6] text-[#9f1239] border-[#fecdd3]'
            }`}
          >
            Sentinel Saja
          </button>
          <button
            onClick={() => setSelectedTypeFilter('KNC')}
            className={`px-2 py-0.5 rounded-[4px] border text-[11px] font-bold cursor-pointer transition ${
              selectedTypeFilter === 'KNC'
                ? 'bg-[#ca8a04] text-white border-[#ca8a04]'
                : 'bg-[#fefce8] text-[#854d0e] border-[#fef08a]'
            }`}
          >
            Near Miss (KNC)
          </button>
          <button
            onClick={() => {
              setSelectedRiskFilter('ALL');
              setSelectedTypeFilter('ALL');
              setSelectedStatusFilter('ALL');
              setSelectedDeptFilter('ALL');
              setSearchQuery('');
            }}
            className="text-[11px] text-[#005683] hover:underline font-semibold ml-auto cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      </div>

      {/* Main Clinical Governance Data Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#475569] uppercase font-semibold text-[11px] tracking-wider">
                <th 
                  onClick={() => { setSortBy('id'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                  className="py-3 px-4 font-semibold cursor-pointer select-none hover:text-[#0b1c30]"
                >
                  <div className="flex items-center gap-1">
                    <span>ID Insiden</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94a3b8]" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Pasien (RM)</th>
                <th 
                  onClick={() => { setSortBy('date'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                  className="py-3 px-4 font-semibold cursor-pointer select-none hover:text-[#0b1c30]"
                >
                  <div className="flex items-center gap-1">
                    <span>Tanggal & Lokasi</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94a3b8]" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Rincian Kejadian Klinis</th>
                <th className="py-3 px-4 font-semibold">Jenis IKP</th>
                <th 
                  onClick={() => { setSortBy('score'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                  className="py-3 px-4 font-semibold cursor-pointer select-none hover:text-[#0b1c30]"
                >
                  <div className="flex items-center gap-1">
                    <span>Grading Risiko</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94a3b8]" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Petugas Risiko</th>
                <th className="py-3 px-4 font-semibold">Status Alur</th>
                <th className="py-3 px-4 font-semibold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-xs text-[#64748b]">
                    Tidak ada insiden yang memenuhi kriteria filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident, idx) => {
                  const badge = getRiskBadgeStyle(incident.riskLevel);
                  const typeInfo = getIncidentTypeDetails(incident.incidentType);
                  const isEven = idx % 2 === 0;

                  return (
                    <tr
                      key={incident.id}
                      onClick={() => onSelectIncident(incident)}
                      className={`hover:bg-[#f1f5f9] transition cursor-pointer ${
                        isEven ? 'bg-white' : 'bg-[#f8fafc]'
                      }`}
                    >
                      {/* Monospaced Incident ID */}
                      <td className="py-3 px-4 font-mono font-bold text-[#0b1c30] tabular-nums whitespace-nowrap">
                        {incident.id}
                      </td>

                      {/* Patient Identifier Hash */}
                      <td className="py-3 px-4 font-mono text-[#334155] tabular-nums whitespace-nowrap">
                        <div className="font-semibold">{incident.patientHash}</div>
                        <div className="text-[10px] text-[#64748b]">
                          {incident.patientGender}, {incident.patientAge} thn
                        </div>
                      </td>

                      {/* Date & Clinical Unit */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-[#0b1c30]">{incident.department.split('(')[0]}</div>
                        <div className="text-[11px] text-[#64748b] flex items-center gap-1 tabular-nums mt-0.5">
                          <Calendar className="w-3 h-3 text-[#94a3b8]" />
                          <span>{incident.incidentDate}</span>
                        </div>
                      </td>

                      {/* Clinical Title & Chronology */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-semibold text-[#0f172a] line-clamp-1">{incident.title}</div>
                        <div className="text-[11px] text-[#475569] line-clamp-1 mt-0.5">{incident.chronology}</div>
                      </td>

                      {/* Incident Classification Chip */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          style={{ color: typeInfo.color, backgroundColor: typeInfo.badgeBg }}
                          className="px-2 py-0.5 rounded-[4px] font-bold text-[10px] uppercase border border-current/20 inline-block"
                        >
                          {incident.incidentType}
                        </span>
                      </td>

                      {/* Risk Grading Badge (Strict 4px soft corner) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          style={{ backgroundColor: badge.bg, borderColor: badge.border, color: badge.text }}
                          className="px-2.5 py-1 rounded-[4px] font-bold text-[11px] border inline-flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-[2px]" style={{ backgroundColor: badge.dotColor }} />
                          {badge.label}
                        </span>
                      </td>

                      {/* Assigned Officer */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-[#0b1c30] text-xs">{incident.riskOfficer}</div>
                        <div className="text-[10px] text-[#64748b]">{incident.reporterRole}</div>
                      </td>

                      {/* Investigation Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-semibold ${
                          incident.status === 'SELESAI'
                            ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                            : incident.status === 'RCA_BERJALAN'
                            ? 'bg-[#fff1f2] text-[#9f1239] border border-[#fecdd3]'
                            : 'bg-[#eff4ff] text-[#005683] border border-[#d5e3fc]'
                        }`}>
                          {incident.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectIncident(incident)}
                            className="p-1.5 hover:bg-[#e2e8f0] rounded-[4px] text-[#005683] transition cursor-pointer"
                            title="Tinjau Detail Kasus"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {(incident.riskLevel === 'EKSTREM' || incident.riskLevel === 'TINGGI' || incident.incidentType === 'SENTINEL') && (
                            <button
                              onClick={() => onOpenRca(incident)}
                              className="p-1.5 bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#e11d48] border border-[#fecdd3] rounded-[4px] text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                              title="Buka Ruang Kerja RCA"
                            >
                              <GitBranch className="w-3 h-3" />
                              <span className="text-[10px]">RCA</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Bar */}
        <div className="p-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#515f74] gap-2">
          <div>
            Menampilkan <strong className="text-[#0b1c30]">{filteredIncidents.length}</strong> dari{' '}
            <strong className="text-[#0b1c30]">{incidents.length}</strong> seluruh insiden terdaftar.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-[2px] bg-[#e11d48]" /> Ekstrem: {incidents.filter(i => i.riskLevel === 'EKSTREM').length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-[2px] bg-[#f97316]" /> Tinggi: {incidents.filter(i => i.riskLevel === 'TINGGI').length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-[2px] bg-[#eab308]" /> Sedang: {incidents.filter(i => i.riskLevel === 'SEDANG').length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-[2px] bg-[#059669]" /> Rendah: {incidents.filter(i => i.riskLevel === 'RENDAH').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
