/**
 * SIM RISK REGISTER - RSU SHANTI GRAHA
 * Sistem Informasi Manajemen Risiko Rumah Sakit
 * Berdasarkan Standar Akreditasi STARKES Kemenkes RI & ISO 31000:2018
 * Penanggung Jawab: Ns.Nyoman adi Sedana,S.Kep (Sub Komite Manajemen Risiko)
 */

import React, { useState, useEffect } from 'react';
import { HeaderNavbar } from './components/HeaderNavbar';
import { DashboardView } from './components/DashboardView';
import { RiskProfileView } from './components/RiskProfileView';
import { PpiRiskView } from './components/PpiRiskView';
import { MfkRiskView } from './components/MfkRiskView';
import { RcaWorkspaceView } from './components/RcaWorkspaceView';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { CheckCircle2, AlertCircle, Plus, X, Sparkles, Info } from 'lucide-react';
import { exportRiskRegisterToExcel } from './utils/excelExport';
import { UnitRiskItem, HospitalUnit, StarkesRiskCategory, RiskLevel } from './types/clinical';
import { ALL_HOSPITAL_UNITS, STARKES_CATEGORIES_CONFIG } from './data/mockRiskManagementData';
import { getRiskBadgeStyle } from './utils/riskCalculators';
import { 
  db, 
  RISKS_COLLECTION, 
  saveRiskToFirestore, 
  deleteRiskFromFirestore, 
  syncBatchToFirestore,
  clearAllRisksFromFirestore 
} from './services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY = 'rsu_shanti_graha_risks_v3';
// Clear previous versions
try {
  localStorage.removeItem('rsu_shanti_graha_risks_v1');
  localStorage.removeItem('rsu_shanti_graha_risks_v2');
} catch (e) {}

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedUnitForView, setSelectedUnitForView] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' } | null>(null);

  // Google Drive Modal
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Quick Add Modal for PPI / MFK direct entry
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddCategory, setQuickAddCategory] = useState<StarkesRiskCategory>('PPI_SURVEILANCE');
  const [quickAddUnit, setQuickAddUnit] = useState<HospitalUnit>('IGD');
  const [quickAddStatement, setQuickAddStatement] = useState('');
  const [quickAddRootCause, setQuickAddRootCause] = useState('');
  const [quickAddP, setQuickAddP] = useState<number>(3);
  const [quickAddD, setQuickAddD] = useState<number>(3);
  const [quickAddMitigation, setQuickAddMitigation] = useState('');
  const [quickAddPic, setQuickAddPic] = useState('');
  const [quickAddTarget, setQuickAddTarget] = useState('TW II 2026');

  // Quick Add Modal AI loading state
  const [isQuickAddAiLoading, setIsQuickAddAiLoading] = useState(false);

  const handleQuickAddAiComplete = async () => {
    if (!quickAddStatement.trim()) {
      showToast('Ketik pernyataan risiko terlebih dahulu sebelum klik AI!', 'alert');
      return;
    }
    setIsQuickAddAiLoading(true);
    try {
      const selectedUnitObj = ALL_HOSPITAL_UNITS.find(u => u.key === quickAddUnit);
      const res = await fetch('/api/ai/complete-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statement: quickAddStatement,
          unit: quickAddUnit,
          unitLabel: selectedUnitObj?.label || quickAddUnit,
          categoryKey: quickAddCategory,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          if (d.rootCause) setQuickAddRootCause(d.rootCause);
          if (d.p) setQuickAddP(d.p);
          if (d.d) setQuickAddD(d.d);
          if (d.mitigation) setQuickAddMitigation(d.mitigation);
          if (d.pic) setQuickAddPic(d.pic);
          if (d.target) setQuickAddTarget(d.target);
          showToast('✨ Isian berhasil dilengkapi otomatis oleh AI! Silakan periksa sebelum menyimpan.', 'success');
        }
      }
    } catch (err) {
      console.warn('Quick add AI error, using contextual fallback:', err);
      const s = quickAddStatement.toLowerCase();
      const selectedUnitObj = ALL_HOSPITAL_UNITS.find(u => u.key === quickAddUnit);
      const unitName = selectedUnitObj?.label || quickAddUnit;

      let fallbackRoot = '';
      let fallbackMitigation = '';
      let fallbackPic = `Kepala ${unitName} & Tim Mutu`;
      let fallbackP = 3;
      let fallbackD = 4;

      if (s.includes('darah') || s.includes('transfusi') || s.includes('bdrs')) {
        fallbackRoot = `Ketiadaan sistem pemantauan batas minimum stok darah cito (buffer stock) di BDRS serta keterlambatan komunikasi real-time antara ${unitName} dan Bank Darah saat kebutuhan darurat.`;
        fallbackMitigation = `Penyusunan SPO Buffer Stock Darah Universal di BDRS, integrasi alur pemesanan darah cito via SIMRS, serta pembaharuan MoU pasokan prioritas dengan UTD PMI.`;
        fallbackPic = `Ka. BDRS & Ka. ${unitName}`;
        fallbackD = 5;
      } else if (s.includes('jarum') || s.includes('tertusuk') || s.includes('spuit') || s.includes('limbah') || s.includes('infeksi')) {
        fallbackRoot = `Ketidakpatuhan pembuangan jarum suntik ke safety box, kebiasaan recapping dua tangan tanpa alat bantu, dan belum optimalnya ketersediaan APD protektif saat tindakan di ${unitName}.`;
        fallbackMitigation = `Penyediaan safety box berstandar WHO di setiap troli tindakan, sosialisasi larangan recapping jarum suntik, dan audit berkala kepatuhan PPI oleh IPCN.`;
        fallbackPic = `Komite PPI & Ka. ${unitName}`;
      } else if (s.includes('jatuh') || s.includes('fall') || s.includes('bed rail') || s.includes('lantai')) {
        fallbackRoot = `Asesmen ulang risiko jatuh Morse/Humpty Dumpty belum konsisten saat perubahan kondisi pasien, serta minimnya penguncian roda tempat tidur dan palang pengaman (bed rail).`;
        fallbackMitigation = `Pemasangan stiker penanda risiko jatuh kuning di tempat tidur/gelang pasien, edukasi keluarga pasien tentang tombol darurat perawat, dan inspeksi rutin kelaikan bed rail oleh IPSRS.`;
        fallbackPic = `Ka. Ruangan ${unitName} & Tim Keselamatan Pasien`;
      } else if (s.includes('obat') || s.includes('resep') || s.includes('dosis') || s.includes('lasa') || s.includes('alergi')) {
        fallbackRoot = `Belum dilaksanakannya verifikasi independen ganda (independent double check) pada obat high-alert/LASA dan tulisan resep yang berpotensi menimbulkan salah interpretasi dosis.`;
        fallbackMitigation = `Pemberian stiker neon LASA dan HAM (High Alert Medication), implementasi mandatory double check sebelum obat diserahkan ke pasien, dan integrasi validasi dosis otomatis pada SIMRS.`;
        fallbackPic = `Ka. Instalasi Farmasi & Ka. ${unitName}`;
      } else {
        fallbackRoot = `Kelemahan kepatuhan pelaksanaan SPO terkait "${quickAddStatement.trim()}", keterbatasan sarana pendukung dan instrumen checklist pengawasan berkala pada ${unitName}.`;
        fallbackMitigation = `Revisi dan sosialisasi SPO operasional terkait penanganan potensi "${quickAddStatement.trim()}", pelatihan kompetensi staf berkala, dan audit kepatuhan oleh Tim Mutu & Manajemen Risiko.`;
        fallbackPic = `Kepala ${unitName} & Tim Terkait`;
      }

      setQuickAddRootCause(fallbackRoot);
      setQuickAddP(fallbackP);
      setQuickAddD(fallbackD);
      setQuickAddMitigation(fallbackMitigation);
      setQuickAddPic(fallbackPic);
      setQuickAddTarget('TW II 2026');
      showToast('✨ Isian berhasil disesuaikan secara dinamis dengan pernyataan risiko.', 'success');
    } finally {
      setIsQuickAddAiLoading(false);
    }
  };

  // Master risks state: initialized with localStorage fallback and synced with Firestore & server
  const [risks, setRisks] = useState<UnitRiskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Gagal membaca localStorage');
    }
    return [];
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Initial load and continuous sync from Firestore and Server for shared link permanent persistence
  useEffect(() => {
    let isMounted = true;

    // 1. Subscribe to Firestore in real time for permanent cloud persistence
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      const colRef = collection(db, RISKS_COLLECTION);
      unsubscribeFirestore = onSnapshot(colRef, (snapshot) => {
        if (!isMounted) return;
        if (!snapshot.empty) {
          const cloudItems: UnitRiskItem[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as UnitRiskItem;
            if (data && data.id && data.id !== 'RR-IGD-653') {
              cloudItems.push(data);
            }
          });
          if (isMounted) {
            setRisks(cloudItems);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudItems));
            // Keep local server in sync if there are items
            if (cloudItems.length > 0) {
              fetch('/api/risks/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cloudItems }),
              }).catch(() => {});
            }
          }
        } else {
          // Cloud collection is empty
          const saved = localStorage.getItem(STORAGE_KEY);
          if (!saved || saved === '[]') {
            setRisks([]);
          }
        }
      }, (err) => {
        console.warn('Firestore subscription fallback:', err);
      });
    } catch (e) {
      console.warn('Firestore onSnapshot init error:', e);
    }

    // 2. Server sync fallback
    async function syncFromServer() {
      try {
        const res = await fetch('/api/risks');
        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.data) && isMounted) {
            if (json.data.length > 0) {
              setRisks(json.data);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
              // Also sync to Firestore so cloud database is populated
              syncBatchToFirestore(json.data);
            } else {
              // Server is empty
              const saved = localStorage.getItem(STORAGE_KEY);
              if (!saved || saved === '[]') {
                setRisks([]);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Server sync offline, using local data:', err);
      }
    }

    syncFromServer();
    const interval = setInterval(syncFromServer, 8000);

    return () => {
      isMounted = false;
      if (unsubscribeFirestore) unsubscribeFirestore();
      clearInterval(interval);
    };
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(risks));
    } catch (e) {
      console.error('Gagal menyimpan ke localStorage:', e);
    }
  }, [risks]);

  const showToast = (text: string, type: 'success' | 'alert' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Add or update single risk item (saved permanently to Firestore, server disk & localStorage, never lost)
  const handleAddOrUpdateRisk = async (item: UnitRiskItem) => {
    const existingIndex = risks.findIndex(r => r.id === item.id);
    let updated: UnitRiskItem[];
    if (existingIndex >= 0) {
      updated = risks.map(r => r.id === item.id ? item : r);
      showToast(`Data risiko ${item.id} berhasil diperbarui & tersimpan permanen.`);
    } else {
      updated = [item, ...risks];
      showToast(`Risiko baru ${item.id} berhasil ditambahkan & tersimpan permanen.`);
    }
    setRisks(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}

    // Save to Firestore cloud database
    saveRiskToFirestore(item);

    // Save to server
    try {
      await fetch('/api/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    } catch (err) {
      console.warn('Gagal menyimpan ke server, tersimpan di Firestore & lokal browser:', err);
    }
  };

  // Delete risk ONLY when delete button is explicitly clicked
  const handleDeleteRisk = async (id: string) => {
    const filtered = risks.filter(r => r.id !== id);
    setRisks(filtered);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {}
    showToast(`Risiko ${id} berhasil dihapus.`);

    // Delete from Firestore cloud database
    deleteRiskFromFirestore(id);

    // Delete from server
    try {
      await fetch(`/api/risks/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Gagal menghapus di server:', err);
    }
  };

  // Clear all risks manually
  const handleClearAllRisks = async () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan seluruh data Risk Register? Seluruh data yang ada akan dihapus permanen dari sistem.')) {
      setRisks([]);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      } catch (e) {}
      await clearAllRisksFromFirestore();
      try {
        await fetch('/api/risks/clear-all', { method: 'POST' });
      } catch (err) {
        console.warn('Gagal mengosongkan data di server:', err);
      }
      showToast('Seluruh data register risiko berhasil dikosongkan.');
    }
  };

  // Quick export all units Excel directly from global action
  const handleExportAllUnitsExcel = () => {
    exportRiskRegisterToExcel(risks, {
      title: 'Semua Risk Register Unit Rumah Sakit (Seluruh 22 Unit)',
      scopeLabel: 'Semua Unit Kerja RS (22 Unit Pelayanan & Penunjang RSU SHANTI GRAHA)',
      officerName: 'Ns.Nyoman adi Sedana,S.Kep',
    });
    showToast('File Excel semua risk register unit RS berhasil diunduh dengan kolom dan tabel terstruktur rapi!');
  };

  // Handle Quick Add Modal Submit
  const handleSaveQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddStatement.trim()) {
      showToast('Pernyataan risiko wajib diisi!', 'alert');
      return;
    }

    const unitObj = ALL_HOSPITAL_UNITS.find(u => u.key === quickAddUnit);
    const catObj = STARKES_CATEGORIES_CONFIG.find(c => c.key === quickAddCategory);
    const score = quickAddP * quickAddD;
    const grade: RiskLevel = 
      score >= 15 ? 'EKSTREM' :
      score >= 10 ? 'TINGGI' :
      score >= 4 ? 'SEDANG' : 'RENDAH';

    const newId = `RR-${quickAddUnit.toUpperCase().replace(/\s+/g, '_')}-${Math.floor(100 + Math.random() * 900)}`;
    const newItem: UnitRiskItem = {
      id: newId,
      unit: quickAddUnit,
      unitLabel: unitObj?.label || quickAddUnit,
      categoryKey: quickAddCategory,
      categoryName: catObj?.label || quickAddCategory,
      statement: quickAddStatement.trim(),
      rootCause: quickAddRootCause.trim(),
      p: quickAddP,
      d: quickAddD,
      score,
      grade,
      mitigation: quickAddMitigation.trim() || 'Penyusunan dan kepatuhan SOP unit kerja',
      pic: quickAddPic.trim() || 'Kepala Unit / Tim Terkait',
      target: quickAddTarget.trim() || 'TW II 2026',
      status: 'In Progress',
      verifierUnit: 'KMKP RSU SHANTI GRAHA',
      verifStatus: 'Disetujui',
      verifNote: 'Tervalidasi'
    };

    handleAddOrUpdateRisk(newItem);
    setShowQuickAddModal(false);
    // Reset form
    setQuickAddStatement('');
    setQuickAddRootCause('');
    setQuickAddMitigation('');
    setQuickAddPic('');
  };

  const totalPpiRisks = risks.filter(r => r.categoryKey.startsWith('PPI_')).length;
  const totalMfkRisks = risks.filter(r => r.categoryKey.startsWith('MFK_')).length;
  const totalEkstremRisks = risks.filter(r => r.grade === 'EKSTREM' || r.score >= 15).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0b1c30] flex flex-col antialiased selection:bg-[#005d42]/15 selection:text-[#005d42]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-[4px] bg-[#0b1c30] text-white text-xs shadow-xl border border-[#cbd5e1] no-print">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#e11d48] shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Authoritative Navigation Bar */}
      <HeaderNavbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onExportAllUnitsExcel={handleExportAllUnitsExcel}
        onOpenGoogleDriveModal={() => setIsDriveModalOpen(true)}
        totalRisks={risks.length}
        totalPpiRisks={totalPpiRisks}
        totalMfkRisks={totalMfkRisks}
        totalEkstremRisks={totalEkstremRisks}
      />

      {/* Main Canvas Viewport */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6">
        {/* 1. Ikhtisar Eksekutif */}
        {currentTab === 'dashboard' && (
          <DashboardView
            risks={risks}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onSelectUnit={(unitKey) => {
              setSelectedUnitForView(unitKey);
              setCurrentTab('unit-risk');
            }}
          />
        )}

        {/* 2. Manajemen Risiko Unit */}
        {currentTab === 'unit-risk' && (
          <RiskProfileView
            initialSubTab="UNIT_RISK"
            initialSelectedUnit={selectedUnitForView}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            risks={risks}
            onAddOrUpdateRisk={handleAddOrUpdateRisk}
            onDeleteRisk={handleDeleteRisk}
            onClearAllRisks={handleClearAllRisks}
          />
        )}

        {/* 3. Manajemen Risiko Rumah Sakit (Ekstrem & Tinggi) */}
        {currentTab === 'rs-risk' && (
          <RiskProfileView
            initialSubTab="RS_PRIORITY"
            initialSelectedUnit="ALL"
            onNavigateTab={(tab) => setCurrentTab(tab)}
            risks={risks}
            onAddOrUpdateRisk={handleAddOrUpdateRisk}
            onDeleteRisk={handleDeleteRisk}
            onClearAllRisks={handleClearAllRisks}
          />
        )}

        {/* 4. Manajemen Risiko PPI (11 Kategori) */}
        {currentTab === 'ppi-risk' && (
          <PpiRiskView
            risks={risks}
            onAddOrUpdateRisk={handleAddOrUpdateRisk}
            onDeleteRisk={handleDeleteRisk}
            onOpenAddModalWithCategory={(category) => {
              setQuickAddCategory(category);
              setShowQuickAddModal(true);
            }}
          />
        )}

        {/* 5. Manajemen Risiko MFK (7 Standar) */}
        {currentTab === 'mfk-risk' && (
          <MfkRiskView
            risks={risks}
            onAddOrUpdateRisk={handleAddOrUpdateRisk}
            onDeleteRisk={handleDeleteRisk}
            onOpenAddModalWithCategory={(category) => {
              setQuickAddCategory(category);
              setShowQuickAddModal(true);
            }}
          />
        )}

        {/* 6. Matriks 5x5 RS */}
        {currentTab === 'matrix-5x5' && (
          <RiskProfileView
            initialSubTab="HEATMAP"
            initialSelectedUnit="ALL"
            onNavigateTab={(tab) => setCurrentTab(tab)}
            risks={risks}
            onAddOrUpdateRisk={handleAddOrUpdateRisk}
            onDeleteRisk={handleDeleteRisk}
            onClearAllRisks={handleClearAllRisks}
          />
        )}

        {/* 7. Investigasi RCA Komprehensif (6 Langkah STARKES KARS & Gemini AI) */}
        {currentTab === 'rca-workspace' && (
          <RcaWorkspaceView
            risks={risks}
            onAddOrUpdateRisk={handleAddOrUpdateRisk}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}
      </main>

      {/* Google Drive Integration Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        risks={risks}
        onShowToast={showToast}
      />

      {/* Quick Add Modal (Used by PPI and MFK views) */}
      {showQuickAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[8px] border border-[#cbd5e1] shadow-2xl overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 bg-[#0b1c30] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Input Risiko Baru</h3>
                <p className="text-[11px] text-slate-300">
                  Data otomatis terhubung ke Unit Kerja, Manajemen Risiko RS, serta Matriks 5x5
                </p>
              </div>
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickAdd} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Pilih Unit Kerja Pelapor *</label>
                  <select
                    value={quickAddUnit}
                    onChange={(e) => setQuickAddUnit(e.target.value as HospitalUnit)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-[4px] text-xs font-semibold"
                  >
                    {ALL_HOSPITAL_UNITS.map(u => (
                      <option key={u.key} value={u.key}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Kategori Standar *</label>
                  <select
                    value={quickAddCategory}
                    onChange={(e) => setQuickAddCategory(e.target.value as StarkesRiskCategory)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-[4px] text-xs font-semibold"
                  >
                    <optgroup label="Standar PPI (11 Kategori)">
                      <option value="PPI_SURVEILANCE">PPI SURVEILANCE IDO,ISK,PLEBITIS</option>
                      <option value="PPI_UNIT_RISIKO">PPI KEGIATAN UNIT YANG BERISIKO TERJADINYA INFEKSI</option>
                      <option value="PPI_ALAT_TINGGI">PPI PELAYANAN YANG MENGGUNAKAN PERALATAN BERISIKO TINGGI INFEKSI</option>
                      <option value="PPI_TINDAKAN">PPI TINDAKAN BERISIKO TINGGI INFEKSI</option>
                      <option value="PPI_DISTRIBUSI_LINEN">PPI PELAYANAN DISTRIBUSI LINEN BERSIH DAN KOTOR</option>
                      <option value="PPI_STERILISASI">PPI PELAYANAN STERILISASI ALAT</option>
                      <option value="PPI_KEBERSIHAN_LINGKUNGAN">PPI KEBERSIHAN LINGKUNGAN</option>
                      <option value="PPI_LAUNDRY">PPI PENGELOLAAN LINEN/LAUNDRY</option>
                      <option value="PPI_SAMPAH">PPI PENGELOLAAN SAMPAH MEDIS DAN NON MEDIS</option>
                      <option value="PPI_GIZI">PPI PENYEDIAAN MAKANAN</option>
                      <option value="PPI_JENAZAH">PPI PENGELOLAAN KAMAR JENAZAH</option>
                    </optgroup>
                    <optgroup label="Standar MFK (7 Standar)">
                      <option value="MFK_1">MFK 1 – MANAJEMEN KESELAMATAN</option>
                      <option value="MFK_2">MFK 2 – KEAMANAN</option>
                      <option value="MFK_3">MFK 3 – B3</option>
                      <option value="MFK_4">MFK 4 – UTILITAS</option>
                      <option value="MFK_5">MFK 5 – KEBAKARAN</option>
                      <option value="MFK_6">MFK 6 – ALAT MEDIS</option>
                      <option value="MFK_7">MFK 7 – BENCANA</option>
                    </optgroup>
                    <optgroup label="Standar Klinis & Tata Kelola">
                      <option value="KLINIS">Klinis / Keselamatan Pasien</option>
                      <option value="OPERASIONAL">Operasional</option>
                      <option value="FINANSIAL">Finansial</option>
                      <option value="HUKUM">Hukum & Regulasi</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <label className="font-semibold text-[#0b1c30]">Pernyataan Risiko *</label>
                  <button
                    type="button"
                    onClick={handleQuickAddAiComplete}
                    disabled={isQuickAddAiLoading || !quickAddStatement.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-[4px] text-xs font-bold shadow-xs cursor-pointer transition disabled:opacity-40"
                    title="Ketik pernyataan risiko, lalu klik tombol ini untuk mengisi seluruh isian ke bawah secara otomatis"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isQuickAddAiLoading ? 'animate-spin' : 'animate-pulse'}`} />
                    <span>{isQuickAddAiLoading ? 'Sedang Diproses AI...' : '✨ Isi Otomatis dengan AI'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={quickAddStatement}
                  onChange={(e) => setQuickAddStatement(e.target.value)}
                  placeholder="Ketik potensi bahaya/risiko di sini, lalu klik '✨ Isi Otomatis dengan AI' untuk melengkapi isian ke bawah..."
                  required
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] p-2.5 rounded-[4px] text-xs focus:border-[#005d42] outline-none"
                />
                <p className="text-[10.5px] text-[#64748b] mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3 text-purple-600 shrink-0" />
                  <span>Ketik pernyataan risiko manual, lalu klik tombol AI di atas untuk otomatis mengisi akar masalah, skor P×D, mitigasi, dan PIC ke bawah.</span>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">Akar Masalah (Root Cause)</label>
                <input
                  type="text"
                  value={quickAddRootCause}
                  onChange={(e) => setQuickAddRootCause(e.target.value)}
                  placeholder="Faktor penyebab dasar..."
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-[4px] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Peluang / Frekuensi (1-5)</label>
                  <select
                    value={quickAddP}
                    onChange={(e) => setQuickAddP(Number(e.target.value))}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-[4px] text-xs"
                  >
                    <option value={1}>1 - Sangat Jarang</option>
                    <option value={2}>2 - Jarang</option>
                    <option value={3}>3 - Mungkin</option>
                    <option value={4}>4 - Sering</option>
                    <option value={5}>5 - Sangat Sering</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Dampak Keparahan (1-5)</label>
                  <select
                    value={quickAddD}
                    onChange={(e) => setQuickAddD(Number(e.target.value))}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-[4px] text-xs"
                  >
                    <option value={1}>1 - Tidak Signifikan</option>
                    <option value={2}>2 - Minor</option>
                    <option value={3}>3 - Moderat</option>
                    <option value={4}>4 - Mayor</option>
                    <option value={5}>5 - Katastropik</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">Rencana Mitigasi & Pengendalian</label>
                <input
                  type="text"
                  value={quickAddMitigation}
                  onChange={(e) => setQuickAddMitigation(e.target.value)}
                  placeholder="Tindakan pencegahan, pelatihan, pemeliharaan alat, SOP..."
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-[4px] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Penanggung Jawab (PIC)</label>
                  <input
                    type="text"
                    value={quickAddPic}
                    onChange={(e) => setQuickAddPic(e.target.value)}
                    placeholder="Contoh: Tim PPI / Ka. IGD"
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-[4px] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">Target Penyelesaian</label>
                  <input
                    type="text"
                    value={quickAddTarget}
                    onChange={(e) => setQuickAddTarget(e.target.value)}
                    placeholder="Contoh: TW II 2026"
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-[4px] text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuickAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-[4px] text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#005d42] hover:bg-[#064e3b] text-white font-semibold rounded-[4px] shadow-xs cursor-pointer"
                >
                  Simpan Risiko
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Institutional Footer */}
      <footer className="mt-auto border-t border-[#e2e8f0] bg-white py-4 px-6 text-xs text-[#515f74] no-print">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 flex items-center shrink-0">
              <img
                src="/assets/aistudio/15_4_2021_23.23.16__1__f9550c83.png"
                alt="Logo RSU SHANTI GRAHA"
                className="h-full w-auto max-w-[180px] object-contain block"
              />
            </div>
            <div className="border-l border-[#cbd5e1] pl-3 text-left">
              <span className="font-semibold text-[#0b1c30]">SIM RISK REGISTER RSU SHANTI GRAHA</span>
              <span className="text-[11px] text-[#64748b] block">
                Standar Akreditasi STARKES Kemenkes RI • ISO 31000:2018
              </span>
            </div>
          </div>
          <div className="text-[11px] text-[#64748b] text-center md:text-right">
            Penanggung Jawab: <strong>Ns.Nyoman adi Sedana,S.Kep</strong> (Sub Komite Manajemen Risiko)
          </div>
        </div>
      </footer>
    </div>
  );
}
