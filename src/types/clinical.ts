/**
 * Tipe Data & Definisi Standar Tata Kelola Klinis & Keselamatan Pasien (KPRS / KNKP)
 */

export type IncidentType = 
  | 'SENTINEL' // Kejadian Sentinel (kematian tidak terduga/kehilangan fungsi permanen)
  | 'KTD'      // Kejadian Tidak Diharapkan (Adverse Event - cedera pada pasien)
  | 'KNC'      // Kejadian Nyaris Celaka (Near Miss - insiden belum terpapar ke pasien)
  | 'KTC'      // Kejadian Tidak Cedera (No Harm Incident - terpapar tapi tidak timbul cedera)
  | 'KPC';     // Kondisi Potensial Cedera (Reportable Circumstance - situasi berpotensi bahaya)

export type SeverityImpact = 1 | 2 | 3 | 4 | 5; 
// 1: Tidak Signifikan, 2: Minor, 3: Moderat, 4: Mayor, 5: Katastropik

export type ProbabilityFreq = 1 | 2 | 3 | 4 | 5; 
// 1: Sangat Jarang (> 5 thn/kali), 2: Jarang (2-5 thn/kali), 3: Mungkin (1-2 thn/kali), 4: Sering (beberapa bln/kali), 5: Sangat Sering (tiap minggu/bln)

export type RiskLevel = 'EKSTREM' | 'TINGGI' | 'SEDANG' | 'RENDAH';

export type IncidentStatus = 
  | 'DILAPORKAN'
  | 'INVESTIGASI_SEDERHANA'
  | 'RCA_BERJALAN'
  | 'CAPA_DISETUJUI'
  | 'SELESAI';

export type ClinicalDepartment = 
  | 'IGD (Instalasi Gawat Darurat)'
  | 'ICU / Intensive Care'
  | 'Kamar Operasi (OK / Bedah Sentral)'
  | 'Instalasi Farmasi'
  | 'Rawat Inap Penyakit Dalam'
  | 'Rawat Inap Bedah'
  | 'Rawat Inap Pediatri & Perinatologi'
  | 'Laboratorium & Bank Darah'
  | 'Instalasi Radiologi'
  | 'Rawat Jalan / Poliklinik';

export interface CapaItem {
  id: string;
  action: string;
  pic: string;
  deadline: string;
  status: 'TERENCANA' | 'PROSES' | 'SELESAI';
  evidence?: string;
}

export interface FishboneData {
  man: string[];
  method: string[];
  machine: string[];
  material: string[];
  environment: string[];
}

export interface ClinicalIncident {
  id: string; // e.g. IKP-2026-1042
  patientHash: string; // e.g. RM-8842-PX
  patientAge: number;
  patientGender: 'L' | 'P';
  patientPayer: 'BPJS Kesehatan' | 'Asuransi Swasta' | 'Umum / Mandiri';
  room: string;
  incidentDate: string; // YYYY-MM-DD HH:mm
  reportDate: string;
  department: ClinicalDepartment;
  incidentType: IncidentType;
  title: string;
  chronology: string;
  initialAction: string;
  impactScore: SeverityImpact;
  freqScore: ProbabilityFreq;
  riskScore: number; // 1-25
  riskLevel: RiskLevel;
  skpCategory: 'SKP.1' | 'SKP.2' | 'SKP.3' | 'SKP.4' | 'SKP.5' | 'SKP.6' | 'LAINNYA';
  reporterName: string;
  reporterRole: string;
  riskOfficer: string;
  status: IncidentStatus;
  deadlineDays: number; // e.g. 45 for RCA, 14 for simple
  fishboneData?: FishboneData;
  why5?: string[];
  capaList: CapaItem[];
  resolutionNotes?: string;
  requiresBoardNotification: boolean;
}

export type HospitalUnit = 
  | 'pendaftaran'
  | 'kasir'
  | 'farmasi'
  | 'IGD'
  | 'radiologi'
  | 'laboratorium'
  | 'ruang operasi'
  | 'VK'
  | 'PICU NICU'
  | 'ICU'
  | 'Teknisi'
  | 'CS'
  | 'CSSD'
  | 'laundry'
  | 'GIZI'
  | 'Ruang Jenazah'
  | 'Keuangan'
  | 'SDM'
  | 'marketing'
  | 'Diklat'
  | 'kesling'
  | 'rawat Inap';

export type StarkesRiskCategory = 
  // Standar Klinis & Tata Kelola
  | 'KLINIS'
  | 'FINANSIAL'
  | 'HUKUM'
  | 'OPERASIONAL'
  // 11 Kategori Standar PPI Lengkap
  | 'PPI_SURVEILANCE'            // PPI SURVEILANCE IDO,ISK,PLEBITIS
  | 'PPI_UNIT_RISIKO'            // PPI KEGIATAN UNIT YANG BERISIKO TERJADINYA INFEKSI
  | 'PPI_ALAT_TINGGI'            // PPI PELAYANAN YANG MENGGUNAKAN PERALATAN BERISIKO TINGGI INFEKSI
  | 'PPI_TINDAKAN'               // PPI TINDAKAN BERISIKO TINGGI INFEKSI
  | 'PPI_DISTRIBUSI_LINEN'       // PPI PELAYANAN DISTRIBUSI LINEN BERSIH DAN KOTOR
  | 'PPI_STERILISASI'            // PPI PELAYANAN STERILISASI ALAT
  | 'PPI_KEBERSIHAN_LINGKUNGAN'  // PPI KEBERSIHAN LINGKUNGAN
  | 'PPI_LAUNDRY'                // PPI PENGELOLAAN LINEN/LAUNDRY
  | 'PPI_SAMPAH'                 // PPI PENGELOLAAN SAMPAH MEDIS DAN NON MEDIS
  | 'PPI_GIZI'                   // PPI PENYEDIAAN MAKANAN
  | 'PPI_JENAZAH'                // PPI PENGELOLAAN KAMAR JENAZAH
  // 7 Kategori Standar MFK Lengkap
  | 'MFK_1'                      // MFK 1 – MANAJEMEN KESELAMATAN
  | 'MFK_2'                      // MFK 2 – KEAMANAN
  | 'MFK_3'                      // MFK 3 – B3
  | 'MFK_4'                      // MFK 4 – UTILITAS
  | 'MFK_5'                      // MFK 5 – KEBAKARAN
  | 'MFK_6'                      // MFK 6 – ALAT MEDIS
  | 'MFK_7';                     // MFK 7 – BENCANA

export interface UnitRiskItem {
  id: string; // e.g. RR-IGD-001
  unit: HospitalUnit;
  unitLabel: string;
  categoryKey: StarkesRiskCategory;
  categoryName: string;
  statement: string; // Pernyataan Risiko (Potensi Bahaya)
  rootCause: string; // Akar Masalah (Penyebab)
  p: number; // 1-5
  d: number; // 1-5
  score: number; // p * d
  grade: 'EKSTREM' | 'TINGGI' | 'SEDANG' | 'RENDAH';
  mitigation: string; // Rencana Mitigasi & Pengendalian
  implementedActions?: string; // Implementasi yang sudah dilakukan oleh unit kerja
  implementationDate?: string; // Tanggal pelaksanaan implementasi
  implementationEvidence?: string; // Bukti pelaksanaan / dokumen pendukung
  effectivenessEvaluation?: 'EFEKTIF' | 'CUKUP_EFEKTIF' | 'BELUM_EFEKTIF'; // Evaluasi hasil implementasi
  pic: string;
  target: string;
  verifierUnit: string;
  verifStatus: 'Disetujui' | 'Perlu Revisi' | 'Belum Dicek';
  verifNote: string;
  status: 'Open' | 'In Progress' | 'Controlled';
  isHospitalPriority?: boolean; // Menandai bahwa risiko ini diambil/diadopsi menjadi prioritas Rumah Sakit
  escalatedAt?: string; // Tanggal pengangkatan ke prioritas RS
  escalatedBy?: string; // Petugas yang mengangkat (Ns.Nyoman adi Sedana,S.Kep)
  hospitalEscalationNote?: string; // Catatan pertimbangan pengangkatan prioritas RS
  rcaData?: RcaInvestigationData; // Hasil analisis investigasi komprehensif RCA
}

export interface RcaInvestigationData {
  investigationId: string;
  riskId: string;
  startDate: string;
  targetDate: string;
  leader: string; // Ns.Nyoman adi Sedana,S.Kep
  teamMembers: string[];
  // Langkah 1: Pernyataan Masalah & Pemicu
  problemStatement: string;
  chronologySummary: string;
  triggerEvent: string;
  // Langkah 2: Bukti & Fakta Lapangan
  gatheredFacts: string[];
  impactDescription: string;
  // Langkah 3: Fishbone 5M
  fishbone: {
    man: string[];
    method: string[];
    machine: string[];
    material: string[];
    environment: string[];
  };
  // Langkah 4: 5-Whys
  why5: string[];
  fundamentalRootCause: string;
  // Langkah 5: Matriks Tindakan CAPA
  capaActions: Array<{
    id: string;
    action: string;
    pic: string;
    deadline: string;
    evidence?: string;
    status: 'TERENCANA' | 'PROSES' | 'SELESAI';
  }>;
  // Langkah 6: Rekomendasi Direktur & Sub Komite
  directorRecommendations: string;
  subCommitteeNote: string;
  status: 'DRAF' | 'SEDANG_INVESTIGASI' | 'SELESAI';
  generatedByAi?: boolean;
  updatedAt?: string;
}

export type RiskCategory = 
  | 'KLINIS' 
  | 'FASILITAS_K3' 
  | 'FINANSIAL' 
  | 'LEGAL_REPUTASI' 
  | 'TEKNOLOGI_SIMRS';

export type RiskTreatmentStrategy = 'MITIGASI' | 'TRANSFER' | 'HINDARI' | 'TERIMA';

export type ControlEffectiveness = 'EFEKTIF' | 'CUKUP' | 'KURANG';

export interface ComprehensiveRiskItem {
  id: string; // e.g. RSK-2026-001
  code: string; // e.g. MR-KLIN-01
  title: string;
  category: RiskCategory;
  unit: ClinicalDepartment;
  hazard: string;
  causes: string[];
  consequences: string[];
  inherentImpact: SeverityImpact;
  inherentFreq: ProbabilityFreq;
  inherentScore: number;
  inherentLevel: RiskLevel;
  existingControls: string[];
  controlEffectiveness: ControlEffectiveness;
  residualImpact: SeverityImpact;
  residualFreq: ProbabilityFreq;
  residualScore: number;
  residualLevel: RiskLevel;
  treatmentStrategy: RiskTreatmentStrategy;
  actionPlan: string;
  actionStatus: 'BELUM_MULAI' | 'DALAM_PROSES' | 'SELESAI';
  actionProgress: number; // 0-100%
  pic: string;
  reviewDate: string;
  kri: string;
  kriStatus: 'AMAN' | 'WASPADA' | 'KRITIS';
  kriCurrent: string;
  kriTarget: string;
}

export interface FmeaItem {
  id: string;
  processStep: string;
  potentialFailure: string;
  potentialEffect: string;
  severity: number; // 1-10
  potentialCause: string;
  occurrence: number; // 1-10
  currentControls: string;
  detection: number; // 1-10 (10 = hardest to detect)
  rpnInitial: number; // S * O * D
  recommendedAction: string;
  pic: string;
  revisedSeverity: number;
  revisedOccurrence: number;
  revisedDetection: number;
  rpnRevised: number;
  status: 'ANALISIS' | 'PERBAIKAN' | 'VALIDASI';
}

export interface HospitalRiskRegisterItem {
  id: string;
  riskTitle: string;
  unit: ClinicalDepartment;
  hazardDescription: string;
  inherentImpact: SeverityImpact;
  inherentFreq: ProbabilityFreq;
  inherentScore: number;
  inherentLevel: RiskLevel;
  existingControls: string;
  residualScore: number;
  residualLevel: RiskLevel;
  riskOwner: string;
  reviewDate: string;
  kri: string; // Key Risk Indicator
}
