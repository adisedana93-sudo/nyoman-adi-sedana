import React from 'react';
import { 
  X, 
  Printer, 
  GitBranch, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  Building2, 
  User, 
  Activity, 
  ArrowRight
} from 'lucide-react';
import { ClinicalIncident } from '../types/clinical';
import { getRiskBadgeStyle, getIncidentTypeDetails, IMPACT_DESCRIPTIONS, FREQUENCY_DESCRIPTIONS } from '../utils/riskCalculators';

interface IncidentDetailModalProps {
  incident: ClinicalIncident | null;
  onClose: () => void;
  onOpenRca: (incident: ClinicalIncident) => void;
  onUpdateStatus: (incidentId: string, newStatus: ClinicalIncident['status']) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onOpenRca,
  onUpdateStatus,
}) => {
  if (!incident) return null;

  const badge = getRiskBadgeStyle(incident.riskLevel);
  const typeInfo = getIncidentTypeDetails(incident.incidentType);
  const impactDesc = IMPACT_DESCRIPTIONS[incident.impactScore];
  const freqDesc = FREQUENCY_DESCRIPTIONS[incident.freqScore];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-[#cbd5e1] rounded-[8px] max-w-4xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-[#0b1c30] bg-white border border-[#cbd5e1] px-2.5 py-1 rounded-[4px] shadow-xs">
              {incident.id}
            </span>
            <span
              style={{ backgroundColor: badge.bg, borderColor: badge.border, color: badge.text }}
              className="px-2.5 py-0.5 rounded-[4px] font-bold text-xs border inline-flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: badge.dotColor }} />
              {badge.label}
            </span>
            <span
              style={{ color: typeInfo.color, backgroundColor: typeInfo.badgeBg }}
              className="px-2 py-0.5 rounded-[4px] font-bold text-xs uppercase border border-current/20 hidden sm:inline-block"
            >
              {incident.incidentType}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] rounded-[4px] text-xs font-semibold text-[#334155] cursor-pointer transition shadow-xs"
              title="Cetak Berkas Laporan Resmi KNKP"
            >
              <Printer className="w-3.5 h-3.5 text-[#475569]" />
              <span>Cetak Berkas</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#64748b] hover:text-[#0b1c30] hover:bg-[#e2e8f0] rounded-[4px] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-[#334155]">
          {/* Printable Official Hospital Letterhead (appears during print & modal viewing) */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b-2 border-[#0b1c30] gap-3">
            <div className="h-14 flex items-center shrink-0">
              <img
                src="/assets/aistudio/15_4_2021_23.23.16__1__f9550c83.png"
                alt="Logo RSU SHANTI GRAHA"
                className="h-full w-auto max-w-[240px] object-contain block drop-shadow-xs"
              />
            </div>
            <div className="text-center sm:text-right space-y-0.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0b1c30]">
                Komite Mutu & Keselamatan Pasien Rumah Sakit (KMKP)
              </div>
              <div className="text-[11px] font-semibold text-[#475569]">
                BERKAS LAPORAN RESMI INSIDEN KESELAMATAN PASIEN (IKP)
              </div>
              <div className="text-[10px] text-[#64748b]">
                Standar Akreditasi Kemenkes RI / STARKES KARS 2026
              </div>
            </div>
          </div>

          {/* Incident Title & Sentinel Alert */}
          {incident.requiresBoardNotification && (
            <div className="p-3 bg-[#fff1f2] border border-[#fecdd3] rounded-[4px] text-[#9f1239] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-[#e11d48]" />
                <span>KEJADIAN BERISIKO EKSTREM / SENTINEL: Wajib Notifikasi Direksi & Investigasi RCA &lt; 45 Hari</span>
              </div>
              <span className="text-[10px] bg-white border border-[#fecdd3] px-2 py-0.5 rounded-[4px] font-bold">
                Kemenkes RI
              </span>
            </div>
          )}

          <div>
            <h3 className="text-base font-bold text-[#0f172a] leading-snug">
              {incident.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748b] mt-1">
              <span>Waktu Kejadian: <strong className="text-[#0b1c30] font-mono">{incident.incidentDate}</strong></span>
              <span>•</span>
              <span>Unit: <strong className="text-[#0b1c30]">{incident.department}</strong></span>
              <span>•</span>
              <span>Ruangan: <strong className="text-[#0b1c30]">{incident.room}</strong></span>
              <span>•</span>
              <span>Kategori: <strong className="text-[#005d42]">{incident.skpCategory}</strong></span>
            </div>
          </div>

          {/* Grid: Patient Profile & Matrix Result */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Data Pasien */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] p-3.5 space-y-2">
              <div className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider border-b border-[#cbd5e1] pb-1">
                Data Pasien (Tersamarkan)
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#64748b] block text-[10px]">No. Rekam Medis (Hash):</span>
                  <strong className="font-mono text-[#0b1c30]">{incident.patientHash}</strong>
                </div>
                <div>
                  <span className="text-[#64748b] block text-[10px]">Usia & Gender:</span>
                  <strong>{incident.patientAge} Tahun ({incident.patientGender === 'L' ? 'Laki-laki' : 'Perempuan'})</strong>
                </div>
                <div>
                  <span className="text-[#64748b] block text-[10px]">Penjamin Pembayaran:</span>
                  <span>{incident.patientPayer}</span>
                </div>
                <div>
                  <span className="text-[#64748b] block text-[10px]">Tanggal Lapor:</span>
                  <span className="font-mono">{incident.reportDate}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Hasil Matriks Risiko 5x5 */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] p-3.5 space-y-2">
              <div className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider border-b border-[#cbd5e1] pb-1 flex items-center justify-between">
                <span>Grading Risiko Klinis (5x5)</span>
                <span style={{ color: badge.text }} className="font-bold">
                  Skor: {incident.riskScore} ({badge.label})
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-[#64748b] text-[10px] block">Dampak Klinis (Tingkat {incident.impactScore}):</span>
                  <strong>{impactDesc?.name}</strong>
                  <p className="text-[10px] text-[#64748b]">{impactDesc?.clinicalDesc}</p>
                </div>
                <div>
                  <span className="text-[#64748b] text-[10px] block">Frekuensi (Tingkat {incident.freqScore}):</span>
                  <strong>{freqDesc?.name}</strong>
                  <p className="text-[10px] text-[#64748b]">{freqDesc?.clinicalDesc}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chronology & Initial Action */}
          <div className="space-y-3">
            <div className="border border-[#e2e8f0] rounded-[6px] p-3.5 bg-white">
              <div className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-1.5 text-[#005d42]">
                Kronologi Rinci Insiden
              </div>
              <p className="leading-relaxed text-xs text-[#1e293b]">
                {incident.chronology}
              </p>
            </div>

            <div className="border border-[#e2e8f0] rounded-[6px] p-3.5 bg-[#f8fafc]">
              <div className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-1.5">
                Tindakan Langsung Pasca Kejadian
              </div>
              <p className="leading-relaxed text-xs text-[#334155]">
                {incident.initialAction}
              </p>
            </div>
          </div>

          {/* Root Cause & CAPA Actions Tracker */}
          <div className="border border-[#e2e8f0] rounded-[6px] p-3.5 space-y-3 bg-white">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2">
              <div className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-[#005d42]" />
                Rencana Tindak Lanjut Korektif & Preventif (CAPA)
              </div>
              <span className="text-[10px] text-[#64748b] font-medium">
                {incident.capaList.length} Item Tindakan
              </span>
            </div>

            <div className="divide-y divide-[#f1f5f9]">
              {incident.capaList.map((item) => (
                <div key={item.id} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono font-bold text-[#0b1c30] mr-2">{item.id}:</span>
                    <span className="text-[#334155]">{item.action}</span>
                    <div className="text-[10px] text-[#64748b] mt-0.5">
                      PIC: <strong>{item.pic}</strong> | Target: <strong className="font-mono">{item.deadline}</strong>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold shrink-0 ${
                    item.status === 'SELESAI'
                      ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                      : 'bg-[#fff7ed] text-[#9a3412] border border-[#ffedd5]'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Official Signatures Section (Formatted for accreditation printing) */}
          <div className="pt-8 border-t border-[#cbd5e1] grid grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-12">
              <p className="text-[#64748b]">Pelapor Pertama</p>
              <div>
                <p className="font-bold underline text-[#0b1c30]">{incident.reporterName}</p>
                <p className="text-[10px] text-[#64748b]">{incident.reporterRole}</p>
              </div>
            </div>
            <div className="space-y-12">
              <p className="text-[#64748b]">Petugas Risiko / KMKP</p>
              <div>
                <p className="font-bold underline text-[#0b1c30]">{incident.riskOfficer}</p>
                <p className="text-[10px] text-[#64748b]">Komite Mutu & Keselamatan Pasien</p>
              </div>
            </div>
            <div className="space-y-12">
              <p className="text-[#64748b]">Mengetahui,</p>
              <div>
                <p className="font-bold underline text-[#0b1c30]">Direktur Medis & Keperawatan</p>
                <p className="text-[10px] text-[#64748b]">RSU SHANTI GRAHA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748b]">Ubah Status:</span>
            <select
              value={incident.status}
              onChange={(e) => onUpdateStatus(incident.id, e.target.value as any)}
              className="py-1 px-2.5 bg-white border border-[#cbd5e1] rounded-[4px] text-xs font-semibold text-[#0b1c30] outline-none"
            >
              <option value="DILAPORKAN">DILAPORKAN</option>
              <option value="INVESTIGASI_SEDERHANA">INVESTIGASI SEDERHANA</option>
              <option value="RCA_BERJALAN">RCA BERJALAN</option>
              <option value="CAPA_DISETUJUI">CAPA DISETUJUI</option>
              <option value="SELESAI">SELESAI / TERVERIFIKASI</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {(incident.riskLevel === 'EKSTREM' || incident.riskLevel === 'TINGGI' || incident.incidentType === 'SENTINEL') && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRca(incident);
                }}
                className="px-3.5 py-2 bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#e11d48] border border-[#fecdd3] rounded-[4px] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Buka Ruang Kerja RCA</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#005d42] hover:bg-[#064e3b] text-white rounded-[4px] text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              Tutup Berkas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
