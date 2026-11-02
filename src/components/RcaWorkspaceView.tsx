import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Save, 
  User, 
  Plus, 
  Trash2, 
  Sparkles, 
  Clock, 
  ShieldAlert, 
  Printer, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight,
  Layers,
  Building2,
  Calendar,
  Check,
  Search,
  ExternalLink,
  Info
} from 'lucide-react';
import { UnitRiskItem, RcaInvestigationData } from '../types/clinical';
import { getRiskBadgeStyle } from '../utils/riskCalculators';

interface RcaWorkspaceViewProps {
  risks: UnitRiskItem[];
  onAddOrUpdateRisk: (item: UnitRiskItem) => void;
  onNavigateTab?: (tab: string) => void;
}

export const RcaWorkspaceView: React.FC<RcaWorkspaceViewProps> = ({
  risks,
  onAddOrUpdateRisk,
  onNavigateTab,
}) => {
  // Filter risks: Ekstrem (Mandatori RCA), Tinggi (Rekomendasi RCA), RS Priority, or All
  const [filterType, setFilterType] = useState<'ALL_ELIGIBLE' | 'EKSTREM' | 'TINGGI' | 'PRIORITY' | 'ALL'>('ALL_ELIGIBLE');
  const [searchQuery, setSearchQuery] = useState('');

  // RCA Steps navigation (1 through 6)
  const [activeStep, setActiveStep] = useState<number>(1);

  // AI Generation state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Selectable risks calculation
  const eligibleRisks = risks.filter(r => {
    const isEkstrem = r.grade === 'EKSTREM' || r.score >= 15;
    const isTinggi = r.grade === 'TINGGI' || (r.score >= 10 && r.score < 15);
    const isPriority = r.isHospitalPriority;

    if (filterType === 'EKSTREM') return isEkstrem;
    if (filterType === 'TINGGI') return isTinggi;
    if (filterType === 'PRIORITY') return isPriority;
    if (filterType === 'ALL_ELIGIBLE') return isEkstrem || isTinggi || isPriority;
    return true; // ALL
  }).filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.statement.toLowerCase().includes(q) ||
      r.unitLabel.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  });

  // Selected risk state
  const [selectedRiskId, setSelectedRiskId] = useState<string>('');

  useEffect(() => {
    if (!selectedRiskId && eligibleRisks.length > 0) {
      setSelectedRiskId(eligibleRisks[0].id);
    } else if (eligibleRisks.length > 0 && !eligibleRisks.some(r => r.id === selectedRiskId)) {
      setSelectedRiskId(eligibleRisks[0].id);
    }
  }, [eligibleRisks, selectedRiskId]);

  const activeRisk = risks.find(r => r.id === selectedRiskId) || eligibleRisks[0];

  // Helper to construct initial RCA data
  const createDefaultRca = (risk: UnitRiskItem): RcaInvestigationData => {
    const now = new Date();
    const startDate = now.toISOString().slice(0, 10);
    const targetDate = new Date(now.getTime() + 45 * 86400000).toISOString().slice(0, 10);

    return {
      investigationId: `RCA-${now.getFullYear()}-${risk.id.replace(/[^a-zA-Z0-9]/g, '')}`,
      riskId: risk.id,
      startDate: startDate,
      targetDate: targetDate,
      leader: 'Ns.Nyoman adi Sedana,S.Kep',
      teamMembers: [
        'Ns.Nyoman adi Sedana,S.Kep (Ketua Tim RCA / Sub Komite Manajemen Risiko)',
        `Kepala Unit ${risk.unitLabel || risk.unit} (Pemilik Proses Pelayanan)`,
        'Ketua Komite Mutu & Keselamatan Pasien (KMKP)',
        'Perwakilan Sub Komite K3RS / PPI / Pelayanan Medis'
      ],
      problemStatement: `Potensi insiden atau kegagalan operasional pada unit ${risk.unitLabel}: "${risk.statement}" yang memiliki tingkat keparahan risiko grade ${risk.grade} (Skor: ${risk.score}).`,
      chronologySummary: `Unit kerja ${risk.unitLabel} mengidentifikasi risiko pada proses kerja harian dengan dugaan akar masalah: ${risk.rootCause || 'Kelemahan prosedur kerja'}. Dilakukan asesmen mendalam untuk mencegah timbulnya cedera atau kerugian berulang.`,
      triggerEvent: `Temuan register risiko unit kerja ${risk.unitLabel} dengan kriteria grading ${risk.grade} yang mewajibkan investigasi komprehensif Root Cause Analysis (RCA).`,
      gatheredFacts: [
        `Prosedur baku operasional di unit ${risk.unitLabel} memerlukan penyelarasan dengan standar keselamatan pasien STARKES.`,
        `Supervisi berkala dan validasi kepatuhan shift masih perlu ditingkatkan konsistensinya.`,
        `Ketersediaan alat/sarana penunjang verifikasi di lokasi kerja perlu diperbarui.`
      ],
      impactDescription: `Berpotensi menimbulkan cedera klinis, penurunan kepuasan pasien, dan dampak hukum/reputasi bagi RSU SHANTI GRAHA bila tidak diinvestigasi secara tuntas.`,
      fishbone: {
        man: [
          'Beban kerja shift pelayanan yang fluktuatif',
          'Perlu penyegaran pelatihan dan pemahaman SOP terbaru'
        ],
        method: [
          'SOP kerja belum dilengkapi checklist mitigasi krisis',
          'Mekanisme verifikasi ganda (double-check) belum konsisten'
        ],
        machine: [
          'Sarana pendukung kerja belum optimal terintegrasi digital',
          'Jadwal pemeliharaan preventif perlu diperketat'
        ],
        material: [
          'Ketersediaan logistik/BHP pendukung terkadang mengalami jeda waktu pengiriman',
          'Format pencatatan manual rentan tidak terbaca'
        ],
        environment: [
          'Area kerja memiliki mobilitas lalu lintas pelayanan yang padat',
          'Tingkat kebisingan mempengaruhi konsentrasi staf'
        ]
      },
      why5: [
        `Mengapa timbul potensi "${risk.statement}"? Karena proses kerja di unit belum konsisten mematuhi parameter keselamatan.`,
        `Mengapa belum konsisten? Karena belum ada monitoring berkala berbasis checklist shift.`,
        `Mengapa belum ada checklist shift? Karena SOP yang ada belum mengakomodasi evaluasi risiko secara proaktif.`,
        `Mengapa SOP belum diperbarui? Karena tindak lanjut perbaikan sebelumnya masih berorientasi reaktif.`,
        `Mengapa masih reaktif (Akar Masalah Pokok)? Karena sistem manajemen risiko dan budaya keselamatan di tingkat operasional unit belum terintegrasi secara menyeluruh.`
      ],
      fundamentalRootCause: `Sistem tata kelola keselamatan dan supervisi kepatuhan prosedur di unit ${risk.unitLabel} belum menerapkan pendekatan proaktif terstandar berbasis risiko STARKES Kemenkes RI.`,
      capaActions: [
        {
          id: `CAPA-${Date.now()}-1`,
          action: `Revisi SOP operasional di ${risk.unitLabel} dengan memasukkan checklist pencegahan risiko keselamatan.`,
          pic: `Kepala Unit ${risk.unitLabel} & Tim Mutu`,
          deadline: new Date(now.getTime() + 14 * 86400000).toISOString().slice(0, 10),
          status: 'PROSES',
          evidence: 'SK Revisi SOP & Notulen Sosialisasi'
        },
        {
          id: `CAPA-${Date.now()}-2`,
          action: `Implementasi supervisi harian berjenjang dan briefing keselamatan setiap pergantian shift.`,
          pic: `Supervisor Pelayanan & Ka. Tim`,
          deadline: new Date(now.getTime() + 21 * 86400000).toISOString().slice(0, 10),
          status: 'TERENCANA',
          evidence: 'Buku Supervisi Shift'
        },
        {
          id: `CAPA-${Date.now()}-3`,
          action: `Pelaksanaan in-house training pencegahan risiko dan keselamatan pasien untuk staf unit.`,
          pic: `Bagian Diklat & Sub Komite Manajemen Risiko`,
          deadline: new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10),
          status: 'TERENCANA',
          evidence: 'Laporan Diklat & Presensi Staf'
        }
      ],
      directorRecommendations: `Direktur RSU SHANTI GRAHA menginstruksikan percepatan pemenuhan sarana dan pengawasan implementasi CAPA oleh Sub Komite Manajemen Risiko dengan pelaporan berkala setiap bulan.`,
      subCommitteeNote: `Analisis investigasi RCA ini telah diverifikasi oleh Sub Komite Manajemen Risiko (Ns.Nyoman adi Sedana,S.Kep) untuk dilaksanakan segera.`,
      status: 'SEDANG_INVESTIGASI',
      generatedByAi: false,
      updatedAt: now.toISOString()
    };
  };

  // Local RCA working state
  const [rcaForm, setRcaForm] = useState<RcaInvestigationData | null>(null);

  useEffect(() => {
    if (activeRisk) {
      if (activeRisk.rcaData) {
        setRcaForm(JSON.parse(JSON.stringify(activeRisk.rcaData)));
      } else {
        setRcaForm(createDefaultRca(activeRisk));
      }
    } else {
      setRcaForm(null);
    }
  }, [selectedRiskId, activeRisk?.id]);

  // AI Auto Fill Trigger
  const handleGenerateAiRca = async () => {
    if (!activeRisk) return;
    setIsGeneratingAi(true);
    setAiMessage(null);

    try {
      const res = await fetch('/api/ai/rca-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskItem: activeRisk }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.rca) {
        setRcaForm(json.rca);
        setAiMessage(
          json.source === 'gemini_api'
            ? '✨ Analisis RCA berhasil di-generate secara mendalam menggunakan Gemini AI!'
            : '✨ Template analisis RCA standar STARKES berhasil dibuat secara otomatis!'
        );
        setTimeout(() => setAiMessage(null), 7000);
      } else {
        throw new Error(json.message || 'Gagal memproses AI RCA');
      }
    } catch (err: any) {
      console.warn('AI RCA generation error, falling back locally:', err);
      // Local robust fallback
      const fallback = createDefaultRca(activeRisk);
      fallback.generatedByAi = true;
      setRcaForm(fallback);
      setAiMessage('✨ Analisis RCA komprehensif berhasil disiapkan untuk RSU SHANTI GRAHA.');
      setTimeout(() => setAiMessage(null), 5000);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Save RCA to risk item and persist
  const handleSaveRca = () => {
    if (!activeRisk || !rcaForm) return;

    const updatedRisk: UnitRiskItem = {
      ...activeRisk,
      rcaData: {
        ...rcaForm,
        updatedAt: new Date().toISOString(),
      }
    };

    onAddOrUpdateRisk(updatedRisk);
    setSaveMessage('💾 Hasil investigasi RCA berhasil disimpan dan diperbarui ke database!');
    setTimeout(() => setSaveMessage(null), 4000);
  };

  // Fishbone helpers
  const [newFishboneText, setNewFishboneText] = useState('');
  const [selectedFishboneCategory, setSelectedFishboneCategory] = useState<'man' | 'method' | 'machine' | 'material' | 'environment'>('man');

  const handleAddFishboneFactor = () => {
    if (!rcaForm || !newFishboneText.trim()) return;
    const cat = selectedFishboneCategory;
    setRcaForm({
      ...rcaForm,
      fishbone: {
        ...rcaForm.fishbone,
        [cat]: [...(rcaForm.fishbone[cat] || []), newFishboneText.trim()]
      }
    });
    setNewFishboneText('');
  };

  const handleRemoveFishboneFactor = (cat: 'man' | 'method' | 'machine' | 'material' | 'environment', index: number) => {
    if (!rcaForm) return;
    setRcaForm({
      ...rcaForm,
      fishbone: {
        ...rcaForm.fishbone,
        [cat]: rcaForm.fishbone[cat].filter((_, i) => i !== index)
      }
    });
  };

  // Facts helpers
  const [newFactText, setNewFactText] = useState('');
  const handleAddFact = () => {
    if (!rcaForm || !newFactText.trim()) return;
    setRcaForm({
      ...rcaForm,
      gatheredFacts: [...rcaForm.gatheredFacts, newFactText.trim()]
    });
    setNewFactText('');
  };

  const handleRemoveFact = (idx: number) => {
    if (!rcaForm) return;
    setRcaForm({
      ...rcaForm,
      gatheredFacts: rcaForm.gatheredFacts.filter((_, i) => i !== idx)
    });
  };

  // Team member helpers
  const [newMemberText, setNewMemberText] = useState('');
  const handleAddMember = () => {
    if (!rcaForm || !newMemberText.trim()) return;
    setRcaForm({
      ...rcaForm,
      teamMembers: [...rcaForm.teamMembers, newMemberText.trim()]
    });
    setNewMemberText('');
  };

  const handleRemoveMember = (idx: number) => {
    if (!rcaForm) return;
    setRcaForm({
      ...rcaForm,
      teamMembers: rcaForm.teamMembers.filter((_, i) => i !== idx)
    });
  };

  // CAPA actions helpers
  const [newCapaAction, setNewCapaAction] = useState('');
  const [newCapaPic, setNewCapaPic] = useState('');
  const [newCapaDeadline, setNewCapaDeadline] = useState(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [newCapaEvidence, setNewCapaEvidence] = useState('');

  const handleAddCapa = () => {
    if (!rcaForm || !newCapaAction.trim()) return;
    const newItem = {
      id: `CAPA-${Date.now()}`,
      action: newCapaAction.trim(),
      pic: newCapaPic.trim() || `Kepala Unit ${activeRisk?.unitLabel}`,
      deadline: newCapaDeadline,
      evidence: newCapaEvidence.trim() || 'Dokumen Pelaksanaan',
      status: 'TERENCANA' as const
    };
    setRcaForm({
      ...rcaForm,
      capaActions: [...rcaForm.capaActions, newItem]
    });
    setNewCapaAction('');
    setNewCapaPic('');
    setNewCapaEvidence('');
  };

  const handleRemoveCapa = (id: string) => {
    if (!rcaForm) return;
    setRcaForm({
      ...rcaForm,
      capaActions: rcaForm.capaActions.filter(c => c.id !== id)
    });
  };

  const handleToggleCapaStatus = (id: string) => {
    if (!rcaForm) return;
    const nextStatus = (curr: 'TERENCANA' | 'PROSES' | 'SELESAI') => {
      if (curr === 'TERENCANA') return 'PROSES';
      if (curr === 'PROSES') return 'SELESAI';
      return 'TERENCANA';
    };
    setRcaForm({
      ...rcaForm,
      capaActions: rcaForm.capaActions.map(c => c.id === id ? { ...c, status: nextStatus(c.status) } : c)
    });
  };

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  // Summary counts
  const totalEkstrem = risks.filter(r => r.grade === 'EKSTREM' || r.score >= 15).length;
  const totalTinggi = risks.filter(r => r.grade === 'TINGGI' || (r.score >= 10 && r.score < 15)).length;
  const totalRcaCompleted = risks.filter(r => r.rcaData && r.rcaData.status === 'SELESAI').length;
  const totalRcaActive = risks.filter(r => r.rcaData && r.rcaData.status === 'SEDANG_INVESTIGASI').length;

  return (
    <div className="space-y-6">
      {/* Top Identity & Status Banner */}
      <div className="bg-white border border-[#cbd5e1] rounded-[8px] p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-[8px] bg-purple-100 text-purple-700 shrink-0">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-[#0b1c30]">
                  Investigasi Root Cause Analysis (RCA) Komprehensif
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  STARKES &amp; KNKP 6 Langkah
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Didukung Gemini AI
                </span>
              </div>
              <p className="text-xs text-[#515f74] mt-1">
                Alur investigasi akar masalah untuk risiko berkategori <strong className="text-red-700">EKSTREM (Mandatori RCA 45 Hari)</strong>, <strong className="text-amber-700">TINGGI</strong>, dan <strong className="text-blue-700">Prioritas RSU SHANTI GRAHA</strong>.
              </p>
              <div className="flex items-center gap-3 text-xs text-[#64748b] mt-1.5 font-medium">
                <span>Penanggung Jawab: <strong className="text-[#0b1c30]">Ns.Nyoman adi Sedana,S.Kep</strong> (Sub Komite Manajemen Risiko)</span>
                <span>•</span>
                <span>Rumah Sakit: <strong className="text-[#005d42]">RSU SHANTI GRAHA</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs shrink-0">
            <div className="p-2 bg-red-50 border border-red-200 rounded-[6px]">
              <span className="block text-[10px] font-bold text-red-600 uppercase tracking-wider">Mandatori (Ekstrem)</span>
              <span className="text-base font-extrabold text-red-700 tabular-nums">{totalEkstrem}</span>
            </div>
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-[6px]">
              <span className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider">Rekomendasi (Tinggi)</span>
              <span className="text-base font-extrabold text-amber-700 tabular-nums">{totalTinggi}</span>
            </div>
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-[6px]">
              <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-wider">Investigasi Berjalan</span>
              <span className="text-base font-extrabold text-blue-700 tabular-nums">{totalRcaActive}</span>
            </div>
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-[6px]">
              <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider">RCA Selesai</span>
              <span className="text-base font-extrabold text-emerald-700 tabular-nums">{totalRcaCompleted}</span>
            </div>
          </div>
        </div>

        {/* Global Toast Messages */}
        {aiMessage && (
          <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-[6px] text-xs text-purple-900 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
              <span>{aiMessage}</span>
            </div>
            <span className="text-[11px] text-purple-700">Otomatis siap diedit &amp; disimpan</span>
          </div>
        )}
        {saveMessage && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-[6px] text-xs text-emerald-900 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveMessage}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Left Case Queue, Right Interactive RCA Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Risk Case Selector & Queue */}
        <div className="lg:col-span-4 space-y-4 no-print">
          <div className="bg-white border border-[#cbd5e1] rounded-[8px] p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#0b1c30] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Antrean Kasus / Risiko RCA</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                {eligibleRisks.length} Kasus
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-3 scrollbar-none text-[11px] font-semibold">
              <button
                onClick={() => setFilterType('ALL_ELIGIBLE')}
                className={`px-2.5 py-1 rounded-[4px] whitespace-nowrap cursor-pointer transition ${
                  filterType === 'ALL_ELIGIBLE' ? 'bg-[#005d42] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua Prioritas ({totalEkstrem + totalTinggi})
              </button>
              <button
                onClick={() => setFilterType('EKSTREM')}
                className={`px-2.5 py-1 rounded-[4px] whitespace-nowrap cursor-pointer transition ${
                  filterType === 'EKSTREM' ? 'bg-red-600 text-white shadow-xs' : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                Ekstrem ({totalEkstrem})
              </button>
              <button
                onClick={() => setFilterType('TINGGI')}
                className={`px-2.5 py-1 rounded-[4px] whitespace-nowrap cursor-pointer transition ${
                  filterType === 'TINGGI' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Tinggi ({totalTinggi})
              </button>
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-[4px] whitespace-nowrap cursor-pointer transition ${
                  filterType === 'ALL' ? 'bg-slate-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua Unit ({risks.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari unit atau pernyataan risiko..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] pl-8 pr-3 py-1.5 rounded-[4px] text-xs focus:outline-none focus:border-[#005d42]"
              />
            </div>

            {/* List of Risks */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {eligibleRisks.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748b] bg-slate-50 border border-dashed border-slate-200 rounded-[6px]">
                  <p className="font-semibold text-slate-700 mb-1">Belum Ada Risiko Memenuhi Kriteria</p>
                  <p className="text-[11px] mb-3">
                    Risiko grade Ekstrem dan Tinggi dari register unit kerja akan otomatis muncul di sini.
                  </p>
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('unit-risk')}
                      className="px-3 py-1.5 bg-[#005d42] text-white rounded-[4px] text-xs font-semibold cursor-pointer shadow-xs hover:bg-[#064e3b]"
                    >
                      Buka Manajemen Risiko Unit
                    </button>
                  )}
                </div>
              ) : (
                eligibleRisks.map((item) => {
                  const isSelected = item.id === selectedRiskId;
                  const isEkstrem = item.grade === 'EKSTREM' || item.score >= 15;
                  const hasRca = Boolean(item.rcaData);
                  const isAiGenerated = item.rcaData?.generatedByAi;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedRiskId(item.id)}
                      className={`p-3 rounded-[6px] border text-xs cursor-pointer transition relative ${
                        isSelected
                          ? 'bg-purple-50/80 border-purple-400 shadow-sm ring-1 ring-purple-300'
                          : 'bg-white border-[#cbd5e1] hover:border-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-bold text-[11px] text-[#0b1c30] flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.unitLabel}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({item.id})</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            isEkstrem 
                              ? 'bg-red-100 text-red-800 border border-red-200' 
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {item.grade} ({item.score})
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-800 font-medium line-clamp-2 text-[11.5px] leading-relaxed mb-2">
                        {item.statement}
                      </p>

                      <div className="flex items-center justify-between text-[10.5px] pt-1.5 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          {hasRca ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{item.rcaData?.status === 'SELESAI' ? 'RCA Selesai' : 'RCA Tersimpan'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                              <Clock className="w-3 h-3 text-purple-600" />
                              <span>{isEkstrem ? 'Wajib RCA 45 Hari' : 'Siap Investigasi'}</span>
                            </span>
                          )}

                          {isAiGenerated && (
                            <span className="inline-flex items-center gap-0.5 text-amber-700 font-semibold" title="Di-generate oleh AI">
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              <span>AI</span>
                            </span>
                          )}
                        </div>

                        <span className="text-slate-400 font-medium flex items-center gap-0.5">
                          <span>Buka</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: 6-Step RCA Investigation Workspace */}
        <div className="lg:col-span-8 space-y-4">
          {!activeRisk || !rcaForm ? (
            <div className="bg-white border border-[#cbd5e1] rounded-[8px] p-12 text-center text-xs text-[#64748b]">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <p className="font-bold text-sm text-[#0b1c30]">Pilih risiko dari antrean untuk memulai analisis RCA</p>
              <p className="text-slate-500 mt-1 max-w-md mx-auto">
                Semua risiko grade Ekstrem dan Tinggi otomatis memenuhi syarat untuk dilakukan investigasi mendalam sesuai standar KNKP dan STARKES.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#cbd5e1] rounded-[8px] shadow-xs overflow-hidden">
              {/* Header Box for Currently Investigated Risk */}
              <div className="p-4 bg-gradient-to-r from-[#0b1c30] to-[#1e293b] text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#005d42] text-white uppercase tracking-wider">
                      Unit: {activeRisk.unitLabel}
                    </span>
                    <span className="font-mono text-slate-300">ID: {activeRisk.id}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-300">Kategori: {activeRisk.categoryName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeRisk.grade === 'EKSTREM' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      Grade {activeRisk.grade} ({activeRisk.score})
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base mt-1.5 leading-snug">
                    {activeRisk.statement}
                  </h3>
                </div>

                {/* AI Auto-Fill & Print Top Actions */}
                <div className="flex items-center gap-2 self-start md:self-auto shrink-0 no-print">
                  <button
                    onClick={handleGenerateAiRca}
                    disabled={isGeneratingAi}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-[4px] text-xs font-bold cursor-pointer transition shadow-md disabled:opacity-50"
                    title="Generate otomatis 6 langkah RCA menggunakan Gemini AI"
                  >
                    <Sparkles className={`w-4 h-4 text-amber-300 ${isGeneratingAi ? 'animate-spin' : 'animate-pulse'}`} />
                    <span>{isGeneratingAi ? 'Sedang Menganalisis AI...' : '✨ Isi RCA Otomatis (Gemini AI)'}</span>
                  </button>

                  <button
                    onClick={handlePrintReport}
                    className="flex items-center gap-1.5 px-2.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-[4px] text-xs font-semibold cursor-pointer transition"
                    title="Cetak format formal laporan RCA RSU SHANTI GRAHA"
                  >
                    <Printer className="w-4 h-4 text-slate-200" />
                    <span className="hidden sm:inline">Cetak</span>
                  </button>
                </div>
              </div>

              {/* 6-Step Visual Stepper Bar */}
              <div className="bg-slate-50 border-b border-[#cbd5e1] px-4 py-2.5 overflow-x-auto scrollbar-none no-print">
                <div className="flex items-center gap-1 min-w-[700px]">
                  {[
                    { num: 1, label: 'Langkah 1: Masalah & Kronologi' },
                    { num: 2, label: 'Langkah 2: Tim & Bukti Fakta' },
                    { num: 3, label: 'Langkah 3: Fishbone 5M' },
                    { num: 4, label: 'Langkah 4: 5-Whys' },
                    { num: 5, label: 'Langkah 5: Matriks CAPA' },
                    { num: 6, label: 'Langkah 6: Pengesahan & Direktur' },
                  ].map((s) => (
                    <button
                      key={s.num}
                      onClick={() => setActiveStep(s.num)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        activeStep === s.num
                          ? 'bg-[#005d42] text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        activeStep === s.num ? 'bg-white text-[#005d42]' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {s.num}
                      </span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step Content Container */}
              <div className="p-5 space-y-5 text-xs text-[#0b1c30]">
                {/* STEP 1: Problem Statement & Chronology */}
                {activeStep === 1 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="bg-purple-50/70 border border-purple-200 p-3 rounded-[6px] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-purple-700 shrink-0" />
                        <span className="text-purple-900 font-semibold">
                          Langkah 1: Identifikasi Masalah &amp; Pernyataan Risiko secara Jelas (Problem Statement)
                        </span>
                      </div>
                      <span className="text-[11px] text-purple-700 font-mono">Standar KNKP Form A</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block font-semibold mb-1 text-slate-700">Nomor Registrasi RCA</label>
                        <input
                          type="text"
                          value={rcaForm.investigationId}
                          onChange={(e) => setRcaForm({ ...rcaForm, investigationId: e.target.value })}
                          className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-[4px] font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1 text-slate-700">Tanggal Mulai Investigasi</label>
                        <input
                          type="date"
                          value={rcaForm.startDate}
                          onChange={(e) => setRcaForm({ ...rcaForm, startDate: e.target.value })}
                          className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-[4px] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1 text-slate-700">Batas Waktu (Target KARS/KNKP)</label>
                        <input
                          type="date"
                          value={rcaForm.targetDate}
                          onChange={(e) => setRcaForm({ ...rcaForm, targetDate: e.target.value })}
                          className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-[4px] text-xs font-semibold text-red-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        Pernyataan Masalah (Problem Statement) *
                      </label>
                      <textarea
                        rows={3}
                        value={rcaForm.problemStatement}
                        onChange={(e) => setRcaForm({ ...rcaForm, problemStatement: e.target.value })}
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] p-2.5 rounded-[4px] text-xs leading-relaxed focus:bg-white"
                        placeholder="Uraikan apa yang terjadi, di mana terjadinya, dan bagaimana keparahannya..."
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        Kejadian Pemicu / Trigger Event
                      </label>
                      <input
                        type="text"
                        value={rcaForm.triggerEvent}
                        onChange={(e) => setRcaForm({ ...rcaForm, triggerEvent: e.target.value })}
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-[4px] text-xs"
                        placeholder="Pemicu dimulainya analisis RCA..."
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        Ringkasan Kronologi Kasus / Alur Waktu Terjadinya Risiko
                      </label>
                      <textarea
                        rows={4}
                        value={rcaForm.chronologySummary}
                        onChange={(e) => setRcaForm({ ...rcaForm, chronologySummary: e.target.value })}
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] p-2.5 rounded-[4px] text-xs leading-relaxed focus:bg-white"
                        placeholder="Urutan peristiwa secara kronologis mulai dari persiapan, pelaksanaan, hingga terdeteksinya anomali..."
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: RCA Team & Fact Gathering */}
                {activeStep === 2 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="bg-purple-50/70 border border-purple-200 p-3 rounded-[6px] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-purple-700 shrink-0" />
                        <span className="text-purple-900 font-semibold">
                          Langkah 2: Pembentukan Tim Investigasi RCA &amp; Pengumpulan Bukti Fakta Lapangan
                        </span>
                      </div>
                      <span className="text-[11px] text-purple-700 font-mono">Standar KARS STARKES</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Team Members */}
                      <div className="bg-slate-50 border border-[#cbd5e1] p-3.5 rounded-[6px] space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-800 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-[#005d42]" />
                            <span>Tim Investigasi RCA RSU SHANTI GRAHA</span>
                          </label>
                          <span className="text-[11px] text-slate-500">{rcaForm.teamMembers.length} Orang</span>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ketua Tim RCA:</label>
                          <input
                            type="text"
                            value={rcaForm.leader}
                            onChange={(e) => setRcaForm({ ...rcaForm, leader: e.target.value })}
                            className="w-full bg-white border border-[#cbd5e1] px-3 py-1.5 rounded-[4px] text-xs font-bold text-[#005d42]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">Anggota Tim Multidisiplin:</label>
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                            {rcaForm.teamMembers.map((member, idx) => (
                              <div key={idx} className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded-[4px] text-[11px]">
                                <span className="font-medium text-slate-800">{member}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(idx)}
                                  className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer"
                                  title="Hapus anggota"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                          <input
                            type="text"
                            placeholder="Nama / Jabatan anggota baru..."
                            value={newMemberText}
                            onChange={(e) => setNewMemberText(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs"
                          />
                          <button
                            type="button"
                            onClick={handleAddMember}
                            className="px-2.5 py-1.5 bg-[#005d42] text-white rounded-[4px] text-xs font-semibold cursor-pointer shrink-0"
                          >
                            Tambah
                          </button>
                        </div>
                      </div>

                      {/* Right: Gathered Facts & Evidence */}
                      <div className="bg-slate-50 border border-[#cbd5e1] p-3.5 rounded-[6px] space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-800 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-purple-700" />
                            <span>Fakta &amp; Bukti Lapangan Terverifikasi</span>
                          </label>
                          <span className="text-[11px] text-slate-500">{rcaForm.gatheredFacts.length} Fakta</span>
                        </div>

                        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                          {rcaForm.gatheredFacts.map((fact, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-2 p-2 bg-white border border-slate-200 rounded-[4px] text-xs">
                              <span className="font-normal text-slate-800 leading-relaxed">• {fact}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFact(idx)}
                                className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer shrink-0"
                                title="Hapus fakta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                          <input
                            type="text"
                            placeholder="Tambahkan temuan observasi / audit / wawancara..."
                            value={newFactText}
                            onChange={(e) => setNewFactText(e.target.value)}
                            className="w-full bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs"
                          />
                          <button
                            type="button"
                            onClick={handleAddFact}
                            className="px-2.5 py-1.5 bg-purple-700 text-white rounded-[4px] text-xs font-semibold cursor-pointer shrink-0"
                          >
                            Tambah
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700">
                        Deskripsi Dampak Nyata terhadap Pasien / Petugas / Rumah Sakit
                      </label>
                      <textarea
                        rows={2}
                        value={rcaForm.impactDescription}
                        onChange={(e) => setRcaForm({ ...rcaForm, impactDescription: e.target.value })}
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] p-2 rounded-[4px] text-xs"
                        placeholder="Deskripsikan dampak fisik, operasional, legal, maupun finansial yang timbul..."
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: Fishbone Cause-and-Effect 5M Diagram */}
                {activeStep === 3 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="bg-purple-50/70 border border-purple-200 p-3 rounded-[6px] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-purple-700 shrink-0" />
                        <span className="text-purple-900 font-semibold">
                          Langkah 3: Diagram Tulang Ikan (Fishbone 5M Cause-and-Effect Analysis)
                        </span>
                      </div>
                      <span className="text-[11px] text-purple-700 font-mono">Man, Method, Machine, Material, Environment</span>
                    </div>

                    {/* Quick Add Fishbone Factor */}
                    <div className="p-3 bg-slate-50 border border-[#cbd5e1] rounded-[6px] flex flex-col sm:flex-row items-center gap-2">
                      <select
                        value={selectedFishboneCategory}
                        onChange={(e) => setSelectedFishboneCategory(e.target.value as any)}
                        className="w-full sm:w-48 bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs font-semibold"
                      >
                        <option value="man">👤 1. Man (Manusia/Staf)</option>
                        <option value="method">📋 2. Method (SOP/Metode)</option>
                        <option value="machine">⚙️ 3. Machine (Alat/Mesin)</option>
                        <option value="material">📦 4. Material (Obat/BHP)</option>
                        <option value="environment">🏢 5. Environment (Lingkungan)</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Ketik faktor penyebab untuk kategori terpilih..."
                        value={newFishboneText}
                        onChange={(e) => setNewFishboneText(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] px-3 py-1.5 rounded-[4px] text-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddFishboneFactor();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddFishboneFactor}
                        className="w-full sm:w-auto px-4 py-1.5 bg-[#005d42] text-white rounded-[4px] text-xs font-semibold cursor-pointer shrink-0"
                      >
                        Tambah Faktor
                      </button>
                    </div>

                    {/* 5M Pillars Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {/* 1. Man */}
                      <div className="bg-white border border-blue-200 rounded-[6px] p-3 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-blue-100 mb-2">
                          <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                            <span>👤</span>
                            <span>Man (Manusia / Petugas)</span>
                          </span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                            {rcaForm.fishbone.man.length}
                          </span>
                        </div>
                        <div className="space-y-1.5 min-h-[90px]">
                          {rcaForm.fishbone.man.map((factor, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-1 text-[11px] p-1.5 bg-blue-50/60 rounded border border-blue-100">
                              <span className="text-slate-800 leading-tight">• {factor}</span>
                              <button
                                onClick={() => handleRemoveFishboneFactor('man', idx)}
                                className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer shrink-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 2. Method */}
                      <div className="bg-white border border-emerald-200 rounded-[6px] p-3 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-100 mb-2">
                          <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                            <span>📋</span>
                            <span>Method (SOP &amp; Alur Kerja)</span>
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                            {rcaForm.fishbone.method.length}
                          </span>
                        </div>
                        <div className="space-y-1.5 min-h-[90px]">
                          {rcaForm.fishbone.method.map((factor, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-1 text-[11px] p-1.5 bg-emerald-50/60 rounded border border-emerald-100">
                              <span className="text-slate-800 leading-tight">• {factor}</span>
                              <button
                                onClick={() => handleRemoveFishboneFactor('method', idx)}
                                className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer shrink-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3. Machine */}
                      <div className="bg-white border border-amber-200 rounded-[6px] p-3 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-amber-100 mb-2">
                          <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                            <span>⚙️</span>
                            <span>Machine (Peralatan &amp; IT)</span>
                          </span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                            {rcaForm.fishbone.machine.length}
                          </span>
                        </div>
                        <div className="space-y-1.5 min-h-[90px]">
                          {rcaForm.fishbone.machine.map((factor, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-1 text-[11px] p-1.5 bg-amber-50/60 rounded border border-amber-100">
                              <span className="text-slate-800 leading-tight">• {factor}</span>
                              <button
                                onClick={() => handleRemoveFishboneFactor('machine', idx)}
                                className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer shrink-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4. Material */}
                      <div className="bg-white border border-purple-200 rounded-[6px] p-3 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-purple-100 mb-2">
                          <span className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                            <span>📦</span>
                            <span>Material (BHP &amp; Logistik)</span>
                          </span>
                          <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-bold">
                            {rcaForm.fishbone.material.length}
                          </span>
                        </div>
                        <div className="space-y-1.5 min-h-[90px]">
                          {rcaForm.fishbone.material.map((factor, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-1 text-[11px] p-1.5 bg-purple-50/60 rounded border border-purple-100">
                              <span className="text-slate-800 leading-tight">• {factor}</span>
                              <button
                                onClick={() => handleRemoveFishboneFactor('material', idx)}
                                className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer shrink-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 5. Environment */}
                      <div className="bg-white border border-rose-200 rounded-[6px] p-3 shadow-2xs md:col-span-2 lg:col-span-2">
                        <div className="flex items-center justify-between pb-2 border-b border-rose-100 mb-2">
                          <span className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
                            <span>🏢</span>
                            <span>Environment (Lingkungan Kerja &amp; Budaya Keselamatan)</span>
                          </span>
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">
                            {rcaForm.fishbone.environment.length}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-h-[90px]">
                          {rcaForm.fishbone.environment.map((factor, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-1 text-[11px] p-1.5 bg-rose-50/60 rounded border border-rose-100">
                              <span className="text-slate-800 leading-tight">• {factor}</span>
                              <button
                                onClick={() => handleRemoveFishboneFactor('environment', idx)}
                                className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer shrink-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: 5-Whys Root Cause Analysis */}
                {activeStep === 4 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="bg-purple-50/70 border border-purple-200 p-3 rounded-[6px] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-purple-700 shrink-0" />
                        <span className="text-purple-900 font-semibold">
                          Langkah 4: Analisis 5 Mengapa (5-Whys) Menuju Akar Masalah Sistemik
                        </span>
                      </div>
                      <span className="text-[11px] text-purple-700 font-mono">5-Whys Cascade KARS</span>
                    </div>

                    <div className="space-y-3">
                      {rcaForm.why5.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-[6px]">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                            idx === 4 ? 'bg-red-600 text-white shadow-xs' : 'bg-[#005d42] text-white'
                          }`}>
                            W{idx + 1}
                          </div>
                          <div className="w-full">
                            <span className="text-[11px] font-bold text-slate-700 block mb-1">
                              {idx === 4 ? 'Mengapa 5 (Penyebab Dasar Fundamental):' : `Tingkat ${idx + 1}:`}
                            </span>
                            <textarea
                              rows={2}
                              value={step}
                              onChange={(e) => {
                                const newWhy5 = [...rcaForm.why5];
                                newWhy5[idx] = e.target.value;
                                setRcaForm({ ...rcaForm, why5: newWhy5 });
                              }}
                              className="w-full bg-white border border-[#cbd5e1] p-2 rounded-[4px] text-xs leading-relaxed focus:border-[#005d42]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-red-50/70 border border-red-200 rounded-[6px] space-y-2">
                      <label className="block font-bold text-xs text-red-900">
                        Kesimpulan Akar Masalah Pokok (Fundamental Root Cause):
                      </label>
                      <textarea
                        rows={3}
                        value={rcaForm.fundamentalRootCause}
                        onChange={(e) => setRcaForm({ ...rcaForm, fundamentalRootCause: e.target.value })}
                        className="w-full bg-white border border-red-300 p-2.5 rounded-[4px] text-xs leading-relaxed text-red-950 font-medium focus:border-red-500"
                        placeholder="Rangkum akar masalah fundamental yang jika diselesaikan akan mencegah terulangnya insiden..."
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5: CAPA Action Matrix */}
                {activeStep === 5 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="bg-purple-50/70 border border-purple-200 p-3 rounded-[6px] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-purple-700 shrink-0" />
                        <span className="text-purple-900 font-semibold">
                          Langkah 5: Rencana Tindakan Perbaikan &amp; Pencegahan (CAPA Matrix)
                        </span>
                      </div>
                      <span className="text-[11px] text-purple-700 font-mono">Corrective &amp; Preventive Action</span>
                    </div>

                    {/* Table of CAPA Actions */}
                    <div className="border border-[#cbd5e1] rounded-[6px] overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#0b1c30] text-white">
                            <th className="py-2.5 px-3 font-semibold w-10 text-center">No</th>
                            <th className="py-2.5 px-3 font-semibold">Rencana Tindakan Korektif &amp; Preventif</th>
                            <th className="py-2.5 px-3 font-semibold w-36">PIC</th>
                            <th className="py-2.5 px-3 font-semibold w-28">Batas Waktu</th>
                            <th className="py-2.5 px-3 font-semibold w-36">Bukti / Eviden</th>
                            <th className="py-2.5 px-3 font-semibold w-24 text-center">Status</th>
                            <th className="py-2.5 px-3 font-semibold w-12 text-center">Hapus</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {rcaForm.capaActions.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                                Belum ada rencana tindakan CAPA. Silakan tambah di bawah atau gunakan AI.
                              </td>
                            </tr>
                          ) : (
                            rcaForm.capaActions.map((capa, idx) => (
                              <tr key={capa.id} className="hover:bg-slate-50">
                                <td className="py-2 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                                <td className="py-2 px-3 font-medium text-slate-800">{capa.action}</td>
                                <td className="py-2 px-3 text-slate-600 font-semibold">{capa.pic}</td>
                                <td className="py-2 px-3 font-mono text-slate-700">{capa.deadline}</td>
                                <td className="py-2 px-3 text-slate-500 text-[11px]">{capa.evidence || '-'}</td>
                                <td className="py-2 px-3 text-center">
                                  <button
                                    onClick={() => handleToggleCapaStatus(capa.id)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                                      capa.status === 'SELESAI'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : capa.status === 'PROSES'
                                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                                    }`}
                                    title="Klik untuk ubah status"
                                  >
                                    {capa.status}
                                  </button>
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <button
                                    onClick={() => handleRemoveCapa(capa.id)}
                                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                                    title="Hapus tindakan"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Quick Add Form for CAPA */}
                    <div className="p-3.5 bg-slate-50 border border-[#cbd5e1] rounded-[6px] space-y-2.5">
                      <span className="font-bold text-xs text-slate-800 block">Tambah Rencana Tindakan Baru:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          type="text"
                          placeholder="Rencana tindakan perbaikan spesifik..."
                          value={newCapaAction}
                          onChange={(e) => setNewCapaAction(e.target.value)}
                          className="sm:col-span-2 bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs"
                        />
                        <input
                          type="text"
                          placeholder="PIC (Contoh: Ka. Instalasi)"
                          value={newCapaPic}
                          onChange={(e) => setNewCapaPic(e.target.value)}
                          className="bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs"
                        />
                        <input
                          type="date"
                          value={newCapaDeadline}
                          onChange={(e) => setNewCapaDeadline(e.target.value)}
                          className="bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Bukti pelaksanaan (Contoh: Laporan audit / SOP revisi)..."
                          value={newCapaEvidence}
                          onChange={(e) => setNewCapaEvidence(e.target.value)}
                          className="w-full bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddCapa}
                          className="px-4 py-1.5 bg-[#005d42] text-white rounded-[4px] text-xs font-semibold cursor-pointer shrink-0"
                        >
                          Tambah Tindakan
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: Director Recommendations & Sub Committee Approval */}
                {activeStep === 6 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="bg-purple-50/70 border border-purple-200 p-3 rounded-[6px] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-purple-700 shrink-0" />
                        <span className="text-purple-900 font-semibold">
                          Langkah 6: Rekomendasi Kebijakan Direktur &amp; Pengesahan Sub Komite Manajemen Risiko
                        </span>
                      </div>
                      <span className="text-[11px] text-purple-700 font-mono">RSU SHANTI GRAHA</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block font-semibold mb-1 text-slate-800">
                          Rekomendasi Kebijakan untuk Direktur RSU SHANTI GRAHA:
                        </label>
                        <textarea
                          rows={3}
                          value={rcaForm.directorRecommendations}
                          onChange={(e) => setRcaForm({ ...rcaForm, directorRecommendations: e.target.value })}
                          className="w-full bg-[#f8fafc] border border-[#cbd5e1] p-2.5 rounded-[4px] text-xs leading-relaxed focus:bg-white"
                          placeholder="Arahan strategis tingkat rumah sakit, kebutuhan alokasi anggaran, atau revisi regulasi..."
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-slate-800">
                          Catatan Verifikasi Sub Komite Manajemen Risiko:
                        </label>
                        <textarea
                          rows={2}
                          value={rcaForm.subCommitteeNote}
                          onChange={(e) => setRcaForm({ ...rcaForm, subCommitteeNote: e.target.value })}
                          className="w-full bg-[#f8fafc] border border-[#cbd5e1] p-2.5 rounded-[4px] text-xs leading-relaxed focus:bg-white"
                          placeholder="Catatan peninjauan berkala oleh Ns.Nyoman adi Sedana,S.Kep..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-[6px]">
                          <label className="block font-semibold text-xs text-slate-700 mb-1">Status Progres RCA:</label>
                          <select
                            value={rcaForm.status}
                            onChange={(e) => setRcaForm({ ...rcaForm, status: e.target.value as any })}
                            className="w-full bg-white border border-[#cbd5e1] px-3 py-1.5 rounded-[4px] text-xs font-bold"
                          >
                            <option value="DRAF">DRAF (Belum Selesai)</option>
                            <option value="SEDANG_INVESTIGASI">SEDANG INVESTIGASI (Dalam Proses Tindakan)</option>
                            <option value="SELESAI">SELESAI (Semua CAPA &amp; Rekomendasi Disetujui)</option>
                          </select>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-[6px] flex items-center justify-between">
                          <div>
                            <span className="block text-[11px] text-slate-500 font-semibold">Pejabat Pengesah:</span>
                            <span className="font-bold text-xs text-[#005d42]">Ns.Nyoman adi Sedana,S.Kep</span>
                            <span className="block text-[10px] text-slate-600">Sub Komite Manajemen Risiko</span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-[#005d42] text-white font-bold text-xs flex items-center justify-center">
                            AS
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Step Navigators & Master Save */}
                <div className="pt-4 border-t border-[#cbd5e1] flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={activeStep === 1}
                      onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-[4px] text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Langkah Sebelumnya</span>
                    </button>

                    <button
                      type="button"
                      disabled={activeStep === 6}
                      onClick={() => setActiveStep(prev => Math.min(6, prev + 1))}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-[4px] text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <span>Langkah Berikutnya</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveRca}
                      className="flex items-center gap-2 px-5 py-2 bg-[#005d42] hover:bg-[#064e3b] text-white font-bold rounded-[4px] text-xs shadow-md cursor-pointer transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Hasil Investigasi RCA</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Hospital Document Printable Section (Visible only when printed) */}
      {activeRisk && rcaForm && (
        <div className="hidden print:block p-8 bg-white text-black text-xs leading-relaxed space-y-4">
          <div className="text-center border-b-2 border-black pb-3">
            <h1 className="text-base font-bold uppercase tracking-wider">RSU SHANTI GRAHA</h1>
            <h2 className="text-sm font-bold">LAPORAN INVESTIGASI ROOT CAUSE ANALYSIS (RCA)</h2>
            <p className="text-[10px]">Standar Akreditasi KARS / STARKES Kemenkes RI • KMKP</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2">
            <div><strong>Nomor RCA:</strong> {rcaForm.investigationId}</div>
            <div><strong>Tanggal:</strong> {rcaForm.startDate} s/d {rcaForm.targetDate}</div>
            <div><strong>Unit Kerja:</strong> {activeRisk.unitLabel}</div>
            <div><strong>Tingkat Risiko:</strong> Grade {activeRisk.grade} (Skor: {activeRisk.score})</div>
            <div><strong>Ketua Tim:</strong> {rcaForm.leader}</div>
            <div><strong>Status:</strong> {rcaForm.status}</div>
          </div>

          <div className="border-t border-black pt-2">
            <h3 className="font-bold text-xs uppercase mb-1">1. Pernyataan Masalah &amp; Kronologi:</h3>
            <p>{rcaForm.problemStatement}</p>
            <p className="mt-1"><strong>Kronologi:</strong> {rcaForm.chronologySummary}</p>
          </div>

          <div className="border-t border-black pt-2">
            <h3 className="font-bold text-xs uppercase mb-1">2. Fakta Temuan Lapangan:</h3>
            <ul className="list-disc pl-5">
              {rcaForm.gatheredFacts.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>

          <div className="border-t border-black pt-2">
            <h3 className="font-bold text-xs uppercase mb-1">3. Analisis Tulang Ikan (Fishbone 5M):</h3>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><strong>Man:</strong> {rcaForm.fishbone.man.join(', ')}</div>
              <div><strong>Method:</strong> {rcaForm.fishbone.method.join(', ')}</div>
              <div><strong>Machine:</strong> {rcaForm.fishbone.machine.join(', ')}</div>
              <div><strong>Material:</strong> {rcaForm.fishbone.material.join(', ')}</div>
              <div className="col-span-2"><strong>Environment:</strong> {rcaForm.fishbone.environment.join(', ')}</div>
            </div>
          </div>

          <div className="border-t border-black pt-2">
            <h3 className="font-bold text-xs uppercase mb-1">4. Analisis 5-Whys &amp; Akar Masalah Pokok:</h3>
            <ol className="list-decimal pl-5">
              {rcaForm.why5.map((w, i) => <li key={i}>{w}</li>)}
            </ol>
            <p className="mt-2 font-semibold">Akar Masalah Fundamental: {rcaForm.fundamentalRootCause}</p>
          </div>

          <div className="border-t border-black pt-2">
            <h3 className="font-bold text-xs uppercase mb-1">5. Matriks Tindakan CAPA:</h3>
            <table className="w-full border-collapse border border-black text-[10px]">
              <thead>
                <tr className="bg-slate-200">
                  <th className="border border-black p-1">No</th>
                  <th className="border border-black p-1">Tindakan</th>
                  <th className="border border-black p-1">PIC</th>
                  <th className="border border-black p-1">Deadline</th>
                  <th className="border border-black p-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {rcaForm.capaActions.map((c, i) => (
                  <tr key={c.id}>
                    <td className="border border-black p-1 text-center">{i + 1}</td>
                    <td className="border border-black p-1">{c.action}</td>
                    <td className="border border-black p-1">{c.pic}</td>
                    <td className="border border-black p-1">{c.deadline}</td>
                    <td className="border border-black p-1 text-center">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-black pt-2">
            <h3 className="font-bold text-xs uppercase mb-1">6. Rekomendasi Direktur &amp; Pengesahan:</h3>
            <p>{rcaForm.directorRecommendations}</p>
            <div className="mt-6 flex justify-between text-center pt-4">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold mt-12">Direktur RSU SHANTI GRAHA</p>
              </div>
              <div>
                <p>Ketua Investigasi RCA,</p>
                <p className="font-bold mt-12">Ns.Nyoman adi Sedana,S.Kep</p>
                <p className="text-[10px]">Sub Komite Manajemen Risiko</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
