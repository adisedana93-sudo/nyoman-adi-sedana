import { HospitalUnit, StarkesRiskCategory, UnitRiskItem, ComprehensiveRiskItem, FmeaItem } from '../types/clinical';

export const ALL_HOSPITAL_UNITS: { key: HospitalUnit; label: string; shortCode: string }[] = [
  { key: 'pendaftaran', label: 'Pendaftaran & Admisi Pasien', shortCode: 'PENDAFTARAN' },
  { key: 'kasir', label: 'Kasir & Billing Kas', shortCode: 'KASIR' },
  { key: 'farmasi', label: 'Instalasi Farmasi', shortCode: 'FARMASI' },
  { key: 'IGD', label: 'Instalasi Gawat Darurat (IGD)', shortCode: 'IGD' },
  { key: 'radiologi', label: 'Instalasi Radiologi & Imejing', shortCode: 'RADIOLOGI' },
  { key: 'laboratorium', label: 'Instalasi Laboratorium PK & PA', shortCode: 'LAB' },
  { key: 'ruang operasi', label: 'Kamar Operasi (IBS / Bedah Sentral)', shortCode: 'IBS' },
  { key: 'VK', label: 'Kamar Bersalin (VK / Ruang Bersalin)', shortCode: 'VK' },
  { key: 'PICU NICU', label: 'PICU & NICU (Perawatan Intensif Anak & Bayi)', shortCode: 'PICU_NICU' },
  { key: 'ICU', label: 'Intensive Care Unit (ICU / ICCU)', shortCode: 'ICU' },
  { key: 'Teknisi', label: 'Teknisi / IPSRS & K3RS', shortCode: 'IPSRS' },
  { key: 'CS', label: 'Cleaning Service & Sanitasi Harian (CS)', shortCode: 'CS' },
  { key: 'CSSD', label: 'Instalasi Sterilisasi Sentral (CSSD)', shortCode: 'CSSD' },
  { key: 'laundry', label: 'Instalasi Laundry & Pengelolaan Linen', shortCode: 'LAUNDRY' },
  { key: 'GIZI', label: 'Instalasi Gizi & Tata Boga', shortCode: 'GIZI' },
  { key: 'Ruang Jenazah', label: 'Pemulasaraan Kamar Jenazah', shortCode: 'JENAZAH' },
  { key: 'Keuangan', label: 'Bagian Keuangan, Akuntansi & Casemix', shortCode: 'KEUANGAN' },
  { key: 'SDM', label: 'SDM / HRD & Kepegawaian', shortCode: 'SDM' },
  { key: 'marketing', label: 'Marketing, Humas & Pengaduan', shortCode: 'MARKETING' },
  { key: 'Diklat', label: 'Pendidikan & Pelatihan (Diklat)', shortCode: 'DIKLAT' },
  { key: 'kesling', label: 'Kesehatan Lingkungan & Limbah B3', shortCode: 'KESLING' },
  { key: 'rawat Inap', label: 'Instalasi Rawat Inap (Dewasa, Anak, Bedah)', shortCode: 'RANAP' },
];

// 11 Kategori Standar PPI Lengkap
export const PPI_CATEGORIES_CONFIG: {
  key: StarkesRiskCategory;
  label: string;
  code: string;
  description: string;
}[] = [
  { key: 'PPI_SURVEILANCE', code: 'PPI 01', label: 'PPI SURVEILANCE IDO,ISK,PLEBITIS', description: 'Surveilans Infeksi Daerah Operasi (IDO), Infeksi Saluran Kemih (ISK), Plebitis, dan VAP/HAP.' },
  { key: 'PPI_UNIT_RISIKO', code: 'PPI 02', label: 'PPI KEGIATAN UNIT YANG BERISIKO TERJADINYA INFEKSI', description: 'Identifikasi potensi transmisi infeksi nosokomial pada aktivitas rutin unit pelayanan.' },
  { key: 'PPI_ALAT_TINGGI', code: 'PPI 03', label: 'PPI PELAYANAN YANG MENGGUNAKAN PERALATAN BERISIKO TINGGI INFEKSI', description: 'Penggunaan ventilator, kateter urin menetap, CVC line, dialiser, dan endoskopi.' },
  { key: 'PPI_TINDAKAN', code: 'PPI 04', label: 'PPI TINDAKAN BERISIKO TINGGI INFEKSI', description: 'Prosedur invasif pembedahan, intubasi, debridemen, punksi lumbal, dan penusukan jarum.' },
  { key: 'PPI_DISTRIBUSI_LINEN', code: 'PPI 05', label: 'PPI PELAYANAN DISTRIBUSI LINEN BERSIH DAN KOTOR', description: 'Pemisahan alur distribusi linen bersih dan linen infeksius/kotor agar tidak bersilangan.' },
  { key: 'PPI_STERILISASI', code: 'PPI 06', label: 'PPI PELAYANAN STERILISASI ALAT', description: 'Dekontaminasi, pencucian instrumen, pengemasan, sterilisasi autoklaf CSSD dan uji biologi.' },
  { key: 'PPI_KEBERSIHAN_LINGKUNGAN', code: 'PPI 07', label: 'PPI KEBERSIHAN LINGKUNGAN', description: 'Sanitasi permukaan, disinfeksi ruangan isolasi, kebersihan debu, dan ventilasi udara.' },
  { key: 'PPI_LAUNDRY', code: 'PPI 08', label: 'PPI PENGELOLAAN LINEN/LAUNDRY', description: 'Pencucian suhu tinggi, pemilahan linen bernoda darah/cairan tubuh, dan APD petugas laundry.' },
  { key: 'PPI_SAMPAH', code: 'PPI 09', label: 'PPI PENGELOLAAN SAMPAH MEDIS DAN NON MEDIS', description: 'Pemisahan sampah medis kantong kuning, jarum di safety box, dan limbah domestik hitam.' },
  { key: 'PPI_GIZI', code: 'PPI 10', label: 'PPI PENYEDIAAN MAKANAN', description: 'Higiene penjamah makanan gizi, penyimpanan bahan makanan, uji mikrobiologi, dan distribusi aman.' },
  { key: 'PPI_JENAZAH', code: 'PPI 11', label: 'PPI PENGELOLAAN KAMAR JENAZAH', description: 'Penanganan jenazah infeksius, APD pemulasaraan, disinfeksi meja persemayaman dan limbah.' },
];

// 7 Standar MFK (Manajemen Fasilitas & Keselamatan) Lengkap
export const MFK_CATEGORIES_CONFIG: {
  key: StarkesRiskCategory;
  label: string;
  code: string;
  description: string;
}[] = [
  { key: 'MFK_1', code: 'MFK 1', label: 'MFK 1 – MANAJEMEN KESELAMATAN', description: 'Keselamatan gedung, lantai licin, rambu evakuasi, dan inspeksi fisik lingkungan fasilitas.' },
  { key: 'MFK_2', code: 'MFK 2', label: 'MFK 2 – KEAMANAN', description: 'Pencegahan pencurian, kekerasan, penculikan bayi, akses kontrol CCTV, dan kartu identitas pengunjung.' },
  { key: 'MFK_3', code: 'MFK 3', label: 'MFK 3 – B3', description: 'Pengelolaan Bahan Berbahaya dan Beracun (B3), MSDS/LDP, spill kit, dan TPS limbah B3 berizin.' },
  { key: 'MFK_4', code: 'MFK 4', label: 'MFK 4 – UTILITAS', description: 'Kontinjensi pasokan listrik PLN/genset, air bersih medis, oksigen sentral/gas medik, dan tata udara HVAC.' },
  { key: 'MFK_5', code: 'MFK 5', label: 'MFK 5 – KEBAKARAN', description: 'Sistem proteksi kebakaran aktif/pasif, APAR, hidran, smoke detector, sprinkler, dan simulasi evakuasi.' },
  { key: 'MFK_6', code: 'MFK 6', label: 'MFK 6 – ALAT MEDIS', description: 'Kalibrasi berkala alat medis, pemeliharaan preventif IPSRS, penarikan alat (recall), dan inventaris laik pakai.' },
  { key: 'MFK_7', code: 'MFK 7', label: 'MFK 7 – BENCANA', description: 'Kesiapsiagaan Hospital Disaster Plan (HDP), simulasi bencana internal/eksternal, dan jalur triase bencana.' },
];

export const STARKES_CATEGORIES_CONFIG: { 
  key: StarkesRiskCategory; 
  label: string; 
  group: 'KLINIS_TATA_KELOLA' | 'PPI' | 'MFK';
  badgeColor: string;
}[] = [
  // Standar Klinis & Tata Kelola
  { key: 'KLINIS', label: 'Klinis / Keselamatan Pasien (KP)', group: 'KLINIS_TATA_KELOLA', badgeColor: 'bg-primary-fixed text-on-primary-fixed border-[#7bd8b1]' },
  { key: 'FINANSIAL', label: 'Finansial & Casemix', group: 'KLINIS_TATA_KELOLA', badgeColor: 'bg-surface-container text-on-surface border-[#cbd5e1]' },
  { key: 'HUKUM', label: 'Hukum & Reputasi RS', group: 'KLINIS_TATA_KELOLA', badgeColor: 'bg-surface-container text-on-surface border-[#cbd5e1]' },
  { key: 'OPERASIONAL', label: 'Operasional & SIMRS IT', group: 'KLINIS_TATA_KELOLA', badgeColor: 'bg-surface-container text-on-surface border-[#cbd5e1]' },

  // 11 Kategori Standar PPI Lengkap
  ...PPI_CATEGORIES_CONFIG.map(c => ({
    key: c.key,
    label: c.label,
    group: 'PPI' as const,
    badgeColor: 'bg-[#eff4ff] text-[#005683] border-[#d5e3fc]'
  })),

  // 7 Standar MFK Lengkap
  ...MFK_CATEGORIES_CONFIG.map(c => ({
    key: c.key,
    label: c.label,
    group: 'MFK' as const,
    badgeColor: 'bg-[#fff7ed] text-[#9a3412] border-[#ffedd5]'
  }))
];

// Semua isian risk register dihapus (jadikan kosong sesuai instruksi pengguna)
export const INITIAL_UNIT_RISK_DATA: UnitRiskItem[] = [];

// Export mock comprehensive and FMEA items as empty typed arrays
export const COMPREHENSIVE_RISK_ITEMS: ComprehensiveRiskItem[] = [];
export const FMEA_ITEMS: FmeaItem[] = [];
