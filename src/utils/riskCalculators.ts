import { SeverityImpact, ProbabilityFreq, RiskLevel } from '../types/clinical';

/**
 * Matriks Grading Risiko Klinis 5x5 Standar Kemenkes RI / KNKP
 * Baris: Probabilitas / Frekuensi (1 s/d 5)
 * Kolom: Tingkat Dampak / Keparahan (1 s/d 5)
 */
export const KNKP_RISK_MATRIX: Record<ProbabilityFreq, Record<SeverityImpact, { level: RiskLevel; score: number }>> = {
  5: { // Sangat Sering
    1: { level: 'SEDANG', score: 5 },
    2: { level: 'SEDANG', score: 10 },
    3: { level: 'TINGGI', score: 15 },
    4: { level: 'EKSTREM', score: 20 },
    5: { level: 'EKSTREM', score: 25 },
  },
  4: { // Sering
    1: { level: 'SEDANG', score: 4 },
    2: { level: 'SEDANG', score: 8 },
    3: { level: 'TINGGI', score: 12 },
    4: { level: 'EKSTREM', score: 16 },
    5: { level: 'EKSTREM', score: 20 },
  },
  3: { // Mungkin
    1: { level: 'RENDAH', score: 3 },
    2: { level: 'SEDANG', score: 6 },
    3: { level: 'TINGGI', score: 9 },
    4: { level: 'EKSTREM', score: 12 },
    5: { level: 'EKSTREM', score: 15 },
  },
  2: { // Jarang
    1: { level: 'RENDAH', score: 2 },
    2: { level: 'RENDAH', score: 4 },
    3: { level: 'SEDANG', score: 6 },
    4: { level: 'TINGGI', score: 8 },
    5: { level: 'EKSTREM', score: 10 },
  },
  1: { // Sangat Jarang
    1: { level: 'RENDAH', score: 1 },
    2: { level: 'RENDAH', score: 2 },
    3: { level: 'SEDANG', score: 3 },
    4: { level: 'TINGGI', score: 4 },
    5: { level: 'EKSTREM', score: 5 },
  },
};

export function calculateRisk(impact: SeverityImpact, freq: ProbabilityFreq): { level: RiskLevel; score: number; deadlineDays: number; recommendation: string } {
  const result = KNKP_RISK_MATRIX[freq][impact];
  
  let deadlineDays = 14;
  let recommendation = '';

  switch (result.level) {
    case 'EKSTREM':
      deadlineDays = 45;
      recommendation = 'Investigasi Komprehensif / Root Cause Analysis (RCA) maksimal 45 hari. Wajib eskalasi segera ke Direksi RS dan Komite Mutu & Keselamatan Pasien.';
      break;
    case 'TINGGI':
      deadlineDays = 45;
      recommendation = 'Investigasi Komprehensif / Root Cause Analysis (RCA) maksimal 45 hari oleh Tim Keselamatan Pasien Rumah Sakit didampingi Ka. Instalasi.';
      break;
    case 'SEDANG':
      deadlineDays = 14;
      recommendation = 'Investigasi Sederhana oleh Kepala Ruangan / Unit terkait maksimal 2 minggu (14 hari kerja) dengan verifikasi Tim KMKP.';
      break;
    case 'RENDAH':
      deadlineDays = 7;
      recommendation = 'Investigasi Sederhana oleh Kepala Ruangan / Penanggung Jawab Shift maksimal 1 minggu (7 hari kerja).';
      break;
  }

  return {
    level: result.level,
    score: result.score,
    deadlineDays,
    recommendation,
  };
}

export interface RiskBadgeStyle {
  label: string;
  bg: string;
  border: string;
  text: string;
  dotColor: string;
  actionText: string;
}

export function getRiskBadgeStyle(level: RiskLevel): RiskBadgeStyle {
  switch (level) {
    case 'EKSTREM':
      return {
        label: '[15-25] EKSTREM',
        bg: '#fff1f2',
        border: '#fecdd3',
        text: '#9f1239',
        dotColor: '#e11d48',
        actionText: 'RCA 45 Hari + Lapor Direksi',
      };
    case 'TINGGI':
      return {
        label: '[10-14] TINGGI',
        bg: '#fff7ed',
        border: '#ffedd5',
        text: '#9a3412',
        dotColor: '#f97316',
        actionText: 'RCA 45 Hari Tim KMKP',
      };
    case 'SEDANG':
      return {
        label: '[4-9] SEDANG',
        bg: '#fefce8',
        border: '#fef08a',
        text: '#854d0e',
        dotColor: '#eab308',
        actionText: 'Investigasi Sederhana 14 Hari',
      };
    case 'RENDAH':
      return {
        label: '[1-3] RENDAH',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        text: '#065f46',
        dotColor: '#059669',
        actionText: 'Investigasi Sederhana 7 Hari',
      };
  }
}

export function getIncidentTypeDetails(type: string): { label: string; desc: string; color: string; badgeBg: string } {
  switch (type) {
    case 'SENTINEL':
      return {
        label: 'Kejadian Sentinel',
        desc: 'Insiden kematian tidak terduga atau kehilangan fungsi fisik/psikologis permanen bukan terkait penyakit.',
        color: '#e11d48',
        badgeBg: '#ffe4e6',
      };
    case 'KTD':
      return {
        label: 'KTD (Adverse Event)',
        desc: 'Kejadian Tidak Diharapkan yang mengakibatkan cedera pada pasien.',
        color: '#ea580c',
        badgeBg: '#ffedd5',
      };
    case 'KNC':
      return {
        label: 'KNC (Near Miss)',
        desc: 'Kejadian Nyaris Celaka yang berpotensi mencederai tapi terdeteksi sebelum mengenai pasien.',
        color: '#ca8a04',
        badgeBg: '#fef08a',
      };
    case 'KTC':
      return {
        label: 'KTC (No Harm)',
        desc: 'Kejadian Tidak Cedera yang sudah terpapar ke pasien namun tidak menimbulkan cedera klinis.',
        color: '#0284c7',
        badgeBg: '#e0f2fe',
      };
    case 'KPC':
      return {
        label: 'KPC (Reportable)',
        desc: 'Kondisi Potensial Cedera yang sangat berpotensi menimbulkan cedera jika tidak segera dimitigasi.',
        color: '#475569',
        badgeBg: '#f1f5f9',
      };
    default:
      return {
        label: type,
        desc: 'Insiden Klinis',
        color: '#64748b',
        badgeBg: '#f8fafc',
      };
  }
}

export const IMPACT_DESCRIPTIONS: Record<SeverityImpact, { name: string; clinicalDesc: string }> = {
  1: {
    name: '1 - Tidak Signifikan',
    clinicalDesc: 'Tidak ada cedera, tidak ada kerugian klinis/finansial.',
  },
  2: {
    name: '2 - Minor',
    clinicalDesc: 'Cedera ringan (luka lecet), dapat diatasi dengan pertolongan pertama, tidak memperpanjang hari rawat.',
  },
  3: {
    name: '3 - Moderat',
    clinicalDesc: 'Cedera sedang, berkurangnya fungsi motorik/sensorik sementara, memperpanjang masa rawat inap 1-4 hari.',
  },
  4: {
    name: '4 - Mayor',
    clinicalDesc: 'Cedera berat (kehilangan fungsi motorik/sensorik organ permanen), memperpanjang hari rawat > 4 hari.',
  },
  5: {
    name: '5 - Katastropik',
    clinicalDesc: 'Kematian yang tidak berhubungan dengan perjalanan alamiah penyakit, atau kecacatan fatal menetap.',
  },
};

export const FREQUENCY_DESCRIPTIONS: Record<ProbabilityFreq, { name: string; clinicalDesc: string }> = {
  1: {
    name: '1 - Sangat Jarang',
    clinicalDesc: 'Hampir tidak pernah terjadi (> 5 tahun sekali).',
  },
  2: {
    name: '2 - Jarang',
    clinicalDesc: 'Jarang terjadi (frekuensi 2 - 5 tahun sekali).',
  },
  3: {
    name: '3 - Mungkin',
    clinicalDesc: 'Mungkin dapat terjadi (frekuensi 1 - 2 tahun sekali).',
  },
  4: {
    name: '4 - Sering',
    clinicalDesc: 'Sering terjadi (frekuensi beberapa bulan sekali).',
  },
  5: {
    name: '5 - Sangat Sering',
    clinicalDesc: 'Sangat sering terjadi (frekuensi mingguan atau bulanan).',
  },
};
