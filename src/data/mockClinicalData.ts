import { ClinicalIncident, HospitalRiskRegisterItem } from '../types/clinical';

export const INITIAL_INCIDENTS: ClinicalIncident[] = [
  {
    id: 'IKP-2026-1042',
    patientHash: 'RM-8842-PX',
    patientAge: 62,
    patientGender: 'L',
    patientPayer: 'BPJS Kesehatan',
    room: 'Bed ICU-04',
    incidentDate: '2026-10-28 03:45',
    reportDate: '2026-10-28 06:10',
    department: 'ICU / Intensive Care',
    incidentType: 'SENTINEL',
    title: 'Pemberian Obat High-Alert Terbalik (Epinephrine vs Ephedrine) Akibat Kemasan LASA Mirip',
    chronology: 'Pasien post-laparatomi mengalami hipotensi mendadak di ICU. Dokter menginstruksikan bolus Ephedrine 5mg. Perawat pelaksana mengambil ampul dari lemari emergensi emergency kit ICU. Karena kemasan ampul memiliki warna strip dan ukuran fon mirip (LASA - Look Alike Sound Alike), terambil Epinephrine ampul 1:1000 tanpa prosedur double-check independen. Pasien mengalami takikardia ventrikel sesaat setelah injeksi, dilakukan tatalaksana resusitasi dan aritmia teratasi.',
    initialAction: 'Segera menghentikan injeksi, memanggil tim dokter konsulen ICU, pemberian antiaritmia dan monitoring EKG kontinu 24 jam.',
    impactScore: 4,
    freqScore: 4,
    riskScore: 16,
    riskLevel: 'EKSTREM',
    skpCategory: 'SKP.3',
    reporterName: 'Ns. Hendra Wijaya, S.Kep',
    reporterRole: 'Perawat Penanggung Jawab Shift',
    riskOfficer: 'dr. Satrio Wibowo, Sp.An-TI, KIC',
    status: 'RCA_BERJALAN',
    deadlineDays: 45,
    requiresBoardNotification: true,
    why5: [
      'Pasien menerima obat Epinephrine alih-alih Ephedrine.',
      'Perawat mengambil ampul yang salah dari kotak obat emergensi saat kondisi darurat malam hari.',
      'Penyimpanan obat High-Alert dan LASA di kotak emergensi belum memiliki pemisah fisik dan stiker fosfor kontras.',
      'Prosedur "Independent Double-Check" diabaikan karena rasio perawat:pasien malam hari tidak berimbang (1:3 padahal standar ICU 1:1).',
      'Sistem logistik farmasi belum mengimplementasikan barcode scanning verifikasi obat di bedside kamar rawat intensif.'
    ],
    fishboneData: {
      man: [
        'Kelelahan staf shift malam (jam ke-7 jaga)',
        'Perawat pelaksana belum mengikuti re-training keselamatan obat High-Alert tahun 2026',
        'Kurangnya komunikasi verbal closed-loop saat situasi kritis'
      ],
      method: [
        'SOP Independent Double Check tidak dijalankan saat situasi darurat',
        'Belum ada checklist serah terima obat emergensi shift malam'
      ],
      machine: [
        'Belum tersedianya barcode scanner nirkabel di troli emergensi ICU',
        'Penerangan di sudut lemari obat emergensi redup'
      ],
      material: [
        'Kemasan ampul Epinephrine dan Ephedrine dari distributor pabrik sama memiliki kemiripan 90%',
        'Stiker label "HIGH ALERT / LASA" terkelupas pada ampul'
      ],
      environment: [
        'Kondisi bising alarm monitor pasien lain memecah konsentrasi',
        'Tata letak lemari obat sempit berdekatan dengan wastafel'
      ]
    },
    capaList: [
      {
        id: 'CAPA-1042-A',
        action: 'Pemisahan fisik total dan pemasangan stiker neon fosfor merah untuk seluruh ampul Epinephrine & Ephedrine di semua troli emergensi RS.',
        pic: 'Apt. Rina Marlina, S.Farm (Ka. Farmasi)',
        deadline: '2026-11-05',
        status: 'PROSES',
      },
      {
        id: 'CAPA-1042-B',
        action: 'Audit kepatuhan pelaksanaan Independent Double-Check di ICU dan perbaikan rotasi shift jaga.',
        pic: 'Ns. Sri Wahyuni, M.Kep (Komite Keperawatan)',
        deadline: '2026-11-12',
        status: 'TERENCANA',
      },
      {
        id: 'CAPA-1042-C',
        action: 'Penerapan integrasi barcode verification e-Prescribing di seluruh unit intensif.',
        pic: 'Ir. Bagus Prakoso (IT & SIMRS)',
        deadline: '2026-12-01',
        status: 'TERENCANA',
      }
    ]
  },
  {
    id: 'IKP-2026-1039',
    patientHash: 'RM-1904-ZK',
    patientAge: 45,
    patientGender: 'P',
    patientPayer: 'BPJS Kesehatan',
    room: 'OK Bedah Sentral No. 3',
    incidentDate: '2026-10-26 10:15',
    reportDate: '2026-10-26 12:00',
    department: 'Kamar Operasi (OK / Bedah Sentral)',
    incidentType: 'KNC',
    title: 'Koreksi Penandaan Lokasi Operasi Lutut Kiri vs Kanan Saat Surgical Safety Time-Out',
    chronology: 'Pasien dijadwalkan untuk prosedur artroskopi lutut kiri (dekstra pada rekam medis awal terjadi tipo). Saat pasien sudah di meja operasi dan menjelang induksi anestesi, Tim Bedah melakukan prosedur Surgical Time-Out sesuai WHO Surgical Safety Checklist. Dokter Bedah memverifikasi kesadaran pasien dan memeriksa kembali dokumen informed consent serta hasil MRI. Ditemukan bahwa penandaan lokasi sayatan tertulis di lutut kanan karena kesalahan pengetikan di surat pengantar poliklinik.',
    initialAction: 'Tindakan insisi ditahan, tim mengkonfirmasi ulang dengan pasien sadar dan keluarga, mencocokkan hasil radiologi MRI, menghapus penandaan keliru dan menandai lutut kiri yang benar disaksikan seluruh tim OK.',
    impactScore: 2,
    freqScore: 3,
    riskScore: 6,
    riskLevel: 'SEDANG',
    skpCategory: 'SKP.4',
    reporterName: 'dr. Farhan Malik, Sp.OT',
    reporterRole: 'Dokter Spesialis Bedah Ortopedi',
    riskOfficer: 'dr. Linda Kartika, Sp.An',
    status: 'CAPA_DISETUJUI',
    deadlineDays: 14,
    requiresBoardNotification: false,
    capaList: [
      {
        id: 'CAPA-1039-A',
        action: 'Penguncian validasi penandaan lateralitas (kiri/kanan) pada aplikasi EMR poli bedah agar tidak dapat diisi manual teks bebas melainkan wajib memilih radio visual anatomi.',
        pic: 'dr. Irfan Maulana (SIMRS)',
        deadline: '2026-11-10',
        status: 'SELESAI',
        evidence: 'Fitur radio anatomi aktif di EMR v4.2 per 28 Okt 2026.'
      }
    ]
  },
  {
    id: 'IKP-2026-1035',
    patientHash: 'RM-3318-LM',
    patientAge: 74,
    patientGender: 'P',
    patientPayer: 'Umum / Mandiri',
    room: 'Ruang Melati Bed 204',
    incidentDate: '2026-10-24 22:30',
    reportDate: '2026-10-25 07:15',
    department: 'Rawat Inap Penyakit Dalam',
    incidentType: 'KTD',
    title: 'Pasien Geriatri Jatuh dari Tempat Tidur Saat Hendak ke Kamar Mandi Tanpa Pendamping',
    chronology: 'Pasien geriatri usia 74 tahun dengan riwayat vertigo dan riwayat stroke lama dirawat dengan diagnosis pneumonia. Pasien terbangun di malam hari ingin buang air kecil. Bel panggil (nurse call) tidak dapat dijangkau pasien karena terjatuh ke lantai. Pasien mencoba turun sendiri melewati side rail yang terpasang hanya 1 sisi. Pasien terpeleset dan jatuh di lantai samping tempat tidur. Terjadi hematoma di dahi kanan dan nyeri panggul.',
    initialAction: 'Pemeriksaan tanda vital, pertolongan pertama kompres dingin, foto Rontgen pelvis & CT scan kepala (hasil fraktur negatif), pemasangan gelang risiko jatuh warna kuning dan edukasi keluarga.',
    impactScore: 3,
    freqScore: 4,
    riskScore: 12,
    riskLevel: 'TINGGI',
    skpCategory: 'SKP.6',
    reporterName: 'Ns. Dewi Anggraini, S.Kep',
    reporterRole: 'Kepala Ruangan Melati',
    riskOfficer: 'Ns. Budi Santoso, S.Kep, M.Kes',
    status: 'RCA_BERJALAN',
    deadlineDays: 45,
    requiresBoardNotification: false,
    capaList: [
      {
        id: 'CAPA-1035-A',
        action: 'Pemasangan gantungan holder khusus untuk bel nurse call di tiang infus agar tidak bisa jatuh ke bawah ranjang.',
        pic: 'Unit Pemeliharaan Sarana RS (IPSRS)',
        deadline: '2026-11-04',
        status: 'PROSES'
      },
      {
        id: 'CAPA-1035-B',
        action: 'Penilaian ulang skala risiko jatuh Morse / Ontario setiap pergantian shift untuk seluruh pasien geriatri.',
        pic: 'Ns. Dewi Anggraini (Ka. Ruang)',
        deadline: '2026-10-31',
        status: 'SELESAI'
      }
    ]
  },
  {
    id: 'IKP-2026-1028',
    patientHash: 'RM-7214-AB',
    patientAge: 38,
    patientGender: 'L',
    patientPayer: 'BPJS Kesehatan',
    room: 'Ruang Bedah Flamboyan',
    incidentDate: '2026-10-21 14:20',
    reportDate: '2026-10-21 15:00',
    department: 'Rawat Inap Bedah',
    incidentType: 'KNC',
    title: 'Kantong Darah PRC Terdeteksi Beda Golongan Saat Verifikasi 2 Petugas Sebelum Transfusi',
    chronology: 'Pasien pasca reseksi usus membutuhkan transfusi 2 unit PRC. Petugas pengambil darah membawa 2 kantong darah dari Bank Darah RS. Saat perawat ruangan melakukan prosedur "Bedside Two-Nurse Verification" bersama rekan sejawat, ditemukan kantong darah kedua bergolongan B Rhesus (+), sedangkan rekam medis dan gelang identitas pasien bergolongan O Rhesus (+). Kantong tertukar saat serah terima di loket bank darah karena ada 2 pasien dengan nama depan serupa.',
    initialAction: 'Darah belum ditusuk/diberikan ke pasien. Segera ditolak dan dikembalikan ke Bank Darah RS, membuat Berita Acara Ketidaksesuaian Kantong Darah, meminta darah yang sesuai identitas.',
    impactScore: 4,
    freqScore: 2,
    riskScore: 8,
    riskLevel: 'TINGGI',
    skpCategory: 'SKP.1',
    reporterName: 'Ns. Ahmad Fauzi, S.Kep',
    reporterRole: 'Perawat Primer Bedah',
    riskOfficer: 'dr. Maya Novita, Sp.PK',
    status: 'SELESAI',
    deadlineDays: 14,
    requiresBoardNotification: false,
    capaList: [
      {
        id: 'CAPA-1028-A',
        action: 'Implementasi scan barcode 2 arah pada loket Bank Darah RS saat penyerahan darah ke perawat unit rawat inap.',
        pic: 'Unit Bank Darah & SIMRS',
        deadline: '2026-11-15',
        status: 'PROSES'
      }
    ]
  },
  {
    id: 'IKP-2026-1014',
    patientHash: 'RM-5501-TT',
    patientAge: 55,
    patientGender: 'L',
    patientPayer: 'Asuransi Swasta',
    room: 'Ruang Resusitasi IGD',
    incidentDate: '2026-10-18 19:10',
    reportDate: '2026-10-18 20:30',
    department: 'IGD (Instalasi Gawat Darurat)',
    incidentType: 'KTC',
    title: 'Keterlambatan Pelaporan Nilai Kritis (Critical Value) Troponin I Akibat Gangguan Jaringan LIS',
    chronology: 'Pasien datang dengan keluhan nyeri dada khas sindrom koroner akut. Pemeriksaan cTnI (Troponin I kuantitatif) cito dikirim jam 19.15. Hasil lab selesai jam 19.45 dengan nilai sangat tinggi (kritis). Namun sistem integrasi Laboratory Information System (LIS) ke rekam medis IGD terputus, dan analis laboratorium tidak melakukan pelaporan telepon verbal via prosedur SBAR/Readback ke dokter jaga IGD. Hasil baru diketahui jam 20.30 saat dokter menanyakan secara manual.',
    initialAction: 'Dokter jaga segera memulai protokol STEMI dan menghubungi konsulen kardiologi untuk tindakan Primary PCI darurat. Pasien stabil.',
    impactScore: 3,
    freqScore: 2,
    riskScore: 6,
    riskLevel: 'SEDANG',
    skpCategory: 'SKP.2',
    reporterName: 'dr. Kevin Pratama',
    reporterRole: 'Dokter Jaga IGD',
    riskOfficer: 'dr. Haryono, Sp.JP(K)',
    status: 'SELESAI',
    deadlineDays: 14,
    requiresBoardNotification: false,
    capaList: [
      {
        id: 'CAPA-1014-A',
        action: 'Penegakan SOP pelaporan verbal nilai kritis wajib telepon dalam < 15 menit dilengkapi formulir Readback di buku register laboratorium.',
        pic: 'Penanggung Jawab Mutu Lab',
        deadline: '2026-10-25',
        status: 'SELESAI'
      }
    ]
  },
  {
    id: 'IKP-2026-1008',
    patientHash: 'RM-4120-QW',
    patientAge: 29,
    patientGender: 'P',
    patientPayer: 'BPJS Kesehatan',
    room: 'Ruang Bersalin / VK',
    incidentDate: '2026-10-15 08:30',
    reportDate: '2026-10-15 09:15',
    department: 'Rawat Inap Pediatri & Perinatologi',
    incidentType: 'KPC',
    title: 'Kabel Daya Infusion Pump Terkelupas Ditemukan Sebelum Digunakan pada Pasien',
    chronology: 'Saat perawat mempersiapkan alat infus pump untuk pemberian titrasi oksitosin pada pasien induksi persalinan, terdeteksi insulasi kabel daya alat terkelupas dan kawat tembaga terlihat. Alat belum dicolokkan ke sumber listrik dinding dan belum dihubungkan ke kanula pasien.',
    initialAction: 'Alat langsung diberi label merah "RUSAK / TIDAK BOLEH DIGUNAKAN" dan diganti dengan unit cadangan yang telah terkalibrasi.',
    impactScore: 1,
    freqScore: 3,
    riskScore: 3,
    riskLevel: 'RENDAH',
    skpCategory: 'LAINNYA',
    reporterName: 'Bdn. Siti Nurhaliza, S.Tr.Keb',
    reporterRole: 'Bidan Pelaksana',
    riskOfficer: 'Unit Elektromedis IPSRS',
    status: 'SELESAI',
    deadlineDays: 7,
    requiresBoardNotification: false,
    capaList: [
      {
        id: 'CAPA-1008-A',
        action: 'Pemeriksaan rutin kabel dan grounding seluruh elektromedis di ruang bersalin dan perinatologi.',
        pic: 'Teknisi Elektromedis (IPSRS)',
        deadline: '2026-10-20',
        status: 'SELESAI'
      }
    ]
  }
];

export const HOSPITAL_RISK_REGISTER: HospitalRiskRegisterItem[] = [
  {
    id: 'RISK-CLIN-01',
    riskTitle: 'Risiko Pemberian Obat High Alert & Narkotika Salah Dosis atau Salah Pasien',
    unit: 'Instalasi Farmasi',
    hazardDescription: 'Tingginya beban peracikan obat parenteral dan kemiripan nama/kemasan obat konsentrat pekat (KCl 7.46%, NaCl 3%).',
    inherentImpact: 5,
    inherentFreq: 3,
    inherentScore: 15,
    inherentLevel: 'EKSTREM',
    existingControls: 'Stiker High Alert merah menyala, kunci ganda lemari narkotika, verifikasi 7 benar sebelum injeksi.',
    residualScore: 6,
    residualLevel: 'SEDANG',
    riskOwner: 'Apt. Rina Marlina, S.Farm',
    reviewDate: '2026-11-30',
    kri: 'Tingkat Kepatuhan Double Check Farmasi (Target >= 98%)'
  },
  {
    id: 'RISK-CLIN-02',
    riskTitle: 'Risiko Infeksi Luka Operasi (Surgical Site Infection / SSI / IDO)',
    unit: 'Kamar Operasi (OK / Bedah Sentral)',
    hazardDescription: 'Kontaminasi instrumen steril, kepatuhan cuci tangan bedah, atau ventilasi tekanan positif ruang operasi bermasalah.',
    inherentImpact: 4,
    inherentFreq: 3,
    inherentScore: 12,
    inherentLevel: 'TINGGI',
    existingControls: 'Pemberian antibiotik profilaksis 60 menit pra-insisi, pemantauan filter HEPA kamar operasi berkala, surveilans PPI.',
    residualScore: 4,
    residualLevel: 'SEDANG',
    riskOwner: 'dr. Farhan Malik, Sp.OT',
    reviewDate: '2026-12-15',
    kri: 'Insidensi IDO per 100 Prosedur Bedah Bersih (Target < 1.5%)'
  },
  {
    id: 'RISK-CLIN-03',
    riskTitle: 'Risiko Kesalahan Identifikasi Pasien Tidak Sadar / Bayi Baru Lahir',
    unit: 'IGD (Instalasi Gawat Darurat)',
    hazardDescription: 'Pasien darurat tanpa identitas atau bayi kembar di ruang perinatologi berisiko tertukar gelang nama.',
    inherentImpact: 4,
    inherentFreq: 2,
    inherentScore: 8,
    inherentLevel: 'TINGGI',
    existingControls: 'Gelang identitas berkode barcode, 2 pengenal unik (Nama Lengkap & Tanggal Lahir/No RM), cap sidik telapak kaki bayi.',
    residualScore: 3,
    residualLevel: 'RENDAH',
    riskOwner: 'dr. Kevin Pratama',
    reviewDate: '2026-11-20',
    kri: 'Kepatuhan Verifikasi Identitas Sebelum Tindakan (Target 100%)'
  },
  {
    id: 'RISK-CLIN-04',
    riskTitle: 'Risiko Keterlambatan Resusitasi Akibat Kerusakan Defibrillator / Suction',
    unit: 'ICU / Intensive Care',
    hazardDescription: 'Baterai defibrillator aus atau filter suction tersumbat saat terjadi henti jantung mendadak (Code Blue).',
    inherentImpact: 5,
    inherentFreq: 2,
    inherentScore: 10,
    inherentLevel: 'EKSTREM',
    existingControls: 'Checklist harian uji fungsi defibrillator shift pagi-malam, kalibrasi berkala BPFK.',
    residualScore: 4,
    residualLevel: 'SEDANG',
    riskOwner: 'dr. Satrio Wibowo, Sp.An-TI',
    reviewDate: '2026-11-15',
    kri: 'Kelayakan Alat Resusitasi di Unit Gawat (Target 100% Siap Pakai)'
  }
];

export const SKP_STANDARDS = [
  {
    code: 'SKP.1',
    title: 'Mengidentifikasi Pasien dengan Benar',
    shortDesc: 'Memastikan ketepatan identifikasi pasien menggunakan minimal 2 identitas sebelum memberikan obat, darah, atau prosedur.',
    kemenkesRef: 'PMK No. 11/2017 & STARKES SKP 1',
    color: '#0284c7'
  },
  {
    code: 'SKP.2',
    title: 'Meningkatkan Komunikasi yang Efektif',
    shortDesc: 'Penerapan teknik SBAR dan Readback (TULBAKON: Tulis, Baca Kembali, Konfirmasi) pada instruksi verbal & pelaporan nilai kritis.',
    kemenkesRef: 'STARKES SKP 2',
    color: '#0d9488'
  },
  {
    code: 'SKP.3',
    title: 'Meningkatkan Keamanan Obat-Obatan yang Harus Diwaspadai (High-Alert)',
    shortDesc: 'Pengelolaan elektrolit konsentrat pekat, obat sitostatika, dan obat LASA (Look Alike Sound Alike) dengan pelabelan khusus.',
    kemenkesRef: 'STARKES SKP 3',
    color: '#e11d48'
  },
  {
    code: 'SKP.4',
    title: 'Memastikan Lokasi Pembedahan yang Benar, Prosedur yang Benar, dan Pasien yang Benar',
    shortDesc: 'Penerapan Sign-In, Time-Out, dan Sign-Out menggunakan WHO Surgical Safety Checklist di ruang tindakan invasif.',
    kemenkesRef: 'STARKES SKP 4',
    color: '#f97316'
  },
  {
    code: 'SKP.5',
    title: 'Mengurangi Risiko Infeksi Terkait Pelayanan Kesehatan (HAIs)',
    shortDesc: 'Kepatuhan 5 Momen Cuci Tangan WHO dan prosedur sterilisasi instrumen medis kamar bedah.',
    kemenkesRef: 'STARKES SKP 5',
    color: '#16a34a'
  },
  {
    code: 'SKP.6',
    title: 'Mengurangi Risiko Pasien Cedera Karena Jatuh',
    shortDesc: 'Asesmen awal dan berkala risiko jatuh dengan Skala Morse / Humpty Dumpty serta pemasangan gelang kuning & tanda visual.',
    kemenkesRef: 'STARKES SKP 6',
    color: '#eab308'
  }
];
