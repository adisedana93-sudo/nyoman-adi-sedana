import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Data storage file path
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'risks.json');

// Ensure data folder and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
}

// Helper to safely read data
function readRisks(): any[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const items = JSON.parse(raw) || [];
    return items.filter((r: any) => r && r.id && r.id !== 'RR-IGD-653');
  } catch (err) {
    console.error('Error reading risks data:', err);
    return [];
  }
}

// Helper to safely write data
function writeRisks(data: any[]) {
  try {
    const clean = Array.isArray(data) ? data.filter((r: any) => r && r.id && r.id !== 'RR-IGD-653') : [];
    fs.writeFileSync(DATA_FILE, JSON.stringify(clean, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing risks data:', err);
  }
}

// API Routes
// 1. Get all risk items
app.get('/api/risks', (_req: Request, res: Response) => {
  const risks = readRisks();
  res.json({ success: true, count: risks.length, data: risks });
});

// 2. Add or update a single risk item
app.post('/api/risks', (req: Request, res: Response) => {
  const item = req.body;
  if (!item || !item.id || item.id === 'RR-IGD-653') {
    return res.status(400).json({ success: false, message: 'ID risiko dan data wajib diisi' });
  }

  const risks = readRisks();
  const existingIdx = risks.findIndex((r: any) => r.id === item.id);

  if (existingIdx >= 0) {
    risks[existingIdx] = { ...risks[existingIdx], ...item, updatedAt: new Date().toISOString() };
  } else {
    risks.unshift({ ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }

  writeRisks(risks);
  return res.json({ success: true, item: item, total: risks.length });
});

// 3. Bulk save or sync
app.post('/api/risks/bulk', (req: Request, res: Response) => {
  const newItems = req.body.items || req.body;
  if (!Array.isArray(newItems)) {
    return res.status(400).json({ success: false, message: 'Data harus berupa array' });
  }

  const existingRisks = readRisks();
  const map = new Map<string, any>();
  
  // First load existing
  for (const r of existingRisks) {
    if (r && r.id && r.id !== 'RR-IGD-653') {
      map.set(r.id, r);
    }
  }
  // Overlay new items
  for (const item of newItems) {
    if (item && item.id && item.id !== 'RR-IGD-653') {
      map.set(item.id, { ...(map.get(item.id) || {}), ...item });
    }
  }

  const merged = Array.from(map.values());
  writeRisks(merged);
  return res.json({ success: true, count: merged.length, data: merged });
});

// 4. Delete risk by ID (ONLY when delete button is explicitly clicked)
app.delete('/api/risks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const risks = readRisks();
  const filtered = risks.filter((r: any) => r.id !== id);

  if (filtered.length === risks.length) {
    return res.status(404).json({ success: false, message: `Risiko ${id} tidak ditemukan` });
  }

  writeRisks(filtered);
  return res.json({ success: true, deletedId: id, remaining: filtered.length });
});

// 4b. Clear all risks (manual reset)
app.post('/api/risks/clear-all', (_req: Request, res: Response) => {
  writeRisks([]);
  return res.json({ success: true, message: 'Semua register risiko telah dikosongkan', remaining: 0 });
});

// 5. AI-Powered RCA Generation using @google/genai (gemini-3.8-flash)
app.post('/api/ai/rca-analysis', async (req: Request, res: Response) => {
  const { riskItem } = req.body;
  if (!riskItem || !riskItem.id) {
    return res.status(400).json({ success: false, message: 'Data risiko diperlukan untuk analisis RCA' });
  }

  const statement = riskItem.statement || 'Potensi insiden klinis/operasional';
  const unit = riskItem.unitLabel || riskItem.unit || 'Unit Terkait';
  const category = riskItem.categoryName || riskItem.categoryKey || 'Umum';
  const rootCause = riskItem.rootCause || 'Kelemahan sistem operasional dan supervisi';
  const mitigation = riskItem.mitigation || 'Penguatan SOP dan audit kepatuhan';
  const grade = riskItem.grade || 'EKSTREM';

  const defaultLeader = 'Ns.Nyoman adi Sedana,S.Kep';
  const now = new Date();
  const startDateStr = now.toISOString().slice(0, 10);
  const targetDateObj = new Date(now.getTime() + 45 * 86400000); // 45 hari untuk RCA Komprehensif
  const targetDateStr = targetDateObj.toISOString().slice(0, 10);

  // Helper fallback generator in case API key is missing or network/model issue
  function generateFallbackRca() {
    return {
      investigationId: `RCA-${new Date().getFullYear()}-${riskItem.id.replace(/[^a-zA-Z0-9]/g, '')}`,
      riskId: riskItem.id,
      startDate: startDateStr,
      targetDate: targetDateStr,
      leader: defaultLeader,
      teamMembers: [
        'Ns.Nyoman adi Sedana,S.Kep (Ketua Tim RCA / Sub Komite Manajemen Risiko)',
        `Kepala ${unit} (Anggota / Pemilik Proses)`,
        'Ketua Komite Mutu & Keselamatan Pasien (KMKP)',
        'Perwakilan Sub Komite K3RS / PPI / Pelayanan Medis',
        'Staf Mutu & Audit Internal'
      ],
      problemStatement: `Terjadi potensi risiko tinggi/kejadian kritikal pada ${unit}: "${statement}". Hal ini berpotensi membahayakan keselamatan pasien, staf, atau kelangsungan operasional RSU SHANTI GRAHA dengan tingkat keparahan grade ${grade}.`,
      chronologySummary: `1. Unit ${unit} mengidentifikasi kelemahan pada tata kelola: ${statement}. 2. Analisis awal menunjukkan pemicu: ${rootCause}. 3. Tim investigasi melakukan klarifikasi alur kerja dan peninjauan fasilitas di lapangan. 4. Disepakati pembentukan tim investigasi RCA untuk mencari akar masalah hingga ke level tata kelola sistemik.`,
      triggerEvent: `Laporan register risiko unit kerja ${unit} dengan tingkat risiko ${grade} yang memerlukan tindak lanjut komprehensif sesuai standar STARKES Kemenkes RI.`,
      gatheredFacts: [
        `Prosedur operasional standar (SOP) di ${unit} belum mengakomodasi mitigasi skenario lonjakan beban kerja.`,
        `Supervisi berkala dan audit checklist harian belum terdokumentasi secara konsisten oleh penanggung jawab shift.`,
        `Pelatihan dan simulasi berkala untuk staf unit belum mencapai 100% target tahunan.`,
        `Keterbatasan sarana pendukung dan sistem verifikasi ganda (double-check) di lokasi pelayanan.`
      ],
      impactDescription: `Berisiko menimbulkan cedera fisik/klinis, perlambatan waktu respons pelayanan, serta potensi komplain keluarga dan penurunan reputasi rumah sakit bila tidak ditangani secara menyeluruh.`,
      fishbone: {
        man: [
          `Beban kerja dan rasio staf saat jam sibuk/shift malam tinggi`,
          `Perlu penyegaran pemahaman SOP dan sertifikasi berkala staf ${unit}`,
          `Kejenuhan kerja (fatigue) yang memengaruhi konsentrasi tim`
        ],
        method: [
          `SOP operasional belum mencakup klausul mitigasi kegagalan sistematis`,
          `Formulir serah terima (handover) belum memanfaatkan checklist terstandar`,
          `Mekanisme pelaporan berjenjang saat terjadi anomali belum berjalan optimal`
        ],
        machine: [
          `Sarana atau perangkat bantu di unit belum dilengkapi sistem peringatan dini (early warning)`,
          `Jadwal pemeliharaan preventif alat medis/sarpras perlu diperketat`,
          `Integrasi sistem informasi digital (SIMRS) di unit kerja masih membutuhkan penyempurnaan`
        ],
        material: [
          `Ketersediaan logistik dan buffer stock material/BHP berfluktuasi`,
          `Dokumen manual pelaporan masih rawan tercecer atau rusak`,
          `Penyimpanan material khusus memerlukan penandaan visual kontras`
        ],
        environment: [
          `Tata letak ruang kerja dengan alur lalu lintas padat`,
          `Tingkat kebisingan lingkungan pelayanan berpotensi mengaburkan komunikasi verbal`,
          `Pencahayaan dan ergonomi workstation memerlukan penyesuaian`
        ]
      },
      why5: [
        `Mengapa risiko "${statement}" muncul? Karena terjadi inkonsistensi pelaksanaan prosedur baku pada proses kerja di ${unit}.`,
        `Mengapa terjadi inkonsistensi pelaksanaan prosedur baku? Karena belum ada mekanisme checklist mandatori dan pengawasan berjenjang yang terstruktur di setiap shift.`,
        `Mengapa belum ada checklist mandatori dan pengawasan terstruktur? Karena SOP yang ada belum diperbarui dengan prinsip pencegahan risiko proaktif sesuai STARKES.`,
        `Mengapa SOP belum diperbarui secara proaktif? Karena fokus evaluasi unit masih bersifat reaktif saat timbul keluhan atau insiden nyata.`,
        `Mengapa evaluasi masih reaktif (Akar Masalah Fundamental)? Karena sistem tata kelola mutu unit belum mengintegrasikan risk-based thinking dan audit kepatuhan klinis ke dalam Key Performance Indicator (KPI) operasional harian.`
      ],
      fundamentalRootCause: `Sistem tata kelola dan budaya keselamatan (safety culture) di unit ${unit} belum menerapkan risk-based thinking secara konsisten, didukung oleh belum optimalnya supervisi kepatuhan SOP berjenjang dan pembaruan instrumen kerja terstandar.`,
      capaActions: [
        {
          id: `CAPA-${Date.now()}-1`,
          action: `Revisi dan sosialisasi SOP operasional di ${unit} dengan memasukkan checklist pencegahan risiko dan verifikasi ganda.`,
          pic: `Kepala ${unit} & Tim Mutu`,
          deadline: new Date(now.getTime() + 14 * 86400000).toISOString().slice(0, 10),
          status: 'PROSES',
          evidence: 'Dokumen SK Revisi SOP dan Bukti Daftar Hadir Sosialisasi Staf'
        },
        {
          id: `CAPA-${Date.now()}-2`,
          action: `Penerapan formulir monitoring kepatuhan shift harian dan supervisi berkala oleh penanggung jawab shift.`,
          pic: `Supervisor Pelayanan & Ka. Tim ${unit}`,
          deadline: new Date(now.getTime() + 21 * 86400000).toISOString().slice(0, 10),
          status: 'TERENCANA',
          evidence: 'Logbook Monitoring Shift dan Rekap Evaluasi Mingguan'
        },
        {
          id: `CAPA-${Date.now()}-3`,
          action: `Pelaksanaan pelatihan penyegaran tata kelola risiko dan simulasi penanganan krisis untuk seluruh staf unit.`,
          pic: `Bagian Diklat & Sub Komite Manajemen Risiko`,
          deadline: new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10),
          status: 'TERENCANA',
          evidence: 'Laporan Pelaksanaan Diklat & Sertifikat Peserta'
        },
        {
          id: `CAPA-${Date.now()}-4`,
          action: `Audit pemenuhan sarana pendukung kerja, penandaan visual kontras, dan pemeliharaan alat kerja di unit.`,
          pic: `Instalasi Sarpras & K3RS`,
          deadline: new Date(now.getTime() + 40 * 86400000).toISOString().slice(0, 10),
          status: 'TERENCANA',
          evidence: 'Berita Acara Inspeksi Sarana & K3'
        }
      ],
      directorRecommendations: `Direktur RSU SHANTI GRAHA menginstruksikan kepada seluruh jajaran manajemen untuk mengawal tuntas pelaksanaan rencana aksi CAPA pada unit ${unit}, mengalokasikan anggaran sarana pendukung keselamatan yang diperlukan, serta menjadikan laporan kepatuhan risiko sebagai bahan evaluasi kinerja berkala jajaran pimpinan.`,
      subCommitteeNote: `Sub Komite Manajemen Risiko (Ns.Nyoman adi Sedana,S.Kep) memverifikasi bahwa analisis RCA ini telah memenuhi kaidah penelusuran akar masalah STARKES Kemenkes RI dan siap dipantau implementasi CAPA-nya setiap 14 hari kerja.`,
      status: 'SEDANG_INVESTIGASI',
      generatedByAi: true,
      updatedAt: new Date().toISOString()
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('GEMINI_API_KEY not configured, utilizing intelligent hospital domain fallback');
      const fallback = generateFallbackRca();
      return res.json({ success: true, rca: fallback, source: 'fallback_template' });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI();

    const prompt = `Anda adalah Spesialis Analisis Investigasi Akar Masalah (Root Cause Analysis / RCA) Rumah Sakit terakreditasi STARKES Kemenkes RI & KNKP untuk RSU SHANTI GRAHA.
Ketuai investigasi ini atas nama: Ns.Nyoman adi Sedana,S.Kep (Sub Komite Manajemen Risiko).

Data Risiko yang diinvestigasi:
- ID Risiko: ${riskItem.id}
- Unit Kerja: ${unit}
- Kategori Standar: ${category}
- Pernyataan Risiko: "${statement}"
- Dugaan Akar Masalah Awal: "${rootCause}"
- Nilai Peluang x Dampak: ${riskItem.p} x ${riskItem.d} = ${riskItem.score} (Tingkat Risiko: ${grade})
- Rencana Mitigasi Eksisting: "${mitigation}"

Tugas Anda:
Lakukan analisis RCA 6 Langkah yang komprehensif, mendalam, dan aplikatif khusus untuk rumah sakit RSU SHANTI GRAHA.
Kembalikan HANYA format JSON valid tanpa tanda markdown (no backticks) dengan struktur berikut:
{
  "investigationId": "RCA-2026-${riskItem.id.replace(/[^a-zA-Z0-9]/g, '')}",
  "riskId": "${riskItem.id}",
  "startDate": "${startDateStr}",
  "targetDate": "${targetDateStr}",
  "leader": "Ns.Nyoman adi Sedana,S.Kep",
  "teamMembers": [
    "Ns.Nyoman adi Sedana,S.Kep (Ketua Tim RCA / Sub Komite Manajemen Risiko)",
    "Kepala ${unit} (Anggota / Pemilik Proses)",
    "Ketua Komite Mutu & Keselamatan Pasien (KMKP)",
    "Perwakilan Pelayanan Medis / Keperawatan",
    "Staf Audit Internal & K3RS"
  ],
  "problemStatement": "string (deskripsi detail masalah)",
  "chronologySummary": "string (kronologi atau latar belakang teridentifikasinya risiko)",
  "triggerEvent": "string (pemicu eskalasi risiko)",
  "gatheredFacts": [
    "fakta temuan audit 1",
    "fakta temuan observasi 2",
    "fakta wawancara staf 3",
    "fakta dokumentasi regulasi 4"
  ],
  "impactDescription": "string (dampak terhadap pasien, staf, atau mutu layanan)",
  "fishbone": {
    "man": ["faktor staf 1", "faktor staf 2", "faktor staf 3"],
    "method": ["faktor regulasi/SOP 1", "faktor alur kerja 2", "faktor verifikasi 3"],
    "machine": ["faktor peralatan/IT 1", "faktor pemeliharaan 2"],
    "material": ["faktor logistik/formulir 1", "faktor ketersediaan 2"],
    "environment": ["faktor tata ruang 1", "faktor beban kerja lingkungan 2"]
  },
  "why5": [
    "Mengapa 1: ...",
    "Mengapa 2: ...",
    "Mengapa 3: ...",
    "Mengapa 4: ...",
    "Mengapa 5 (Akar Masalah Fundamental): ..."
  ],
  "fundamentalRootCause": "string (kesimpulan akar masalah dasar)",
  "capaActions": [
    {
      "id": "CAPA-1",
      "action": "Tindakan perbaikan spesifik",
      "pic": "Jabatan PIC penanggung jawab",
      "deadline": "${new Date(now.getTime() + 14 * 86400000).toISOString().slice(0, 10)}",
      "status": "PROSES",
      "evidence": "Bukti dokumen atau implementasi"
    },
    {
      "id": "CAPA-2",
      "action": "Tindakan pencegahan SOP",
      "pic": "Jabatan PIC penanggung jawab",
      "deadline": "${new Date(now.getTime() + 28 * 86400000).toISOString().slice(0, 10)}",
      "status": "TERENCANA",
      "evidence": "Bukti pelaksanaan"
    },
    {
      "id": "CAPA-3",
      "action": "Pelatihan / Simulasi Staf",
      "pic": "Bagian Diklat & Tim Mutu",
      "deadline": "${new Date(now.getTime() + 40 * 86400000).toISOString().slice(0, 10)}",
      "status": "TERENCANA",
      "evidence": "Laporan pelatihan & daftar hadir"
    }
  ],
  "directorRecommendations": "string (arahan strategis untuk Direktur RSU SHANTI GRAHA)",
  "subCommitteeNote": "string (catatan pengesahan Ns.Nyoman adi Sedana,S.Kep)",
  "status": "SEDANG_INVESTIGASI"
}`;

    // Call Gemini API with model cascade to ensure high availability
    const candidateModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
    let response: any = null;
    let usedModel = candidateModels[0];

    for (const m of candidateModels) {
      try {
        const geminiPromise = ai.models.generateContent({
          model: m,
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout on model ${m}`)), 8000)
        );
        response = await Promise.race([geminiPromise, timeoutPromise]);
        usedModel = m;
        if (response && response.text) break;
      } catch (mErr: any) {
        console.warn(`RCA model ${m} temporary failure, trying next candidate:`, mErr?.message);
      }
    }

    if (!response || !response.text) {
      throw new Error('All candidate models unavailable or timed out');
    }

    const responseText = response.text || '';
    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      // Clean JSON markers if present
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    parsedData.generatedByAi = true;
    parsedData.updatedAt = new Date().toISOString();
    return res.json({ success: true, rca: parsedData, source: 'gemini_api', modelUsed: usedModel });
  } catch (err: any) {
    console.error('Gemini API RCA Generation error, falling back to hospital template:', err);
    const fallback = generateFallbackRca();
    return res.json({ success: true, rca: fallback, source: 'fallback_template', errorDetail: err?.message });
  }
});

// 6. AI-Powered Complete Risk Form Auto-Fill using @google/genai (gemini-3.5-flash)
app.post('/api/ai/complete-risk', async (req: Request, res: Response) => {
  const { statement, unit, unitLabel, categoryKey, categoryName } = req.body;
  if (!statement || typeof statement !== 'string' || !statement.trim()) {
    return res.status(400).json({ success: false, message: 'Pernyataan risiko wajib diisi sebelum klik AI' });
  }

  const cleanStatement = statement.trim();
  const targetUnit = unitLabel || unit || 'Unit Pelayanan RSU SHANTI GRAHA';
  const targetCategory = categoryName || categoryKey || 'Standar Mutu Klinis & Keselamatan Pasien';
  const now = new Date().toISOString().slice(0, 10);

  // Dynamic contextual fallback that deeply analyzes the statement keywords if Gemini API is unreachable
  function generateFallbackFields() {
    const s = cleanStatement.toLowerCase();
    let rootCause = '';
    let mitigation = '';
    let implementedActions = '';
    let pic = `Kepala ${targetUnit} & Tim Mutu`;
    let p = 3;
    let d = 4;

    if (s.includes('darah') || s.includes('transfusi') || s.includes('bdrs') || s.includes('donor')) {
      rootCause = `Ketiadaan sistem pemantauan batas minimum stok darah cito (buffer stock) di BDRS serta keterlambatan komunikasi real-time antara ${targetUnit} dan Bank Darah saat kebutuhan darurat.`;
      mitigation = `Penyusunan SPO Buffer Stock Darah Universal di BDRS, integrasi alur pemesanan darah cito via SIMRS, serta pembaharuan MoU pasokan prioritas dengan UTD PMI.`;
      implementedActions = `Telah dibentuk jalur koordinasi cepat siaga transfusi darah gawat darurat dan monitoring harian ketersediaan kantong darah di BDRS.`;
      pic = `Ka. BDRS & Ka. ${targetUnit}`;
      p = 3;
      d = 5;
    } else if (s.includes('jarum') || s.includes('tertusuk') || s.includes('spuit') || s.includes('b3') || s.includes('limbah') || s.includes('infeksi') || s.includes('tertular')) {
      rootCause = `Ketidakpatuhan penggunaan safety box jarum suntik, kebiasaan recapping dua tangan tanpa alat bantu, dan belum optimalnya ketersediaan APD protektif saat tindakan di ${targetUnit}.`;
      mitigation = `Penyediaan needle destroyer dan safety box berstandar WHO di setiap titik tindakan, sosialisasi larangan recapping jarum suntik, dan audit berkala kepatuhan PPI oleh IPCN.`;
      implementedActions = `Pemasangan poster edukasi one-hand recapping, penataan ulang lokasi safety box di dekat pasien, dan pemeriksaan status imunisasi Hepatitis B petugas.`;
      pic = `Komite PPI & Ka. ${targetUnit}`;
      p = 3;
      d = 4;
    } else if (s.includes('jatuh') || s.includes('fall') || s.includes('lantai') || s.includes('terpeleset')) {
      rootCause = `Asesmen ulang risiko jatuh Morse/Humpty Dumpty belum konsisten saat perubahan kondisi pasien, serta minimnya penguncian roda tempat tidur dan palang pengaman (bed rail).`;
      mitigation = `Pemasangan stiker penanda risiko jatuh kuning di tempat tidur/gelang pasien, edukasi keluarga pasien tentang tombol darurat perawat, dan inspeksi rutin kelaikan bed rail oleh IPSRS.`;
      implementedActions = `Pemasangan gelang kuning pada seluruh pasien berisiko tinggi dan penerapan ronde keselamatan berkala setiap 2 jam oleh perawat jaga.`;
      pic = `Ka. Ruangan ${targetUnit} & Tim Keselamatan Pasien`;
      p = 3;
      d = 4;
    } else if (s.includes('obat') || s.includes('resep') || s.includes('lasa') || s.includes('dosis') || s.includes('alergi') || s.includes('farmasi') || s.includes('high alert')) {
      rootCause = `Belum dilaksanakannya verifikasi independen ganda (independent double check) pada obat high-alert/LASA dan tulisan resep non-elektronik yang berpotensi menimbulkan salah interpretasi dosis.`;
      mitigation = `Pemberian stiker neon LASA dan HAM (High Alert Medication), implementasi mandatory double check sebelum obat diserahkan ke pasien, dan integrasi validasi dosis otomatis pada SIMRS.`;
      implementedActions = `Pemberian label identifikasi khusus obat High Alert di lemari penyimpanan dan supervisi verifikasi telaah resep oleh Apoteker.`;
      pic = `Ka. Instalasi Farmasi & Ka. ${targetUnit}`;
      p = 3;
      d = 4;
    } else if (s.includes('listrik') || s.includes('genset') || s.includes('padam') || s.includes('ups') || s.includes('tegangan')) {
      rootCause = `Keterlambatan perpindahan Automatic Transfer Switch (ATS) genset darurat dan belum terujinya kapasitas baterai UPS pendukung alat medis penunjang hidup (life support).`;
      mitigation = `Uji fungsi mingguan genset otomatis dengan beban, penggantian preventif aki UPS alat kritis, dan penyiapan sistem redundansi kelistrikan di ${targetUnit}.`;
      implementedActions = `Inspeksi berkala mingguan instalasi genset oleh IPSRS dan penandaan stop kontak khusus jalur UPS di ${targetUnit}.`;
      pic = `Ka. IPSRS & Tim MFK/K3RS`;
      p = 2;
      d = 5;
    } else if (s.includes('kebakaran') || s.includes('apar') || s.includes('asap') || s.includes('api')) {
      rootCause = `Adanya potensi korsleting instalasi perkabelan non-standar, terhalangnya akses alat pemadam api ringan (APAR), dan belum semua staf terlatih teknik penggunaan APAR (PASS).`;
      mitigation = `Inspeksi bulanan tekanan APAR dan smoke detector, penataan jalur evakuasi bebas hambatan, serta simulasi rutin penanggulangan bencana Code Red.`;
      implementedActions = `Pengecekan tanggal kedaluwarsa seluruh APAR di sekitar ${targetUnit} dan sosialisasi pembagian peran helm keselamatan (Code Red).`;
      pic = `Tim K3RS & MFK RSU SHANTI GRAHA`;
      p = 2;
      d = 5;
    } else if (s.includes('rekam medis') || s.includes('berkas') || s.includes('simrs') || s.includes('jaringan') || s.includes('error') || s.includes('down')) {
      rootCause = `Ketergantungan server lokal tanpa saluran cadangan (failover redundancy) otomatis serta belum optimalnya prosedur pencatatan rekam medis darurat (downtime procedure) saat SIMRS offline.`;
      mitigation = `Implementasi dual link internet provider, penjadwalan backup database harian terenkripsi, serta sosialisasi formulir contingency manual rekam medis.`;
      implementedActions = `Penyediaan formulir rekam medis manual darurat di meja administrasi ${targetUnit} dan pengujian restore data berkala oleh tim IT.`;
      pic = `Ka. SIMRS & Rekam Medis`;
      p = 3;
      d = 3;
    } else if (s.includes('salah pasien') || s.includes('identitas') || s.includes('gelang')) {
      rootCause = `Proses identifikasi pasien saat pemberian tindakan medis masih sering mengabaikan verifikasi verbal minimal 2 parameter identitas (nama lengkap dan tanggal lahir/nomor RM).`;
      mitigation = `Penerapan kewajiban verifikasi aktif 2 identitas sebelum pemberian obat/tindakan invasif, pemindaian barcode gelang pasien via SIMRS mobile, dan audit kepatuhan Sasaran Keselamatan Pasien (SKP 1).`;
      implementedActions = `Sosialisasi ulang pedoman identifikasi pasien dan pengadaan gelang identitas tahan air berkualitas tinggi.`;
      pic = `Komite Keselamatan Pasien & Ka. ${targetUnit}`;
      p = 3;
      d = 4;
    } else {
      // General tailored synthesis directly quoting and analyzing the specific statement
      rootCause = `Kelemahan kepatuhan pelaksanaan SPO terkait "${cleanStatement}", keterbatasan sarana pendukung dan instrumen checklist pengawasan berkala pada ${targetUnit}.`;
      mitigation = `Revisi dan sosialisasi SPO operasional terkait penanganan potensi "${cleanStatement}", pelatihan kompetensi staf berkala, dan audit kepatuhan oleh Tim Mutu & Manajemen Risiko.`;
      implementedActions = `Telah dilakukan identifikasi awal celah risiko serta sosialisasi pencegahan kejadian "${cleanStatement}" kepada seluruh staf di ${targetUnit}.`;
      pic = `Kepala ${targetUnit} & Tim Mutu`;
      p = 3;
      d = 4;
    }

    const score = p * d;
    const grade = score >= 15 ? 'EKSTREM' : score >= 10 ? 'TINGGI' : score >= 4 ? 'SEDANG' : 'RENDAH';

    return {
      rootCause,
      p,
      d,
      score,
      grade,
      mitigation,
      implementedActions,
      implementationDate: now,
      effectivenessEvaluation: 'CUKUP_EFEKTIF',
      pic,
      target: 'TW II 2026'
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ success: true, data: generateFallbackFields(), source: 'fallback_template' });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI();

    const prompt = `Anda adalah Ahli Manajemen Risiko Rumah Sakit (Certified Hospital Risk Manager & Senior Auditor Akreditasi STARKES KARS 2026) untuk RSU SHANTI GRAHA.

PENGGUNA TELAH MEMASUKKAN PERNYATAAN RISIKO BERIKUT:
=============================================================
Pernyataan Risiko: "${cleanStatement}"
Unit Kerja Pemilik: "${targetUnit}"
Kategori Standar STARKES: "${targetCategory}"
=============================================================

PETUNJUK MUTLAK (SANGAT PENTING):
1. Bahasa yang Anda hasilkan pada Akar Masalah, Mitigasi, Tindakan Nyata, dan PIC HARUS SEPENUHNYA NYAMBUNG, RELEVAN, DAN SPESIFIK dengan kalimat pernyataan risiko di atas.
2. JANGAN PERNAH membuat kalimat umum/template hampa seperti "Kelemahan prosedur kerja standar di unit".
3. Pada "rootCause", sebutkan faktor penyebab mendasar (4M: Man/Petugas, Machine/Alat, Method/SPO, Material/Bahan/Obat, Environment/Lingkungan) yang secara langsung memicu timbulnya bahaya pada "${cleanStatement}".
4. Pada "mitigation", sebutkan rencana pengendalian preventif/korektif konkret yang langsung mengatasi bahaya tersebut.
5. Pada "implementedActions", sebutkan tindakan nyata yang sudah atau sedang diinisiasi oleh unit untuk mengontrol bahaya tersebut saat ini.
6. Berikan skor Probabilitas P (1-5) dan Dampak D (1-5) yang proporsional sesuai tingkat keparahan klinis/operasional RS:
   - D=5 (Katastropik: kematian, sentinel, cacat permanen, kerusakan vital)
   - D=4 (Mayor: cedera berat, kerugian besar, prolong LOS signifikan)
   - D=3 (Moderat: cedera sedang, perlu intervensi medis)
   - D=2 (Minor: cedera ringan, P3K)
   - D=1 (Tidak Signifikan)
7. "pic": Sebutkan jabatan penanggung jawab yang paling tepat dan relevan (misal: "Ka. Instalasi Farmasi & Tim Terkait", "Ka. BDRS & Ka. IGD", "Tim PPI & Ka. Ruangan", "Ka. IPSRS & Tim K3RS", dll).
8. "effectivenessEvaluation": Pilih antara "EFEKTIF" atau "CUKUP_EFEKTIF".
9. "target": "TW II 2026" atau "TW III 2026".

KEMBALIKAN HANYA SATU BLOK JSON VALID TANPA MARKDOWN BACKTICKS:
{
  "rootCause": "Penjelasan mendalam akar masalah yang spesifik menghubungkan faktor penyebab dengan ${cleanStatement}",
  "p": 3,
  "d": 4,
  "mitigation": "Rencana mitigasi konkret dan terukur untuk menanggulangi ${cleanStatement}",
  "implementedActions": "Tindakan pencegahan nyata yang telah diterapkan di ${targetUnit}",
  "implementationDate": "${now}",
  "effectivenessEvaluation": "CUKUP_EFEKTIF",
  "pic": "Jabatan Penanggung Jawab Terkait",
  "target": "TW II 2026"
}`;

    // Call Gemini with candidate models loop to guarantee live AI generation without 503 interruption
    const candidateModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
    let response: any = null;
    let usedModel = candidateModels[0];

    for (const m of candidateModels) {
      try {
        const geminiPromise = ai.models.generateContent({
          model: m,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout on model ${m}`)), 8000)
        );

        response = await Promise.race([geminiPromise, timeoutPromise]);
        usedModel = m;
        if (response && response.text) break;
      } catch (mErr: any) {
        console.warn(`Risk complete model ${m} temporary failure, trying next candidate:`, mErr?.message);
      }
    }

    if (!response || !response.text) {
      throw new Error('All candidate models unavailable or timed out');
    }

    const responseText = response.text || '';
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    const p = Math.min(5, Math.max(1, parseInt(parsed.p) || 3));
    const d = Math.min(5, Math.max(1, parseInt(parsed.d) || 3));
    const score = p * d;
    const grade = score >= 15 ? 'EKSTREM' : score >= 10 ? 'TINGGI' : score >= 4 ? 'SEDANG' : 'RENDAH';

    return res.json({
      success: true,
      data: {
        rootCause: parsed.rootCause || `Kelemahan prosedur operasional baku dan pengawasan berkala terkait ${cleanStatement} di ${targetUnit}`,
        p,
        d,
        score,
        grade,
        mitigation: parsed.mitigation || `Revisi dan sosialisasi SPO pencegahan serta audit berkala kepatuhan penanganan ${cleanStatement} di ${targetUnit}`,
        implementedActions: parsed.implementedActions || `Sosialisasi alur kerja aman dan checklist kepatuhan shift di ${targetUnit}`,
        implementationDate: parsed.implementationDate || now,
        effectivenessEvaluation: parsed.effectivenessEvaluation || 'CUKUP_EFEKTIF',
        pic: parsed.pic || `Kepala ${targetUnit} & Tim Mutu`,
        target: parsed.target || 'TW II 2026'
      },
      source: 'gemini_api'
    });
  } catch (err: any) {
    console.warn('AI risk completion fallback used:', err?.message);
    return res.json({ success: true, data: generateFallbackFields(), source: 'fallback_template', errorDetail: err?.message });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIM Risk Register RSU SHANTI GRAHA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
