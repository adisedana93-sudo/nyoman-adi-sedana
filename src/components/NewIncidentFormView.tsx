import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Send, 
  AlertCircle, 
  HelpCircle, 
  CheckCircle2, 
  ShieldAlert,
  Info,
  Calendar,
  Clock,
  User,
  Building
} from 'lucide-react';
import { 
  ClinicalIncident, 
  IncidentType, 
  SeverityImpact, 
  ProbabilityFreq, 
  ClinicalDepartment,
  RiskLevel 
} from '../types/clinical';
import { 
  calculateRisk, 
  getRiskBadgeStyle, 
  IMPACT_DESCRIPTIONS, 
  FREQUENCY_DESCRIPTIONS,
  getIncidentTypeDetails 
} from '../utils/riskCalculators';

interface NewIncidentFormViewProps {
  onCancel: () => void;
  onSubmit: (newIncident: ClinicalIncident) => void;
}

export const NewIncidentFormView: React.FC<NewIncidentFormViewProps> = ({
  onCancel,
  onSubmit,
}) => {
  // Form State
  const [patientHash, setPatientHash] = useState(`RM-${Math.floor(1000 + Math.random() * 9000)}-${['KT', 'LP', 'ZX', 'BN', 'GH'][Math.floor(Math.random() * 5)]}`);
  const [patientAge, setPatientAge] = useState<number>(45);
  const [patientGender, setPatientGender] = useState<'L' | 'P'>('L');
  const [patientPayer, setPatientPayer] = useState<'BPJS Kesehatan' | 'Asuransi Swasta' | 'Umum / Mandiri'>('BPJS Kesehatan');
  const [room, setRoom] = useState('Ruang Rawat Inap Lt. 3');

  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 10));
  const [incidentTime, setIncidentTime] = useState('09:30');
  const [department, setDepartment] = useState<ClinicalDepartment>('IGD (Instalasi Gawat Darurat)');
  const [incidentType, setIncidentType] = useState<IncidentType>('KNC');
  const [skpCategory, setSkpCategory] = useState<'SKP.1' | 'SKP.2' | 'SKP.3' | 'SKP.4' | 'SKP.5' | 'SKP.6' | 'LAINNYA'>('SKP.1');
  
  const [title, setTitle] = useState('');
  const [chronology, setChronology] = useState('');
  const [initialAction, setInitialAction] = useState('');

  // Live Risk Grading Matrix State
  const [impactScore, setImpactScore] = useState<SeverityImpact>(2);
  const [freqScore, setFreqScore] = useState<ProbabilityFreq>(3);

  // Reporter info
  const [reporterName, setReporterName] = useState('dr. Spesialis / Ns. Perawat Primer');
  const [reporterRole, setReporterRole] = useState('Perawat Penanggung Jawab Pasien (PPJP)');
  const [riskOfficer, setRiskOfficer] = useState('Tim Mutu & Keselamatan Pasien (KMKP)');

  // Calculate live risk evaluation
  const computedRisk = calculateRisk(impactScore, freqScore);
  const badgeStyle = getRiskBadgeStyle(computedRisk.level);
  const activeTypeInfo = getIncidentTypeDetails(incidentType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !chronology.trim()) {
      alert('Mohon isi Judul Insiden dan Kronologi Kejadian dengan lengkap.');
      return;
    }

    const nextId = `IKP-2026-${Math.floor(1050 + Math.random() * 900)}`;
    const fullDateTime = `${incidentDate} ${incidentTime}`;

    const newIncident: ClinicalIncident = {
      id: nextId,
      patientHash,
      patientAge,
      patientGender,
      patientPayer,
      room,
      incidentDate: fullDateTime,
      reportDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      department,
      incidentType,
      title,
      chronology,
      initialAction: initialAction || 'Tindakan pertolongan pertama telah diberikan dan kondisi tanda vital pasien terpantau stabil.',
      impactScore,
      freqScore,
      riskScore: computedRisk.score,
      riskLevel: computedRisk.level,
      skpCategory,
      reporterName,
      reporterRole,
      riskOfficer,
      status: computedRisk.level === 'EKSTREM' || computedRisk.level === 'TINGGI' || incidentType === 'SENTINEL' ? 'RCA_BERJALAN' : 'DILAPORKAN',
      deadlineDays: computedRisk.deadlineDays,
      requiresBoardNotification: computedRisk.level === 'EKSTREM' || incidentType === 'SENTINEL',
      why5: [
        title,
        'Faktor pemicu awal pada proses alur kerja klinis.',
        'Belum tersedianya safeguard / sistem verifikasi ganda yang kedap salah.',
        'Beban kerja dan waktu respon komunikasi antar-shift.',
        'Perlu standarisasi SOP dan integrasi EMR penunjang.'
      ],
      fishboneData: {
        man: ['Faktor beban kerja shift', 'Komunikasi operan belum optimal'],
        method: ['SOP perlu disosialisasikan berkala'],
        machine: ['Alat/Sistem pencatatan elektronik'],
        material: ['Ketersediaan sarana pendukung'],
        environment: ['Tata ruang & kebisingan unit']
      },
      capaList: [
        {
          id: `CAPA-${nextId}-A`,
          action: `Investigasi dan perbaikan prosedur terkait ${title}`,
          pic: riskOfficer,
          deadline: new Date(Date.now() + computedRisk.deadlineDays * 86400000).toISOString().slice(0, 10),
          status: 'TERENCANA'
        }
      ]
    };

    onSubmit(newIncident);
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-16 space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-[4px] text-[#475569] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0b1c30] tracking-tight">
              Formulir Pelaporan Insiden Keselamatan Pasien (IKP)
            </h2>
            <p className="text-xs sm:text-sm text-[#475569]">
              Format Standar Komite Nasional Keselamatan Pasien (KNKP) & Standar Akreditasi KARS STARKES.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-[#005d42] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-1 rounded-[4px] font-semibold">
            Budaya Tanpa Menyalahkan (No-Blame Culture)
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Prinsip Kerahasiaan */}
        <div className="bg-[#eff4ff] border border-[#d5e3fc] rounded-[8px] p-3 text-xs text-[#005683] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#005683] shrink-0 mt-0.5" />
          <div>
            <strong>Prinsip Pelaporan Insiden Rumah Sakit:</strong> Laporan ini bersifat rahasia (internal confidential), tidak untuk mencari kesalahan individu (non-punitive), melainkan demi perbaikan sistem mutu klinis dan keselamatan pasien rumah sakit.
          </div>
        </div>

        {/* Section 1: Data Pasien (Pseudonim demi Privasi Medis) */}
        <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-5 shadow-xs">
          <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-4 pb-2 border-b border-[#f1f5f9] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#005d42]" />
            1. Data Identitas Pasien (Tersamarkan)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Nomor Rekam Medis / Kode Hash Pasien
              </label>
              <input
                type="text"
                value={patientHash}
                onChange={(e) => setPatientHash(e.target.value)}
                required
                className="w-full h-[38px] px-3 bg-white border border-[#cbd5e1] rounded-[4px] text-xs font-mono font-semibold text-[#0b1c30] focus:border-[#005d42] focus:ring-2 focus:ring-[#005d42]/20 outline-none"
              />
              <span className="text-[10px] text-[#64748b]">Format RM terlindungi undang-undang</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Usia Pasien (Tahun)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={patientAge}
                onChange={(e) => setPatientAge(parseInt(e.target.value) || 0)}
                required
                className="w-full h-[38px] px-3 bg-white border border-[#cbd5e1] rounded-[4px] text-xs tabular-nums text-[#0b1c30] focus:border-[#005d42] focus:ring-2 focus:ring-[#005d42]/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Jenis Kelamin
              </label>
              <div className="flex items-center gap-4 h-[38px]">
                <label className="flex items-center gap-1.5 text-xs text-[#0b1c30] cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={patientGender === 'L'}
                    onChange={() => setPatientGender('L')}
                    className="w-4 h-4 accent-[#005d42]"
                  />
                  <span>Laki-laki (L)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-[#0b1c30] cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={patientGender === 'P'}
                    onChange={() => setPatientGender('P')}
                    className="w-4 h-4 accent-[#005d42]"
                  />
                  <span>Perempuan (P)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Penjamin Pembayaran
              </label>
              <select
                value={patientPayer}
                onChange={(e) => setPatientPayer(e.target.value as any)}
                className="w-full h-[38px] px-2.5 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] outline-none"
              >
                <option value="BPJS Kesehatan">BPJS Kesehatan</option>
                <option value="Asuransi Swasta">Asuransi Swasta</option>
                <option value="Umum / Mandiri">Umum / Mandiri</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Waktu, Lokasi, dan Sasaran Keselamatan Pasien (SKP) */}
        <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-5 shadow-xs">
          <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-4 pb-2 border-b border-[#f1f5f9] flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#005d42]" />
            2. Waktu, Tempat Kejadian & Kategori SKP
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Tanggal Terjadinya Insiden
              </label>
              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                required
                className="w-full h-[38px] px-3 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Waktu / Jam Kejadian
              </label>
              <input
                type="time"
                value={incidentTime}
                onChange={(e) => setIncidentTime(e.target.value)}
                required
                className="w-full h-[38px] px-3 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Instalasi / Unit Kerja Kejadian
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as ClinicalDepartment)}
                className="w-full h-[38px] px-2.5 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] outline-none"
              >
                <option value="IGD (Instalasi Gawat Darurat)">IGD (Instalasi Gawat Darurat)</option>
                <option value="ICU / Intensive Care">ICU / Intensive Care</option>
                <option value="Kamar Operasi (OK / Bedah Sentral)">Kamar Operasi (OK / Bedah Sentral)</option>
                <option value="Instalasi Farmasi">Instalasi Farmasi</option>
                <option value="Rawat Inap Penyakit Dalam">Rawat Inap Penyakit Dalam</option>
                <option value="Rawat Inap Bedah">Rawat Inap Bedah</option>
                <option value="Rawat Inap Pediatri & Perinatologi">Rawat Inap Pediatri & Perinatologi</option>
                <option value="Laboratorium & Bank Darah">Laboratorium & Bank Darah</option>
                <option value="Instalasi Radiologi">Instalasi Radiologi</option>
                <option value="Rawat Jalan / Poliklinik">Rawat Jalan / Poliklinik</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Ruangan Spesifik / Bed
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="misal: Bed 3 ICU, Meja Operasi 2"
                required
                className="w-full h-[38px] px-3 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] outline-none"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#f1f5f9] grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Klasifikasi Jenis Insiden (IKP Standar Kemenkes RI)
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                className="w-full h-[38px] px-2.5 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] font-semibold focus:border-[#005d42] outline-none"
              >
                <option value="SENTINEL">Kejadian Sentinel (Kematian tidak terduga/cedera fisik berat permanen)</option>
                <option value="KTD">KTD - Kejadian Tidak Diharapkan (Adverse Event / cedera pada pasien)</option>
                <option value="KNC">KNC - Kejadian Nyaris Celaka (Near Miss / insiden terdeteksi sebelum terpapar)</option>
                <option value="KTC">KTC - Kejadian Tidak Cedera (No Harm / terpapar tapi tidak timbul cedera)</option>
                <option value="KPC">KPC - Kondisi Potensial Cedera (Reportable Circumstance / potensi bahaya nyata)</option>
              </select>
              <p className="text-[11px] text-[#475569] mt-1 italic">
                {activeTypeInfo.desc}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Sasaran Keselamatan Pasien (SKP) Terkait
              </label>
              <select
                value={skpCategory}
                onChange={(e) => setSkpCategory(e.target.value as any)}
                className="w-full h-[38px] px-2.5 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] outline-none"
              >
                <option value="SKP.1">SKP 1: Mengidentifikasi Pasien dengan Benar</option>
                <option value="SKP.2">SKP 2: Meningkatkan Komunikasi yang Efektif (SBAR/Readback)</option>
                <option value="SKP.3">SKP 3: Keamanan Obat-obatan yang Harus Diwaspadai (High Alert / LASA)</option>
                <option value="SKP.4">SKP 4: Lokasi Pembedahan yang Benar, Prosedur Benar, Pasien Benar</option>
                <option value="SKP.5">SKP 5: Pengurangan Risiko Infeksi Terkait Pelayanan Kesehatan (HAIs)</option>
                <option value="SKP.6">SKP 6: Pengurangan Risiko Pasien Jatuh</option>
                <option value="LAINNYA">Lainnya / Sarana & Fasilitas Medis</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Kronologi & Tindakan Pertolongan Pertama */}
        <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider pb-2 border-b border-[#f1f5f9]">
            3. Rincian Kronologis & Tindakan Segera Pasca Insiden
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Judul Ringkas Insiden <span className="text-[#e11d48]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Kesalahan Pemberian Obat High-Alert pada Pasien Post-Operasi..."
              required
              className="w-full h-[38px] px-3 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] focus:ring-2 focus:ring-[#005d42]/20 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Kronologi Lengkap Peristiwa Kejadian <span className="text-[#e11d48]">*</span>
            </label>
            <textarea
              rows={4}
              value={chronology}
              onChange={(e) => setChronology(e.target.value)}
              placeholder="Jelaskan secara runtut urutan waktu, siapa yang terlibat, apa yang terjadi, dan faktor yang memperparah/meringankan kejadian..."
              required
              className="w-full p-3 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] focus:ring-2 focus:ring-[#005d42]/20 outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Tindakan Penyelamatan Langsung yang Telah Dilakukan Pasca Kejadian
            </label>
            <textarea
              rows={2}
              value={initialAction}
              onChange={(e) => setInitialAction(e.target.value)}
              placeholder="Pertolongan pertama medis, pemanggilan dokter penanggung jawab, penghentian obat, evaluasi tanda vital..."
              className="w-full p-3 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] focus:ring-2 focus:ring-[#005d42]/20 outline-none"
            />
          </div>
        </div>

        {/* Section 4: KALKULATOR GRADING RISIKO KLINIS (5x5 Matrix) TERINTEGRASI */}
        <div className="bg-white border-2 border-[#005d42]/30 rounded-[8px] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e2e8f0]">
            <div>
              <h3 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#005d42]" />
                4. Matriks Grading Risiko Klinis Otomatis (Standar KNKP)
              </h3>
              <p className="text-xs text-[#475569]">
                Tentukan nilai dampak klinis dan probabilitas pengulangan kejadian untuk menentukan tingkat eskalasi investigasi.
              </p>
            </div>
            {/* Live Badge Preview */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-[#64748b]">Hasil Grading:</span>
              <span
                style={{ backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border, color: badgeStyle.text }}
                className="px-3 py-1 rounded-[4px] font-bold text-xs border inline-flex items-center gap-1.5 shadow-xs"
              >
                <span className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: badgeStyle.dotColor }} />
                {badgeStyle.label} (Skor {computedRisk.score})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tingkat Dampak / Konsekuensi (1-5) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
                A. Tingkat Keparahan / Dampak Klinis (1 - 5)
              </label>
              <div className="space-y-1.5">
                {([1, 2, 3, 4, 5] as SeverityImpact[]).map((level) => {
                  const desc = IMPACT_DESCRIPTIONS[level];
                  const isChecked = impactScore === level;
                  return (
                    <label
                      key={level}
                      className={`flex items-start gap-2.5 p-2 rounded-[4px] border cursor-pointer transition ${
                        isChecked
                          ? 'bg-[#ecfdf5] border-[#005d42] text-[#005d42]'
                          : 'bg-white border-[#e2e8f0] text-[#334155] hover:bg-[#f8fafc]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="impactScore"
                        value={level}
                        checked={isChecked}
                        onChange={() => setImpactScore(level)}
                        className="mt-0.5 accent-[#005d42]"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-[#0b1c30]">{desc.name}</div>
                        <div className="text-[11px] text-[#64748b] leading-tight">{desc.clinicalDesc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Tingkat Probabilitas / Frekuensi (1-5) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
                B. Tingkat Probabilitas / Frekuensi Terjadinya (1 - 5)
              </label>
              <div className="space-y-1.5">
                {([1, 2, 3, 4, 5] as ProbabilityFreq[]).map((level) => {
                  const desc = FREQUENCY_DESCRIPTIONS[level];
                  const isChecked = freqScore === level;
                  return (
                    <label
                      key={level}
                      className={`flex items-start gap-2.5 p-2 rounded-[4px] border cursor-pointer transition ${
                        isChecked
                          ? 'bg-[#eff4ff] border-[#005683] text-[#005683]'
                          : 'bg-white border-[#e2e8f0] text-[#334155] hover:bg-[#f8fafc]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="freqScore"
                        value={level}
                        checked={isChecked}
                        onChange={() => setFreqScore(level)}
                        className="mt-0.5 accent-[#005683]"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-[#0b1c30]">{desc.name}</div>
                        <div className="text-[11px] text-[#64748b] leading-tight">{desc.clinicalDesc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Clinical Action Recommendation Box */}
          <div
            style={{ backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border }}
            className="p-3.5 rounded-[4px] border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4"
          >
            <div>
              <div className="font-bold" style={{ color: badgeStyle.text }}>
                REKOMENDASI TINDAKAN INVESTIGASI REGULASI (KNKP / KARS):
              </div>
              <p className="mt-0.5 text-[#334155]">
                {computedRisk.recommendation}
              </p>
            </div>
            <div className="shrink-0 font-bold px-3 py-1.5 bg-white/90 border border-current rounded-[4px] text-center" style={{ color: badgeStyle.text }}>
              Batas Waktu: {computedRisk.deadlineDays} Hari
            </div>
          </div>
        </div>

        {/* Section 5: Data Pelapor & Saksi */}
        <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-5 shadow-xs">
          <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-4 pb-2 border-b border-[#f1f5f9]">
            5. Verifikasi Data Pelapor & Petugas Mutu Penanggung Jawab
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Nama Pelapor Pertama
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                required
                className="w-full h-[38px] px-3 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Profesi / Jabatan Pelapor
              </label>
              <input
                type="text"
                value={reporterRole}
                onChange={(e) => setReporterRole(e.target.value)}
                required
                className="w-full h-[38px] px-3 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Petugas Risiko / Risk Officer Ditugaskan
              </label>
              <input
                type="text"
                value={riskOfficer}
                onChange={(e) => setRiskOfficer(e.target.value)}
                required
                className="w-full h-[38px] px-3 bg-white border border-[#cbd5e1] rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions Button Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2e8f0]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-white text-[#334155] border border-[#cbd5e1] hover:bg-[#f8fafc] text-xs font-semibold rounded-[4px] cursor-pointer transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#005d42] hover:bg-[#064e3b] text-white text-xs font-semibold rounded-[4px] cursor-pointer transition shadow-xs flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim & Registrasikan Laporan IKP</span>
          </button>
        </div>
      </form>
    </div>
  );
};
