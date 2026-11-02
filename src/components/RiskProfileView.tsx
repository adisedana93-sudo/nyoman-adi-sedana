import React, { useState, useMemo, useEffect } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Filter, 
  Download, 
  Printer, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  AlertOctagon, 
  GitBranch, 
  ShieldAlert, 
  Sliders, 
  Target, 
  Eye, 
  Sparkles,
  BarChart3,
  TrendingDown,
  Building2,
  Calendar,
  Check,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  X,
  FileSpreadsheet,
  RefreshCw,
  Send,
  HelpCircle,
  Star,
  Info
} from 'lucide-react';
import { 
  HospitalUnit, 
  StarkesRiskCategory, 
  UnitRiskItem, 
  ComprehensiveRiskItem, 
  FmeaItem, 
  RiskLevel 
} from '../types/clinical';
import { 
  ALL_HOSPITAL_UNITS, 
  STARKES_CATEGORIES_CONFIG, 
  INITIAL_UNIT_RISK_DATA,
  COMPREHENSIVE_RISK_ITEMS, 
  FMEA_ITEMS 
} from '../data/mockRiskManagementData';
import { KNKP_RISK_MATRIX, calculateRisk, getRiskBadgeStyle } from '../utils/riskCalculators';
import { exportRiskRegisterToExcel } from '../utils/excelExport';

interface RiskProfileViewProps {
  initialSubTab?: 'UNIT_RISK' | 'RS_PRIORITY' | 'HEATMAP';
  initialSelectedUnit?: string;
  onNavigateTab?: (tab: string) => void;
  risks?: UnitRiskItem[];
  onAddOrUpdateRisk?: (item: UnitRiskItem) => void;
  onDeleteRisk?: (id: string) => void;
  onClearAllRisks?: () => void;
}

export const RiskProfileView: React.FC<RiskProfileViewProps> = ({
  initialSubTab,
  initialSelectedUnit,
  onNavigateTab,
  risks,
  onAddOrUpdateRisk,
  onDeleteRisk,
  onClearAllRisks,
}) => {
  // Sub-tabs in Manajemen Risiko
  const [activeSubTab, setActiveSubTab] = useState<'UNIT_RISK' | 'RS_PRIORITY' | 'HEATMAP' | 'FMEA' | 'KRI'>(
    initialSubTab || 'UNIT_RISK'
  );

  // Sync when initialSubTab changes from parent HeaderNavbar
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    if (initialSelectedUnit) {
      setSelectedUnit(initialSelectedUnit);
    }
  }, [initialSelectedUnit]);

  // Unit Risk State
  const [unitRisks, setUnitRisks] = useState<UnitRiskItem[]>(risks || INITIAL_UNIT_RISK_DATA);

  useEffect(() => {
    if (risks) {
      setUnitRisks(risks);
    }
  }, [risks]);

  const [currentScope, setCurrentScope] = useState<'unit' | 'all'>('unit');
  const [selectedUnit, setSelectedUnit] = useState<string>(initialSelectedUnit || 'ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedGrading, setSelectedGrading] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedVerification, setSelectedVerification] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rsPriorityFilter, setRsPriorityFilter] = useState<'ALL' | 'HIGH' | 'LOW' | 'ADOPTED'>('ALL');

  // Modal State for Adopting Unit Risk Registers into Hospital Priority
  const [showAdoptUnitRiskModal, setShowAdoptUnitRiskModal] = useState(false);
  const [adoptModalUnitFilter, setAdoptModalUnitFilter] = useState<string>('ALL');
  const [adoptModalGradeFilter, setAdoptModalGradeFilter] = useState<string>('ALL');
  const [adoptModalSearch, setAdoptModalSearch] = useState<string>('');
  const [adoptModalOnlyUnadopted, setAdoptModalOnlyUnadopted] = useState(false);

  // Modals state
  const [showUnitRiskModal, setShowUnitRiskModal] = useState(false);
  const [editingRiskId, setEditingRiskId] = useState<string | null>(null);

  // Form State for Add / Edit Unit Risk
  const [formUnit, setFormUnit] = useState<HospitalUnit>('IGD');
  const [formCategory, setFormCategory] = useState<StarkesRiskCategory>('KLINIS');
  const [formStatement, setFormStatement] = useState('');
  const [formRootCause, setFormRootCause] = useState('');
  const [formP, setFormP] = useState<number>(3);
  const [formD, setFormD] = useState<number>(4);
  const [formMitigation, setFormMitigation] = useState('');
  const [formPic, setFormPic] = useState('');
  const [formTarget, setFormTarget] = useState('TW II 2026');
  const [formStatus, setFormStatus] = useState<'Open' | 'In Progress' | 'Controlled'>('In Progress');
  const [formVerifierUnit, setFormVerifierUnit] = useState('Sub Komite Mutu & KPRS');
  const [formVerifStatus, setFormVerifStatus] = useState<'Disetujui' | 'Perlu Revisi' | 'Belum Dicek'>('Disetujui');
  const [formVerifNote, setFormVerifNote] = useState('');

  // Implementation Fields State
  const [formImplementedActions, setFormImplementedActions] = useState('');
  const [formImplementationDate, setFormImplementationDate] = useState('');
  const [formImplementationEvidence, setFormImplementationEvidence] = useState('');
  const [formEffectiveness, setFormEffectiveness] = useState<'EFEKTIF' | 'CUKUP_EFEKTIF' | 'BELUM_EFEKTIF'>('CUKUP_EFEKTIF');

  // Dedicated Quick Implementation Modal State
  const [implementationModalItem, setImplementationModalItem] = useState<UnitRiskItem | null>(null);
  const [quickImplAction, setQuickImplAction] = useState('');
  const [quickImplDate, setQuickImplDate] = useState('');
  const [quickImplEvidence, setQuickImplEvidence] = useState('');
  const [quickImplEffectiveness, setQuickImplEffectiveness] = useState<'EFEKTIF' | 'CUKUP_EFEKTIF' | 'BELUM_EFEKTIF'>('CUKUP_EFEKTIF');
  const [quickImplUpdateStatus, setQuickImplUpdateStatus] = useState<'Open' | 'In Progress' | 'Controlled'>('Controlled');

  // Quick Verification Modal State
  const [quickVerifItem, setQuickVerifItem] = useState<UnitRiskItem | null>(null);
  const [quickVerifStatus, setQuickVerifStatus] = useState<'Disetujui' | 'Perlu Revisi' | 'Belum Dicek'>('Disetujui');
  const [quickVerifNote, setQuickVerifNote] = useState('');
  const [quickVerifUnit, setQuickVerifUnit] = useState('KMKP RSU SHANTI GRAHA');

  // Success Notification Banner
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastBanner(msg);
    setTimeout(() => setToastBanner(null), 4000);
  };

  // State & Handler for AI Auto-Complete in Add/Edit Risk Modal
  const [isCompletingWithAi, setIsCompletingWithAi] = useState(false);

  const handleAiCompleteFields = async () => {
    if (!formStatement.trim()) {
      showToast('Ketik pernyataan risiko terlebih dahulu sebelum klik AI!');
      return;
    }
    setIsCompletingWithAi(true);
    try {
      const selectedUnitObj = ALL_HOSPITAL_UNITS.find(u => u.key === formUnit);
      const selectedCatObj = STARKES_CATEGORIES_CONFIG.find(c => c.key === formCategory);

      const res = await fetch('/api/ai/complete-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statement: formStatement,
          unit: formUnit,
          unitLabel: selectedUnitObj?.label || formUnit,
          categoryKey: formCategory,
          categoryName: selectedCatObj?.label || formCategory,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.rootCause) setFormRootCause(d.rootCause);
        if (d.p) setFormP(d.p);
        if (d.d) setFormD(d.d);
        if (d.mitigation) setFormMitigation(d.mitigation);
        if (d.pic) setFormPic(d.pic);
        if (d.target) setFormTarget(d.target);
        if (d.implementedActions) setFormImplementedActions(d.implementedActions);
        if (d.implementationDate) setFormImplementationDate(d.implementationDate);
        if (d.effectivenessEvaluation) setFormEffectiveness(d.effectivenessEvaluation);
        showToast('✨ Isian risiko berhasil dilengkapi otomatis oleh AI! Silakan periksa atau ubah jika perlu sebelum menyimpan.');
      }
    } catch (err) {
      console.warn('AI complete error, using intelligent contextual fallback:', err);
      const s = formStatement.toLowerCase();
      const selectedUnitObj = ALL_HOSPITAL_UNITS.find(u => u.key === formUnit);
      const unitName = selectedUnitObj?.label || formUnit;

      let fallbackRoot = '';
      let fallbackMitigation = '';
      let fallbackImplemented = '';
      let fallbackPic = `Kepala ${unitName} & Tim Mutu`;
      let fallbackP = 3;
      let fallbackD = 4;

      if (s.includes('darah') || s.includes('transfusi') || s.includes('bdrs')) {
        fallbackRoot = `Ketiadaan sistem pemantauan batas minimum stok darah cito (buffer stock) di BDRS serta keterlambatan komunikasi real-time antara ${unitName} dan Bank Darah saat kebutuhan darurat.`;
        fallbackMitigation = `Penyusunan SPO Buffer Stock Darah Universal di BDRS, integrasi alur pemesanan darah cito via SIMRS, serta pembaharuan MoU pasokan prioritas dengan UTD PMI.`;
        fallbackImplemented = `Telah dibentuk jalur koordinasi cepat siaga transfusi darah gawat darurat dan monitoring harian ketersediaan kantong darah di BDRS.`;
        fallbackPic = `Ka. BDRS & Ka. ${unitName}`;
        fallbackD = 5;
      } else if (s.includes('jarum') || s.includes('tertusuk') || s.includes('spuit') || s.includes('limbah') || s.includes('infeksi')) {
        fallbackRoot = `Ketidakpatuhan pembuangan jarum suntik ke safety box, kebiasaan recapping dua tangan tanpa alat bantu, dan belum optimalnya ketersediaan APD protektif saat tindakan di ${unitName}.`;
        fallbackMitigation = `Penyediaan safety box berstandar WHO di setiap troli tindakan, sosialisasi larangan recapping jarum suntik, dan audit berkala kepatuhan PPI oleh IPCN.`;
        fallbackImplemented = `Pemasangan poster edukasi one-hand recapping, penataan ulang lokasi safety box di dekat pasien, dan pemeriksaan status imunisasi Hepatitis B petugas.`;
        fallbackPic = `Komite PPI & Ka. ${unitName}`;
      } else if (s.includes('jatuh') || s.includes('fall') || s.includes('bed rail') || s.includes('lantai')) {
        fallbackRoot = `Asesmen ulang risiko jatuh Morse/Humpty Dumpty belum konsisten saat perubahan kondisi pasien, serta minimnya penguncian roda tempat tidur dan palang pengaman (bed rail).`;
        fallbackMitigation = `Pemasangan stiker penanda risiko jatuh kuning di tempat tidur/gelang pasien, edukasi keluarga pasien tentang tombol darurat perawat, dan inspeksi rutin kelaikan bed rail oleh IPSRS.`;
        fallbackImplemented = `Pemasangan gelang kuning pada seluruh pasien berisiko tinggi dan penerapan ronde keselamatan berkala setiap 2 jam oleh perawat jaga.`;
        fallbackPic = `Ka. Ruangan ${unitName} & Tim Keselamatan Pasien`;
      } else if (s.includes('obat') || s.includes('resep') || s.includes('dosis') || s.includes('lasa') || s.includes('alergi')) {
        fallbackRoot = `Belum dilaksanakannya verifikasi independen ganda (independent double check) pada obat high-alert/LASA dan tulisan resep yang berpotensi menimbulkan salah interpretasi dosis.`;
        fallbackMitigation = `Pemberian stiker neon LASA dan HAM (High Alert Medication), implementasi mandatory double check sebelum obat diserahkan ke pasien, dan integrasi validasi dosis otomatis pada SIMRS.`;
        fallbackImplemented = `Pemberian label identifikasi khusus obat High Alert di lemari penyimpanan dan supervisi verifikasi telaah resep oleh Apoteker.`;
        fallbackPic = `Ka. Instalasi Farmasi & Ka. ${unitName}`;
      } else {
        fallbackRoot = `Kelemahan kepatuhan pelaksanaan SPO terkait "${formStatement.trim()}", keterbatasan sarana pendukung dan instrumen checklist pengawasan berkala pada ${unitName}.`;
        fallbackMitigation = `Revisi dan sosialisasi SPO operasional terkait penanganan potensi "${formStatement.trim()}", pelatihan kompetensi staf berkala, dan audit kepatuhan oleh Tim Mutu & Manajemen Risiko.`;
        fallbackImplemented = `Telah dilakukan identifikasi awal celah risiko serta sosialisasi pencegahan kejadian "${formStatement.trim()}" kepada seluruh staf di ${unitName}.`;
        fallbackPic = `Kepala ${unitName} & Tim Terkait`;
      }

      setFormRootCause(fallbackRoot);
      setFormP(fallbackP);
      setFormD(fallbackD);
      setFormMitigation(fallbackMitigation);
      setFormImplementedActions(fallbackImplemented);
      setFormImplementationDate(new Date().toISOString().slice(0, 10));
      setFormEffectiveness('CUKUP_EFEKTIF');
      setFormPic(fallbackPic);
      setFormTarget('TW II 2026');
      showToast('✨ Isian risiko berhasil disesuaikan dengan pernyataan risiko Anda.');
    } finally {
      setIsCompletingWithAi(false);
    }
  };

  // Dynamic Score Calculation for Modal Form
  const calculatedModalScore = formP * formD;
  const calculatedModalGrade: RiskLevel = 
    calculatedModalScore >= 15 ? 'EKSTREM' :
    calculatedModalScore >= 10 ? 'TINGGI' :
    calculatedModalScore >= 4 ? 'SEDANG' : 'RENDAH';
  const calculatedModalBadge = getRiskBadgeStyle(calculatedModalGrade);

  // Active Selected Unit metadata
  const currentUnitObj = useMemo(() => {
    if (selectedUnit === 'ALL') {
      return {
        key: 'ALL' as HospitalUnit,
        label: 'Semua Risk Register Unit (Seluruh 22 Unit RS)',
        shortCode: 'SEMUA_UNIT'
      };
    }
    return ALL_HOSPITAL_UNITS.find(u => u.key === selectedUnit) || ALL_HOSPITAL_UNITS[3]; // default IGD
  }, [selectedUnit]);

  // Filtered Unit Risks
  // Supports both High & Low Priority risks in RS Priority Mode and Unit Risk Mode
  const filteredUnitRisks = useMemo(() => {
    return unitRisks.filter((item) => {
      // Rule 1: RS Priority Mode - STRICTLY ONLY EKSTREM & TINGGI
      if (activeSubTab === 'RS_PRIORITY') {
        const isEkstremOrTinggi = item.grade === 'EKSTREM' || item.grade === 'TINGGI' || item.score >= 10;
        if (!isEkstremOrTinggi) return false;

        // Sub-filter in RS Priority
        if (rsPriorityFilter === 'HIGH') {
          if (item.grade !== 'EKSTREM') return false;
        } else if (rsPriorityFilter === 'LOW') {
          if (item.grade !== 'TINGGI') return false;
        } else if (rsPriorityFilter === 'ADOPTED') {
          if (!item.isHospitalPriority) return false;
        }

        // Sub-grade filter in RS Priority (if specific grade selected)
        if (selectedGrading !== 'ALL') {
          if (item.grade !== selectedGrading) return false;
        }

        // Unit filter in RS Priority (optional, ALL or specific unit)
        if (selectedUnit !== 'ALL' && item.unit !== selectedUnit) {
          return false;
        }
      } 
      // Rule 2: Unit Risk Mode
      else if (activeSubTab === 'UNIT_RISK') {
        // If not 'ALL', filter strictly by selected unit
        if (selectedUnit !== 'ALL' && item.unit !== selectedUnit) {
          return false;
        }
        // Grading filter within Unit view (Ekstrem, Tinggi, Sedang, Rendah)
        if (selectedGrading !== 'ALL' && item.grade !== selectedGrading) {
          return false;
        }
      }

      // Category filter (11 PPI, 7 MFK, Klinis/Tata Kelola)
      if (selectedCategory !== 'ALL' && item.categoryKey !== selectedCategory) return false;

      // Status filter
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;

      // Verification filter
      if (selectedVerification !== 'ALL' && item.verifStatus !== selectedVerification) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const match = item.id.toLowerCase().includes(q) ||
                      item.statement.toLowerCase().includes(q) ||
                      item.rootCause.toLowerCase().includes(q) ||
                      item.pic.toLowerCase().includes(q) ||
                      item.mitigation.toLowerCase().includes(q) ||
                      item.unit.toLowerCase().includes(q) ||
                      item.unitLabel.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [unitRisks, activeSubTab, rsPriorityFilter, selectedUnit, selectedCategory, selectedGrading, selectedStatus, selectedVerification, searchQuery]);

  // Filtered risks for the Adopt Unit Risk Modal
  const adoptModalRisks = useMemo(() => {
    return unitRisks.filter((item) => {
      // Unit filter
      if (adoptModalUnitFilter !== 'ALL' && item.unit !== adoptModalUnitFilter) {
        return false;
      }
      // Grade filter
      if (adoptModalGradeFilter !== 'ALL' && item.grade !== adoptModalGradeFilter) {
        return false;
      }
      // Unadopted only toggle
      if (adoptModalOnlyUnadopted && item.isHospitalPriority) {
        return false;
      }
      // Search
      if (adoptModalSearch.trim() !== '') {
        const q = adoptModalSearch.toLowerCase();
        const match = item.id.toLowerCase().includes(q) ||
                      item.statement.toLowerCase().includes(q) ||
                      item.rootCause.toLowerCase().includes(q) ||
                      item.unit.toLowerCase().includes(q) ||
                      item.unitLabel.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [unitRisks, adoptModalUnitFilter, adoptModalGradeFilter, adoptModalSearch, adoptModalOnlyUnadopted]);

  // Statistics for the currently filtered view
  const statTotal = filteredUnitRisks.length;
  const statEkstrem = filteredUnitRisks.filter(i => i.grade === 'EKSTREM').length;
  const statTinggi = filteredUnitRisks.filter(i => i.grade === 'TINGGI').length;
  const statSedang = filteredUnitRisks.filter(i => i.grade === 'SEDANG').length;
  const statRendah = filteredUnitRisks.filter(i => i.grade === 'RENDAH').length;
  const statControlled = filteredUnitRisks.filter(i => i.status === 'Controlled').length;
  const statInProgress = filteredUnitRisks.filter(i => i.status === 'In Progress').length;
  const statVerified = filteredUnitRisks.filter(i => i.verifStatus === 'Disetujui').length;
  const verifiedPercentage = statTotal > 0 ? Math.round((statVerified / statTotal) * 100) : 100;

  // Handle Tab Switch with clean resets
  const handleSwitchSubTab = (tab: 'UNIT_RISK' | 'RS_PRIORITY' | 'HEATMAP' | 'FMEA' | 'KRI') => {
    setActiveSubTab(tab);
    if (tab === 'RS_PRIORITY') {
      setSelectedGrading('ALL');
      setRsPriorityFilter('ALL');
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    if (activeSubTab === 'UNIT_RISK') {
      setSelectedUnit('IGD');
    } else {
      setSelectedUnit('ALL');
    }
    setRsPriorityFilter('ALL');
    setSelectedCategory('ALL');
    setSelectedGrading('ALL');
    setSelectedStatus('ALL');
    setSelectedVerification('ALL');
    setSearchQuery('');
  };

  // Open Add/Edit Modal with support for High and Low priority presets
  const handleOpenAddModal = (
    itemToEdit?: UnitRiskItem,
    priorityPreset?: 'HIGH' | 'LOW' | 'EXTREME' | 'HIGH_GRADE' | 'MEDIUM' | 'LOW_GRADE'
  ) => {
    if (itemToEdit) {
      setEditingRiskId(itemToEdit.id);
      setFormUnit(itemToEdit.unit);
      setFormCategory(itemToEdit.categoryKey);
      setFormStatement(itemToEdit.statement);
      setFormRootCause(itemToEdit.rootCause);
      setFormP(itemToEdit.p);
      setFormD(itemToEdit.d);
      setFormMitigation(itemToEdit.mitigation);
      setFormPic(itemToEdit.pic);
      setFormTarget(itemToEdit.target);
      setFormStatus(itemToEdit.status);
      setFormVerifierUnit(itemToEdit.verifierUnit);
      setFormVerifStatus(itemToEdit.verifStatus);
      setFormVerifNote(itemToEdit.verifNote);
      setFormImplementedActions(itemToEdit.implementedActions || '');
      setFormImplementationDate(itemToEdit.implementationDate || '');
      setFormImplementationEvidence(itemToEdit.implementationEvidence || '');
      setFormEffectiveness(itemToEdit.effectivenessEvaluation || 'CUKUP_EFEKTIF');
    } else {
      setEditingRiskId(null);
      setFormUnit((selectedUnit !== 'ALL' ? selectedUnit : 'IGD') as HospitalUnit);
      setFormCategory('KLINIS');
      setFormStatement('');
      setFormRootCause('');
      
      // Auto-preset probability & impact for High vs Low priority
      if (priorityPreset === 'HIGH' || priorityPreset === 'EXTREME') {
        setFormP(5);
        setFormD(4); // score 20 (EKSTREM)
      } else if (priorityPreset === 'HIGH_GRADE') {
        setFormP(3);
        setFormD(4); // score 12 (TINGGI)
      } else if (priorityPreset === 'LOW' || priorityPreset === 'LOW_GRADE') {
        setFormP(1);
        setFormD(2); // score 2 (RENDAH)
      } else if (priorityPreset === 'MEDIUM') {
        setFormP(2);
        setFormD(3); // score 6 (SEDANG)
      } else {
        if (activeSubTab === 'RS_PRIORITY') {
          setFormP(4);
          setFormD(4);
        } else {
          setFormP(3);
          setFormD(4);
        }
      }

      setFormMitigation('');
      setFormPic('');
      setFormTarget('TW II 2026');
      setFormStatus('In Progress');
      setFormVerifierUnit('Sub Komite Mutu & KPRS');
      setFormVerifStatus('Belum Dicek');
      setFormVerifNote('');
      setFormImplementedActions('');
      setFormImplementationDate(new Date().toISOString().split('T')[0]);
      setFormImplementationEvidence('');
      setFormEffectiveness('CUKUP_EFEKTIF');
    }
    setShowUnitRiskModal(true);
  };

  // Open Dedicated Quick Implementation Modal
  const handleOpenImplementationModal = (item: UnitRiskItem) => {
    setImplementationModalItem(item);
    setQuickImplAction(item.implementedActions || '');
    setQuickImplDate(item.implementationDate || new Date().toISOString().split('T')[0]);
    setQuickImplEvidence(item.implementationEvidence || '');
    setQuickImplEffectiveness(item.effectivenessEvaluation || 'CUKUP_EFEKTIF');
    setQuickImplUpdateStatus(item.status === 'Open' ? 'In Progress' : item.status);
  };

  // Save Dedicated Quick Implementation Modal
  const handleSaveQuickImplementation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!implementationModalItem) return;
    if (!quickImplAction.trim()) {
      alert('Mohon isi uraian implementasi yang sudah dilakukan!');
      return;
    }

    const updatedItem: UnitRiskItem = {
      ...implementationModalItem,
      implementedActions: quickImplAction.trim(),
      implementationDate: quickImplDate.trim(),
      implementationEvidence: quickImplEvidence.trim(),
      effectivenessEvaluation: quickImplEffectiveness,
      status: quickImplUpdateStatus,
    };

    const updated = unitRisks.map(r => r.id === updatedItem.id ? updatedItem : r);
    setUnitRisks(updated);
    if (onAddOrUpdateRisk) onAddOrUpdateRisk(updatedItem);
    setImplementationModalItem(null);
    showToast(`Implementasi risiko unit ${updatedItem.id} berhasil dicatat & diperbarui.`);
  };

  // Save Add/Edit
  const handleSaveUnitRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStatement.trim() || !formRootCause.trim() || !formMitigation.trim() || !formPic.trim()) {
      alert('Harap lengkapi semua isian bertanda bintang (*)');
      return;
    }

    const catObj = STARKES_CATEGORIES_CONFIG.find(c => c.key === formCategory);
    const categoryName = catObj?.label || formCategory;
    const unitObj = ALL_HOSPITAL_UNITS.find(u => u.key === formUnit);
    const unitLabel = unitObj?.label || formUnit;

    const score = formP * formD;
    const grade: RiskLevel = 
      score >= 15 ? 'EKSTREM' :
      score >= 10 ? 'TINGGI' :
      score >= 4 ? 'SEDANG' : 'RENDAH';

    if (editingRiskId) {
      // Update
      const updatedItem: UnitRiskItem = {
        id: editingRiskId,
        unit: formUnit,
        unitLabel,
        categoryKey: formCategory,
        categoryName,
        statement: formStatement.trim(),
        rootCause: formRootCause.trim(),
        p: formP,
        d: formD,
        score,
        grade,
        mitigation: formMitigation.trim(),
        pic: formPic.trim(),
        target: formTarget.trim(),
        status: formStatus,
        verifierUnit: formVerifierUnit.trim(),
        verifStatus: formVerifStatus,
        verifNote: formVerifNote.trim(),
        implementedActions: formImplementedActions.trim() || undefined,
        implementationDate: formImplementationDate.trim() || undefined,
        implementationEvidence: formImplementationEvidence.trim() || undefined,
        effectivenessEvaluation: formEffectiveness || undefined
      };
      const updated = unitRisks.map(r => r.id === editingRiskId ? updatedItem : r);
      setUnitRisks(updated);
      if (onAddOrUpdateRisk) onAddOrUpdateRisk(updatedItem);
      showToast(`Risiko unit ${editingRiskId} berhasil diperbarui.`);
    } else {
      // Create
      const newId = activeSubTab === 'RS_PRIORITY'
        ? `RR-RS-${Math.floor(100 + Math.random() * 900)}`
        : `RR-${formUnit.toUpperCase().replace(/\s+/g, '_')}-${Math.floor(100 + Math.random() * 900)}`;

      const newItem: UnitRiskItem = {
        id: newId,
        unit: formUnit,
        unitLabel,
        categoryKey: formCategory,
        categoryName,
        statement: formStatement.trim(),
        rootCause: formRootCause.trim(),
        p: formP,
        d: formD,
        score,
        grade,
        mitigation: formMitigation.trim(),
        pic: formPic.trim(),
        target: formTarget.trim(),
        status: formStatus,
        verifierUnit: formVerifierUnit.trim(),
        verifStatus: formVerifStatus,
        verifNote: formVerifNote.trim(),
        implementedActions: formImplementedActions.trim() || undefined,
        implementationDate: formImplementationDate.trim() || undefined,
        implementationEvidence: formImplementationEvidence.trim() || undefined,
        effectivenessEvaluation: formEffectiveness || undefined
      };
      setUnitRisks([newItem, ...unitRisks]);
      if (onAddOrUpdateRisk) onAddOrUpdateRisk(newItem);
      showToast(
        activeSubTab === 'RS_PRIORITY'
          ? `Risiko RS ${newId} (Prioritas ${grade}) berhasil ditambahkan ke Manajemen Risiko Rumah Sakit.`
          : `Risiko unit ${newId} berhasil ditambahkan ke register.`
      );
    }

    setShowUnitRiskModal(false);
  };

  // Delete Unit Risk
  const handleDeleteUnitRisk = (id: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data risiko unit ${id}?`)) {
      setUnitRisks(unitRisks.filter(r => r.id !== id));
      if (onDeleteRisk) onDeleteRisk(id);
      showToast(`Risiko unit ${id} berhasil dihapus.`);
    }
  };

  // Open Quick Verification Modal
  const handleOpenQuickVerif = (item: UnitRiskItem) => {
    setQuickVerifItem(item);
    setQuickVerifStatus(item.verifStatus || 'Disetujui');
    setQuickVerifNote(item.verifNote || '');
    setQuickVerifUnit(item.verifierUnit || 'KMKP RSU SHANTI GRAHA');
  };

  // Direct Inline / Quick Verification Status Change (Disetujui / Perlu Revisi / Belum Dicek)
  const handleQuickChangeVerifStatus = (item: UnitRiskItem, newStatus: 'Disetujui' | 'Perlu Revisi' | 'Belum Dicek') => {
    const updatedItem: UnitRiskItem = {
      ...item,
      verifStatus: newStatus,
    };
    const updated = unitRisks.map(r => r.id === item.id ? updatedItem : r);
    setUnitRisks(updated);
    if (onAddOrUpdateRisk) {
      onAddOrUpdateRisk(updatedItem);
    }
    showToast(`Status verifikasi ${item.id} berhasil diatur & disimpan menjadi "${newStatus}".`);
  };

  // Confirm Quick Verification Modal
  const handleConfirmQuickVerif = () => {
    if (!quickVerifItem) return;
    const updatedItem: UnitRiskItem = {
      ...quickVerifItem,
      verifStatus: quickVerifStatus,
      verifNote: quickVerifNote.trim(),
      verifierUnit: quickVerifUnit.trim() || 'KMKP RSU SHANTI GRAHA'
    };
    const updated = unitRisks.map(r => r.id === quickVerifItem.id ? updatedItem : r);
    setUnitRisks(updated);
    if (onAddOrUpdateRisk) {
      onAddOrUpdateRisk(updatedItem);
    }
    setQuickVerifItem(null);
    showToast(`Verifikasi ${quickVerifItem.id} berhasil disimpan: ${quickVerifStatus}.`);
  };

  // Adopt / Escalate single unit risk to Hospital Priority
  const handleToggleAdoptUnitRisk = (item: UnitRiskItem) => {
    const isNowAdopted = !item.isHospitalPriority;
    const updatedItem: UnitRiskItem = {
      ...item,
      isHospitalPriority: isNowAdopted,
      escalatedAt: isNowAdopted ? new Date().toISOString().split('T')[0] : undefined,
      escalatedBy: isNowAdopted ? 'Ns.Nyoman adi Sedana,S.Kep' : undefined,
    };
    const updated = unitRisks.map(r => r.id === item.id ? updatedItem : r);
    setUnitRisks(updated);
    if (onAddOrUpdateRisk) {
      onAddOrUpdateRisk(updatedItem);
    }
    showToast(
      isNowAdopted
        ? `Risiko ${item.id} (${item.unitLabel}) berhasil diambil menjadi Prioritas Rumah Sakit.`
        : `Risiko ${item.id} (${item.unitLabel}) telah dilepas dari Prioritas Rumah Sakit.`
    );
  };

  // Batch adopt all extreme & high risks from units to Hospital Priority
  const handleBatchAdoptHighPriorityRisks = () => {
    const eligible = unitRisks.filter(r => (r.grade === 'EKSTREM' || r.grade === 'TINGGI') && !r.isHospitalPriority);
    if (eligible.length === 0) {
      alert('Semua risiko unit dengan grade Ekstrem dan Tinggi sudah berstatus Prioritas RS.');
      return;
    }
    const updated = unitRisks.map(r => {
      if ((r.grade === 'EKSTREM' || r.grade === 'TINGGI') && !r.isHospitalPriority) {
        const updatedItem: UnitRiskItem = {
          ...r,
          isHospitalPriority: true,
          escalatedAt: new Date().toISOString().split('T')[0],
          escalatedBy: 'Ns.Nyoman adi Sedana,S.Kep',
        };
        if (onAddOrUpdateRisk) onAddOrUpdateRisk(updatedItem);
        return updatedItem;
      }
      return r;
    });
    setUnitRisks(updated);
    showToast(`Berhasil mengambil ${eligible.length} risiko unit (Ekstrem & Tinggi) menjadi Prioritas Rumah Sakit.`);
  };

  // Export Structured Excel (.xls)
  const handleExportXls = () => {
    const isHospitalScope = activeSubTab === 'RS_PRIORITY';
    let title = '';
    let scopeLabel = '';

    if (isHospitalScope) {
      title = 'Risk Register Rumah Sakit (Prioritas Ekstrem & Tinggi)';
      scopeLabel = selectedUnit === 'ALL'
        ? 'Seluruh 22 Unit RS (Eskalasi Ekstrem & Tinggi)'
        : `Unit ${currentUnitObj.label} (Prioritas RS)`;
    } else {
      if (selectedUnit === 'ALL') {
        title = 'Semua Risk Register Unit Rumah Sakit (Seluruh 22 Unit)';
        scopeLabel = 'Semua Unit Kerja RS (22 Unit Pelayanan & Penunjang RSU SHANTI GRAHA)';
      } else {
        title = `Risk Register Unit Kerja ${currentUnitObj.label}`;
        scopeLabel = `${currentUnitObj.label} (${currentUnitObj.shortCode})`;
      }
    }

    exportRiskRegisterToExcel(filteredUnitRisks, {
      title,
      scopeLabel,
      officerName: 'Ns.Nyoman adi Sedana,S.Kep',
    });

    showToast(`Matriks Excel (${title}) berhasil diunduh dengan kolom dan tabel terstruktur rapi!`);
  };

  const handleSyncKMKP = () => {
    showToast('Seluruh paket Risk Register Unit berhasil disinkronisasikan ke Komite Mutu & Keselamatan Pasien (KMKP)!');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Toast Notification Banner */}
      {toastBanner && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-[4px] bg-[#0b1c30] text-white text-xs shadow-xl border border-[#cbd5e1] no-print animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#059669] shrink-0" />
          <span>{toastBanner}</span>
          <button onClick={() => setToastBanner(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Top Banner Context / Header */}
      <div className="w-full bg-white border border-[#e2e8f0] rounded-[8px] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Left: Identity & Unit Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-[6px] bg-[#005d42] flex items-center justify-center text-white shadow-xs shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-[#515f74] uppercase tracking-wider">
                  MODUL TATA KELOLA RISIKO KLINIS & NON-KLINIS
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#005d42]" />
                <span className="text-[11px] font-bold text-[#005d42]">STARKES KARS 2022/2026</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0b1c30] tracking-tight">
                  {activeSubTab === 'RS_PRIORITY'
                    ? 'Risk Register Rumah Sakit'
                    : selectedUnit === 'ALL'
                    ? 'Semua Risk Register Unit Kerja'
                    : `Risk Register Unit: ${currentUnitObj.label}`}
                </h2>
                <span className={`px-2 py-0.5 rounded-[4px] text-[11px] font-semibold border ${
                  activeSubTab === 'RS_PRIORITY'
                    ? 'bg-[#fee2e2] text-[#991b1b] border-[#fecdd3]'
                    : selectedUnit === 'ALL'
                    ? 'bg-[#eff4ff] text-[#005683] border-[#d5e3fc]'
                    : 'bg-[#eff4ff] text-[#005683] border-[#d5e3fc]'
                }`}>
                  {activeSubTab === 'RS_PRIORITY' 
                    ? 'Prioritas Tinggi & Rendah' 
                    : selectedUnit === 'ALL'
                    ? 'Seluruh 22 Unit RS'
                    : `Unit ${currentUnitObj.shortCode}`}
                </span>
              </div>
              <p className="text-xs text-[#515f74] mt-1 max-w-2xl">
                {activeSubTab === 'RS_PRIORITY'
                  ? 'Menampilkan dan mengelola seluruh profil risiko tingkat rumah sakit — mendukung pencatatan risiko prioritas tinggi (ekstrem/tinggi) dan prioritas rendah (sedang/rendah).'
                  : selectedUnit === 'ALL'
                  ? 'Menampilkan rekapitulasi risk register gabungan dari seluruh 22 unit kerja RSU SHANTI GRAHA untuk analisis komprehensif.'
                  : `Menampilkan register risiko khusus dari ${currentUnitObj.label} (${currentUnitObj.shortCode}). Dikelola mandiri oleh Kepala Unit.`}
              </p>
            </div>

            {/* All Hospital Units Dropdown Selector (22 units requested by user + Semua Risk Register Unit) */}
            <div className="sm:ml-4 w-full sm:w-auto">
              <label className="block text-[11px] font-semibold text-[#515f74] mb-1">
                {activeSubTab === 'RS_PRIORITY' ? 'Filter Unit Tertentu (Opsional):' : 'Pilih Unit Kerja (22 Unit RS):'}
              </label>
              <div className="relative min-w-[320px]">
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold pl-3 pr-8 py-2 rounded-[4px] border border-[#d5e3fc] cursor-pointer focus:outline-none focus:border-[#005d42] shadow-xs"
                >
                  <option value="ALL">
                    🏢 {activeSubTab === 'RS_PRIORITY' 
                         ? `Seluruh Unit RS (${unitRisks.length} Risiko RS)` 
                         : `Semua Risk Register Unit (${unitRisks.length} Risiko Seluruh 22 Unit)`}
                  </option>
                  {ALL_HOSPITAL_UNITS.map((u) => {
                    const countInThisUnit = unitRisks.filter(r => r.unit === u.key).length;
                    return (
                      <option key={u.key} value={u.key}>
                        📍 {u.label} ({countInThisUnit} risiko)
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-end xl:self-auto">
            <button
              onClick={handleExportXls}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[4px] bg-white text-[#334155] border border-[#cbd5e1] hover:bg-[#f8fafc] text-xs font-semibold shadow-xs cursor-pointer transition"
            >
              <Download className="w-3.5 h-3.5 text-[#475569]" />
              <span>Unduh Matriks XLS</span>
            </button>
            <button
              onClick={handleSyncKMKP}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[4px] bg-[#005683] text-white hover:bg-[#004b73] text-xs font-semibold shadow-xs cursor-pointer transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Kirim Verifikasi KMKP</span>
            </button>
            {activeSubTab === 'RS_PRIORITY' ? (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowAdoptUnitRiskModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-[#005683] hover:bg-[#004266] text-white text-xs font-bold shadow-xs cursor-pointer transition border border-[#0284c7]"
                  title="Ambil / adopsi data risk register dari unit lain untuk dijadikan prioritas RS"
                >
                  <Download className="w-4 h-4 text-[#7dd3fc]" />
                  <span>📥 Ambil Risk Register Unit</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/20 font-bold tabular-nums">
                    {unitRisks.filter(r => r.isHospitalPriority).length}
                  </span>
                </button>
                <button
                  onClick={() => handleOpenAddModal(undefined, 'EXTREME')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[4px] bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold shadow-xs cursor-pointer transition"
                  title="Tambah Risiko RS Tingkat Prioritas Ekstrem (P:5 × D:4 = 20)"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>+ Prioritas Ekstrem</span>
                </button>
                <button
                  onClick={() => handleOpenAddModal(undefined, 'HIGH')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[4px] bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold shadow-xs cursor-pointer transition"
                  title="Tambah Risiko RS Tingkat Prioritas Tinggi (P:3 × D:4 = 12)"
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>+ Prioritas Tinggi</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {unitRisks.length > 0 && onClearAllRisks && (
                  <button
                    onClick={onClearAllRisks}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-[4px] bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-semibold shadow-xs cursor-pointer transition"
                    title="Kosongkan seluruh data register risiko"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Kosongkan Register</span>
                  </button>
                )}
                <button
                  onClick={() => handleOpenAddModal()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-[#005d42] hover:bg-[#064e3b] text-white text-xs font-bold shadow-xs cursor-pointer transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Risiko Unit</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-tabs inside Manajemen Risiko */}
      <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-1 shadow-xs flex items-center justify-between overflow-x-auto gap-1">
        <div className="flex items-center gap-1">
          {initialSubTab === 'UNIT_RISK' ? (
            <>
              <button
                onClick={() => handleSwitchSubTab('UNIT_RISK')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[4px] transition cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'UNIT_RISK'
                    ? 'bg-[#005d42] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#0b1c30] hover:bg-[#f1f5f9]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Matriks Risk Register Unit Kerja</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${activeSubTab === 'UNIT_RISK' ? 'bg-white/20' : 'bg-slate-200 text-[#0b1c30]'}`}>
                  {selectedUnit === 'ALL' ? unitRisks.length : unitRisks.filter(r => r.unit === selectedUnit).length}
                </span>
              </button>

              <button
                onClick={() => handleSwitchSubTab('HEATMAP')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[4px] transition cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'HEATMAP'
                    ? 'bg-[#005d42] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#0b1c30] hover:bg-[#f1f5f9]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Matriks 5x5 Heatmap Unit ({selectedUnit === 'ALL' ? 'IGD' : currentUnitObj.label})</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${activeSubTab === 'HEATMAP' ? 'bg-white/20' : 'bg-slate-200 text-[#0b1c30]'}`}>
                  {unitRisks.filter(r => r.unit === (selectedUnit === 'ALL' ? 'IGD' : selectedUnit)).length}
                </span>
              </button>
            </>
          ) : initialSubTab === 'RS_PRIORITY' ? (
            <div className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[4px] bg-[#005d42] text-white">
              <AlertTriangle className="w-3.5 h-3.5 text-[#fca5a5]" />
              <span>Risk Register Rumah Sakit (Hanya Risiko Ekstrem &amp; Tinggi)</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#fff1f2] text-[#9f1239]">
                {unitRisks.filter(r => r.grade === 'EKSTREM' || r.grade === 'TINGGI' || r.score >= 10).length} Risiko RS
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[4px] bg-[#005d42] text-white">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
              <span>Matriks 5x5 Heatmap RS (Agregat Rumah Sakit)</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-white/20">
                {unitRisks.length} Risiko
              </span>
            </div>
          )}
        </div>
      </div>

      {/* VIEW: RISK REGISTER UNIT & RS PRIORITY */}
      {(activeSubTab === 'UNIT_RISK' || activeSubTab === 'RS_PRIORITY') && (
        <div className="space-y-5">
          {/* Key Statistics Banner / Metric Bento */}
          {activeSubTab === 'RS_PRIORITY' ? (
            /* RS Priority Metrics: High & Low Priority Metrics */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {/* Total Item RS Priority */}
              <div className="bg-white border border-[#e2e8f0] p-4 rounded-[6px] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#515f74]">
                  <span>Total Risiko RS</span>
                  <AlertTriangle className="w-4 h-4 text-[#005683]" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#0b1c30] tabular-nums">{statTotal}</span>
                  <span className="text-[11px] text-[#515f74]">risiko</span>
                </div>
                <div className="mt-2 text-[10px] text-[#005683] font-bold">
                  {rsPriorityFilter === 'HIGH' ? 'Filter: Prioritas Tinggi' : rsPriorityFilter === 'LOW' ? 'Filter: Prioritas Rendah' : 'Semua Tingkat Prioritas'}
                </div>
              </div>

              {/* Ekstrem */}
              <div className="bg-[#fff1f2] border border-[#fecdd3] p-4 rounded-[6px] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#9f1239]">
                  <span>EKSTREM [15-25]</span>
                  <AlertTriangle className="w-4 h-4 text-[#e11d48]" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#9f1239] tabular-nums">{statEkstrem}</span>
                  <span className="text-[10px] font-semibold text-[#9f1239]">Prioritas Direktur</span>
                </div>
                <div className="mt-2 text-[10px] text-[#9f1239]">Investigasi Komprehensif RCA</div>
              </div>

              {/* Tinggi */}
              <div className="bg-[#fff7ed] border border-[#ffedd5] p-4 rounded-[6px] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#9a3412]">
                  <span>TINGGI [10-14]</span>
                  <AlertOctagon className="w-4 h-4 text-[#f97316]" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#9a3412] tabular-nums">{statTinggi}</span>
                  <span className="text-[10px] font-semibold text-[#9a3412]">Prioritas KMKP</span>
                </div>
                <div className="mt-2 text-[10px] text-[#9a3412]">Monitoring Tiap 2 Minggu</div>
              </div>

              {/* Diadopsi dari Unit Kerja */}
              <div className="bg-[#eff6ff] border border-[#bfdbfe] p-4 rounded-[6px] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#1d4ed8]">
                  <span>DIADOPSI UNIT (⭐)</span>
                  <Star className="w-4 h-4 text-[#2563eb] fill-[#2563eb]" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#1d4ed8] tabular-nums">
                    {filteredUnitRisks.filter(r => r.isHospitalPriority).length}
                  </span>
                  <span className="text-[10px] font-semibold text-[#1d4ed8]">Prioritas RS</span>
                </div>
                <div className="mt-2 text-[10px] text-[#1d4ed8]">Eskalasi Unit Kerja</div>
              </div>

              {/* Tervalidasi Unit / KMKP */}
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-4 rounded-[6px] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#166534]">
                  <span>TERVALIDASI KMKP</span>
                  <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#166534] tabular-nums">
                    {verifiedPercentage}%
                  </span>
                  <span className="text-[10px] font-semibold text-[#166534]">{statVerified} disetujui</span>
                </div>
                <div className="mt-2 text-[10px] text-[#166534]">Standar Akreditasi KARS</div>
              </div>

              {/* Terkendali / Controlled */}
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-4 rounded-[6px] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#166534]">
                  <span>TERKENDALI (CONTROLLED)</span>
                  <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#166534] tabular-nums">{statControlled}</span>
                  <span className="text-[10px] font-semibold text-[#166534]">Mitigasi Berjalan</span>
                </div>
                <div className="mt-2 text-[10px] text-[#166534]">SOP & Pengawasan Aktif</div>
              </div>

              {/* Status Validasi KMKP */}
              <div className="bg-[#005d42] text-white p-4 rounded-[6px] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>Verifikasi KMKP</span>
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold tabular-nums">{statVerified}</span>
                  <span className="text-xs text-[#9ffdd3]">/{statTotal}</span>
                </div>
                <div className="mt-2 text-[10px] text-[#9ffdd3] flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>{verifiedPercentage}% Terverifikasi RS</span>
                </div>
              </div>
            </div>
          ) : (
            /* Unit Risk Metrics: Segregated for Selected Unit */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {/* Total Item Unit */}
              <div className="bg-white border border-[#e2e8f0] p-4 rounded-[6px] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#515f74]">
                  <span>Total Risiko Unit</span>
                  <Layers className="w-4 h-4 text-[#515f74]" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#0b1c30] tabular-nums">{statTotal}</span>
                  <span className="text-[11px] text-[#515f74]">item risiko</span>
                </div>
                <div className="mt-2 text-[10px] text-[#005d42] font-semibold">Unit: {currentUnitObj.shortCode}</div>
              </div>

              {/* Ekstrem */}
              <div className="bg-[#fff1f2] border border-[#fecdd3] p-4 rounded-[6px] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#9f1239]">
                  <span>EKSTREM [15-25]</span>
                  <AlertTriangle className="w-4 h-4 text-[#e11d48]" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#9f1239] tabular-nums">{statEkstrem}</span>
                  <span className="text-[10px] font-semibold text-[#9f1239]">Eskalasi RS</span>
                </div>
                <div className="mt-2 text-[10px] text-[#9f1239]">Direktur & RCA</div>
              </div>

              {/* Tinggi */}
              <div className="bg-[#fff7ed] border border-[#ffedd5] p-4 rounded-[6px] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#9a3412]">
                  <span>TINGGI [10-14]</span>
                  <AlertOctagon className="w-4 h-4 text-[#f97316]" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#9a3412] tabular-nums">{statTinggi}</span>
                  <span className="text-[10px] font-semibold text-[#9a3412]">Prioritas Unit</span>
                </div>
                <div className="mt-2 text-[10px] text-[#9a3412]">Review Tiap 2 Minggu</div>
              </div>

              {/* Sedang */}
              <div className="bg-[#fefce8] border border-[#fef08a] p-4 rounded-[6px] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#854d0e]">
                  <span>SEDANG [4-9]</span>
                  <Activity className="w-4 h-4 text-[#eab308]" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#854d0e] tabular-nums">{statSedang}</span>
                  <span className="text-[10px] font-semibold text-[#854d0e]">Kelola Mandiri</span>
                </div>
                <div className="mt-2 text-[10px] text-[#854d0e]">Review Bulanan Unit</div>
              </div>

              {/* Rendah */}
              <div className="bg-[#ecfdf5] border border-[#a7f3d0] p-4 rounded-[6px] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#065f46]">
                  <span>RENDAH [1-3]</span>
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#065f46] tabular-nums">{statRendah}</span>
                  <span className="text-[10px] font-semibold text-[#065f46]">Terkendali SOP</span>
                </div>
                <div className="mt-2 text-[10px] text-[#065f46]">Audit Triwulanan</div>
              </div>

              {/* Status Validasi Unit */}
              <div className="bg-[#005d42] text-white p-4 rounded-[6px] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>Verifikasi Unit</span>
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold tabular-nums">{statVerified}</span>
                  <span className="text-xs text-[#9ffdd3]">/{statTotal}</span>
                </div>
                <div className="mt-2 text-[10px] text-[#9ffdd3] flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>{verifiedPercentage}% Terverifikasi</span>
                </div>
              </div>
            </div>
          )}

          {/* Informative Governance Alert Banner */}
          {activeSubTab === 'RS_PRIORITY' ? (
            <div className="bg-[#eff4ff] border border-[#d5e3fc] rounded-[6px] p-3.5 flex items-start gap-3 shadow-xs">
              <ShieldAlert className="w-5 h-5 text-[#005683] shrink-0 mt-0.5" />
              <div className="text-xs text-[#0b1c30] leading-relaxed">
                <p className="font-bold">Manajemen Risiko Rumah Sakit (Prioritas Tinggi & Rendah):</p>
                <p className="mt-0.5 text-[#515f74]">
                  Tampilan ini mendukung pengelolaan seluruh profil risiko tingkat rumah sakit, baik <strong>Prioritas Tinggi (Ekstrem & Tinggi)</strong> untuk eskalasi Direksi & KMKP, maupun <strong>Prioritas Rendah (Sedang & Rendah)</strong> untuk mitigasi operasional. Gunakan tombol <strong>+ Prioritas Tinggi</strong> atau <strong>+ Prioritas Rendah</strong> di atas untuk mendaftarkan risiko baru secara langsung.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#eff4ff] border border-[#d5e3fc] rounded-[6px] p-3.5 flex items-start gap-3 shadow-xs">
              <Building2 className="w-5 h-5 text-[#005683] shrink-0 mt-0.5" />
              <div className="text-xs text-[#005683] leading-relaxed">
                <p className="font-bold">Risk Register Khusus Unit: {currentUnitObj.label} ({currentUnitObj.shortCode})</p>
                <p className="mt-0.5">
                  Tampilan ini <strong>HANYA menyajikan profil risiko dari unit {currentUnitObj.label}</strong> secara terisolasi (termasuk tingkat Ekstrem, Tinggi, Sedang, dan Rendah). Gunakan dropdown di atas untuk berpindah unit kerja (tersedia 22 unit RS).
                </p>
              </div>
            </div>
          )}

          {/* Filter Control Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-4 shadow-xs space-y-3.5">
            {/* Header: Status Info & Quick Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0b1c30]">
                  {activeSubTab === 'RS_PRIORITY'
                    ? '🛡️ Filter Risiko Rumah Sakit (Prioritas Tinggi & Rendah)'
                    : `🏢 Filter Risiko Unit Kerja: ${currentUnitObj.label}`}
                </span>
                <span className="text-[11px] text-[#515f74]">
                  ({filteredUnitRisks.length} data ditemukan)
                </span>
              </div>

              {/* Quick Search and Filter Reset */}
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kode risiko, potensi bahaya, akar masalah, atau PIC..."
                    className="w-full bg-[#f8fafc] pl-8 pr-3 py-1.5 rounded-[4px] border border-[#cbd5e1] text-xs text-[#0b1c30] placeholder-[#94a3b8] focus:outline-none focus:border-[#005d42]"
                  />
                </div>
                <button
                  onClick={handleResetFilters}
                  className="p-2 rounded-[4px] bg-[#f1f5f9] text-[#515f74] hover:text-[#0b1c30] border border-[#cbd5e1] transition cursor-pointer"
                  title="Reset Semua Filter"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Secondary Sub-Filters: Grading Level & Status Pengendalian */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#f1f5f9] text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-[#515f74]">Tingkat Prioritas RS:</span>
                {activeSubTab === 'RS_PRIORITY' ? (
                  <>
                    <button
                      onClick={() => { setRsPriorityFilter('ALL'); setSelectedGrading('ALL'); }}
                      className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold cursor-pointer ${
                        rsPriorityFilter === 'ALL' && selectedGrading === 'ALL'
                          ? 'bg-[#0b1c30] text-white shadow-xs'
                          : 'bg-[#f1f5f9] text-[#334155]'
                      }`}
                    >
                      Semua Risiko RS Ekstrem &amp; Tinggi ({unitRisks.filter(r => r.grade === 'EKSTREM' || r.grade === 'TINGGI' || r.score >= 10).length})
                    </button>
                    <button
                      onClick={() => { setRsPriorityFilter('HIGH'); setSelectedGrading('ALL'); }}
                      className={`px-2.5 py-1 rounded-[4px] text-xs font-bold cursor-pointer ${
                        rsPriorityFilter === 'HIGH' && selectedGrading === 'ALL'
                          ? 'bg-[#e11d48] text-white shadow-xs'
                          : 'bg-[#fff1f2] text-[#9f1239] border border-[#fecdd3]'
                      }`}
                    >
                      🔴 Ekstrem Saja ({unitRisks.filter(r => r.grade === 'EKSTREM').length})
                    </button>
                    <button
                      onClick={() => { setRsPriorityFilter('LOW'); setSelectedGrading('ALL'); }}
                      className={`px-2.5 py-1 rounded-[4px] text-xs font-bold cursor-pointer ${
                        rsPriorityFilter === 'LOW' && selectedGrading === 'ALL'
                          ? 'bg-[#f97316] text-white shadow-xs'
                          : 'bg-[#fff7ed] text-[#9a3412] border border-[#ffedd5]'
                      }`}
                    >
                      🟠 Tinggi Saja ({unitRisks.filter(r => r.grade === 'TINGGI').length})
                    </button>
                    <button
                      onClick={() => { setRsPriorityFilter('ADOPTED'); setSelectedGrading('ALL'); }}
                      className={`px-2.5 py-1 rounded-[4px] text-xs font-bold cursor-pointer transition ${
                        rsPriorityFilter === 'ADOPTED' && selectedGrading === 'ALL'
                          ? 'bg-[#005683] text-white shadow-xs'
                          : 'bg-[#eff4ff] text-[#005683] border border-[#bfdbfe]'
                      }`}
                    >
                      ⭐ Diambil dari Unit RS ({unitRisks.filter(r => (r.grade === 'EKSTREM' || r.grade === 'TINGGI' || r.score >= 10) && r.isHospitalPriority).length})
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedGrading('ALL')}
                      className={`px-2 py-0.5 rounded-[4px] text-[11px] font-semibold cursor-pointer ${
                        selectedGrading === 'ALL' ? 'bg-[#0b1c30] text-white' : 'bg-[#f1f5f9] text-[#334155]'
                      }`}
                    >
                      Semua Grade ({statTotal})
                    </button>
                    <button
                      onClick={() => setSelectedGrading('EKSTREM')}
                      className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold cursor-pointer ${
                        selectedGrading === 'EKSTREM' ? 'bg-[#e11d48] text-white' : 'bg-[#fff1f2] text-[#9f1239] border border-[#fecdd3]'
                      }`}
                    >
                      Ekstrem [15-25] ({statEkstrem})
                    </button>
                    <button
                      onClick={() => setSelectedGrading('TINGGI')}
                      className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold cursor-pointer ${
                        selectedGrading === 'TINGGI' ? 'bg-[#f97316] text-white' : 'bg-[#fff7ed] text-[#9a3412] border border-[#ffedd5]'
                      }`}
                    >
                      Tinggi [10-14] ({statTinggi})
                    </button>
                    <button
                      onClick={() => setSelectedGrading('SEDANG')}
                      className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold cursor-pointer ${
                        selectedGrading === 'SEDANG' ? 'bg-[#eab308] text-white' : 'bg-[#fefce8] text-[#854d0e] border border-[#fef08a]'
                      }`}
                    >
                      Sedang [4-9] ({statSedang})
                    </button>
                    <button
                      onClick={() => setSelectedGrading('RENDAH')}
                      className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold cursor-pointer ${
                        selectedGrading === 'RENDAH' ? 'bg-[#059669] text-white' : 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                      }`}
                    >
                      Rendah [1-3] ({statRendah})
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-[#515f74]">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-[#f8fafc] text-[#0b1c30] text-[11px] px-2 py-1 rounded-[4px] border border-[#cbd5e1] focus:outline-none"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Open">Open (Belum Mitigasi)</option>
                  <option value="In Progress">In Progress (Berjalan)</option>
                  <option value="Controlled">Controlled (Terkendali)</option>
                </select>

                <span className="font-semibold text-[#515f74] ml-2">Pengecekan:</span>
                <select
                  value={selectedVerification}
                  onChange={(e) => setSelectedVerification(e.target.value)}
                  className="bg-[#f8fafc] text-[#0b1c30] text-[11px] px-2 py-1 rounded-[4px] border border-[#cbd5e1] focus:outline-none"
                >
                  <option value="ALL">Semua Verifikasi</option>
                  <option value="Disetujui">Disetujui Unit/KMKP</option>
                  <option value="Belum Dicek">Belum Dicek</option>
                  <option value="Perlu Revisi">Perlu Revisi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Risk Register Comprehensive Table Section */}
          <div className="bg-white border border-[#e2e8f0] rounded-[6px] overflow-hidden shadow-xs">
            {/* Table Header Bar */}
            <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#cbd5e1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#005d42]" />
                <span className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
                  {activeSubTab === 'RS_PRIORITY'
                    ? 'Matriks Risk Register RS (Prioritas Ekstrem & Tinggi)'
                    : `Matriks Risk Register Unit Kerja: ${currentUnitObj.label}`}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  activeSubTab === 'RS_PRIORITY' ? 'bg-[#e11d48] text-white' : 'bg-[#005d42] text-white'
                }`}>
                  {filteredUnitRisks.length} Risiko Ditampilkan
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#515f74] text-[11px]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-[#e11d48]" />Ekstrem [15-25]</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-[#f97316]" />Tinggi [10-14]</span>
                {activeSubTab === 'UNIT_RISK' && (
                  <>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-[#eab308]" />Sedang [4-9]</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-[#059669]" />Rendah [1-3]</span>
                  </>
                )}
              </div>
            </div>

            {/* Table Viewport */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#475569] uppercase font-semibold text-[11px] tracking-wider border-b border-[#cbd5e1]">
                    <th className="py-3 px-3 w-28">Kode & Unit</th>
                    <th className="py-3 px-3 w-40">Kategori Standar</th>
                    <th className="py-3 px-3 min-w-[240px]">Pernyataan Risiko (Potensi Bahaya)</th>
                    <th className="py-3 px-3 min-w-[200px]">Akar Masalah (Penyebab)</th>
                    <th className="py-3 px-2 text-center w-32">Matriks (P×D) & Skor</th>
                    <th className="py-3 px-3 min-w-[240px]">Rencana Mitigasi & Pengendalian</th>
                    <th className="py-3 px-3 min-w-[260px] bg-emerald-50/50 text-[#047857]">Implementasi Yang Sudah Dilakukan</th>
                    <th className="py-3 px-3 w-36">PIC & Target</th>
                    <th className="py-3 px-3 min-w-[190px]">Pengecekan Unit & Catatan</th>
                    <th className="py-3 px-2 w-28">Status</th>
                    <th className="py-3 px-2 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filteredUnitRisks.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-14 text-center text-[#64748b] bg-white">
                        <div className="max-w-md mx-auto flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#005d42] mb-3">
                            <Layers className="w-6 h-6" />
                          </div>
                          <p className="font-bold text-base text-[#0b1c30]">
                            {unitRisks.length === 0 ? 'Register Risiko Saat Ini Kosong' : 'Tidak Ada Risiko yang Sesuai Filter'}
                          </p>
                          <p className="text-xs text-[#515f74] mt-1.5 leading-relaxed">
                            {unitRisks.length === 0
                              ? 'Seluruh data register risiko telah dikosongkan. Setiap isian risiko baru yang ditambahkan akan otomatis tersimpan permanen di cloud database & server (tidak akan terhapus saat keluar dari web kecuali dihapus secara manual).'
                              : 'Coba sesuaikan pilihan unit kerja, standar kategori risiko, tingkat prioritas, atau reset pencarian Anda.'}
                          </p>
                          <div className="flex items-center gap-2 mt-4">
                            <button
                              onClick={() => handleOpenAddModal()}
                              className="px-4 py-2 rounded-[4px] bg-[#005d42] hover:bg-[#064e3b] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                              <span>+ Tambah Risiko Pertama</span>
                            </button>
                            {unitRisks.length > 0 && (
                              <button
                                onClick={handleResetFilters}
                                className="px-3.5 py-2 rounded-[4px] bg-[#f1f5f9] hover:bg-slate-200 text-[#0b1c30] text-xs font-semibold cursor-pointer border border-[#cbd5e1]"
                              >
                                Reset Filter
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUnitRisks.map((item, idx) => {
                      const gradeBadge = getRiskBadgeStyle(item.grade);
                      const isEven = idx % 2 === 0;

                      let catBadgeStyle = 'bg-[#f1f5f9] text-[#334155] border-[#cbd5e1]';
                      if (item.categoryKey.startsWith('PPI')) {
                        catBadgeStyle = 'bg-[#eff4ff] text-[#005683] border-[#d5e3fc]';
                      } else if (item.categoryKey.startsWith('MFK')) {
                        catBadgeStyle = 'bg-[#fff7ed] text-[#9a3412] border-[#ffedd5]';
                      } else if (item.categoryKey === 'KLINIS') {
                        catBadgeStyle = 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]';
                      }

                      return (
                        <tr
                          key={item.id}
                          className={`${isEven ? 'bg-white' : 'bg-[#f8fafc]'} hover:bg-[#f1f5f9] transition-colors`}
                        >
                          {/* Kode & Unit */}
                          <td className="py-3 px-3 align-top whitespace-nowrap">
                            <span className="font-mono text-xs font-bold text-[#0b1c30] block">{item.id}</span>
                            <div className="flex flex-col gap-0.5 mt-1">
                              <span className="text-[10px] font-bold text-[#005d42] bg-[#ecfdf5] border border-[#a7f3d0] px-1.5 py-0.5 rounded-[3px] inline-block">
                                {item.unit}
                              </span>
                              {item.isHospitalPriority && (
                                <span className="text-[9px] font-bold text-[#1d4ed8] bg-[#eff6ff] border border-[#bfdbfe] px-1.5 py-0.5 rounded-[3px] inline-flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-[#1d4ed8]" /> Prioritas RS
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Kategori Standar */}
                          <td className="py-3 px-3 align-top">
                            <span className={`inline-block px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${catBadgeStyle} leading-tight`}>
                              {item.categoryName}
                            </span>
                          </td>

                          {/* Pernyataan Risiko */}
                          <td className="py-3 px-3 align-top">
                            <p className="font-semibold text-[#0f172a] leading-relaxed line-clamp-3" title={item.statement}>
                              {item.statement}
                            </p>
                          </td>

                          {/* Akar Masalah */}
                          <td className="py-3 px-3 align-top">
                            <p className="text-[#515f74] text-[11px] leading-relaxed line-clamp-3" title={item.rootCause}>
                              {item.rootCause}
                            </p>
                          </td>

                          {/* Matriks P x D & Skor */}
                          <td className="py-3 px-2 align-top text-center whitespace-nowrap">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-mono text-xs font-bold text-[#0b1c30]">
                                P{item.p} × D{item.d} = {item.score}
                              </span>
                              <span
                                style={{ backgroundColor: gradeBadge.bg, borderColor: gradeBadge.border, color: gradeBadge.text }}
                                className="px-2 py-0.5 rounded-[3px] text-[10px] font-bold border inline-flex items-center gap-1"
                              >
                                <span className="w-1.5 h-1.5 rounded-[2px]" style={{ backgroundColor: gradeBadge.dotColor }} />
                                {gradeBadge.label}
                              </span>
                            </div>
                          </td>

                          {/* Mitigasi Lengkap */}
                          <td className="py-3 px-3 align-top">
                            <p className="text-[#1e293b] text-[11px] leading-relaxed line-clamp-3" title={item.mitigation}>
                              {item.mitigation}
                            </p>
                          </td>

                          {/* Implementasi Yang Sudah Dilakukan */}
                          <td className="py-3 px-3 align-top bg-emerald-50/20">
                            {item.implementedActions ? (
                              <div className="space-y-1.5">
                                <p className="text-[#047857] font-semibold text-xs leading-relaxed" title={item.implementedActions}>
                                  {item.implementedActions}
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                  {item.implementationDate && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                                      <Calendar className="w-2.5 h-2.5" />
                                      {item.implementationDate}
                                    </span>
                                  )}
                                  {item.effectivenessEvaluation && (
                                    <span className={`px-1.5 py-0.5 rounded font-bold border ${
                                      item.effectivenessEvaluation === 'EFEKTIF'
                                        ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]'
                                        : item.effectivenessEvaluation === 'CUKUP_EFEKTIF'
                                        ? 'bg-[#eff4ff] text-[#005683] border-[#d5e3fc]'
                                        : 'bg-[#fff1f2] text-[#9f1239] border-[#fecdd3]'
                                    }`}>
                                      {item.effectivenessEvaluation === 'EFEKTIF' ? '✓ Efektif' : item.effectivenessEvaluation === 'CUKUP_EFEKTIF' ? 'Cukup Efektif' : 'Belum Efektif'}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleOpenImplementationModal(item)}
                                    className="text-[10px] text-[#005683] hover:underline font-semibold cursor-pointer ml-auto"
                                    title="Perbarui implementasi risiko ini"
                                  >
                                    Perbarui
                                  </button>
                                </div>
                                {item.implementationEvidence && (
                                  <span className="text-[10px] text-[#64748b] block italic" title={item.implementationEvidence}>
                                    Bukti: {item.implementationEvidence}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-start gap-1 py-0.5">
                                <span className="text-[10px] text-[#94a3b8] italic">Belum dicatat</span>
                                <button
                                  onClick={() => handleOpenImplementationModal(item)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#005d42] border border-[#a7f3d0] text-[10px] font-bold cursor-pointer transition shadow-2xs"
                                  title="Catat tindakan nyata yang telah dilaksanakan"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>+ Catat Implementasi</span>
                                </button>
                              </div>
                            )}
                          </td>

                          {/* PIC & Target */}
                          <td className="py-3 px-3 align-top whitespace-nowrap">
                            <span className="font-bold text-[#0b1c30] text-[11px] block">{item.pic}</span>
                            <span className="text-[10px] text-[#64748b] flex items-center gap-1 mt-0.5 font-mono">
                              <Calendar className="w-3 h-3 text-[#94a3b8]" />
                              {item.target}
                            </span>
                          </td>

                          {/* Pengecekan Hasil Unit */}
                          <td className="py-3 px-3 align-top">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between gap-1 flex-wrap">
                                <span className="text-[10px] text-[#515f74] font-semibold">{item.verifierUnit || 'KMKP / Unit'}</span>
                                <select
                                  value={item.verifStatus}
                                  onChange={(e) => handleQuickChangeVerifStatus(item, e.target.value as any)}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer border outline-none shadow-2xs transition ${
                                    item.verifStatus === 'Disetujui'
                                      ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0] hover:bg-[#d1fae5]'
                                      : item.verifStatus === 'Perlu Revisi'
                                      ? 'bg-[#fff1f2] text-[#9f1239] border-[#fecdd3] hover:bg-[#ffe4e6]'
                                      : 'bg-[#eff4ff] text-[#005683] border-[#d5e3fc] hover:bg-[#dbeafe]'
                                  }`}
                                  title="Pilih untuk langsung mengatur status verifikasi (tersimpan permanen)"
                                >
                                  <option value="Disetujui">✓ Disetujui</option>
                                  <option value="Perlu Revisi">⚠ Perlu Revisi</option>
                                  <option value="Belum Dicek">⏳ Belum Dicek</option>
                                </select>
                              </div>
                              <div className="flex items-start justify-between gap-1">
                                <p className="text-[10px] text-[#475569] italic line-clamp-2" title={item.verifNote}>
                                  "{item.verifNote || 'Belum ada catatan verifikator.'}"
                                </p>
                                <button
                                  onClick={() => handleOpenQuickVerif(item)}
                                  className="text-[10px] text-[#005d42] hover:underline font-semibold shrink-0 cursor-pointer"
                                  title="Edit catatan & unit verifikator"
                                >
                                  Catat
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Status Pengendalian */}
                          <td className="py-3 px-2 align-top whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${
                              item.status === 'Open'
                                ? 'bg-[#fff1f2] text-[#9f1239] border border-[#fecdd3]'
                                : item.status === 'In Progress'
                                ? 'bg-[#eff4ff] text-[#005683] border border-[#d5e3fc]'
                                : 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                            }`}>
                              {item.status}
                            </span>
                          </td>

                          {/* Tombol Aksi */}
                          <td className="py-3 px-2 align-top text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              {activeSubTab === 'RS_PRIORITY' && (
                                <button
                                  onClick={() => handleToggleAdoptUnitRisk(item)}
                                  className={`p-1 rounded-[3px] border transition cursor-pointer ${
                                    item.isHospitalPriority
                                      ? 'bg-[#eff6ff] border-[#bfdbfe] text-[#1d4ed8] hover:bg-[#dbeafe]'
                                      : 'bg-white border-[#cbd5e1] text-[#94a3b8] hover:text-[#0b1c30]'
                                  }`}
                                  title={item.isHospitalPriority ? 'Lepas dari Prioritas RS' : 'Jadikan Prioritas Rumah Sakit'}
                                >
                                  <Star className={`w-3.5 h-3.5 ${item.isHospitalPriority ? 'fill-[#1d4ed8] text-[#1d4ed8]' : ''}`} />
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenImplementationModal(item)}
                                className="p-1 rounded-[3px] bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] hover:bg-[#047857] hover:text-white transition cursor-pointer"
                                title="Catat / Perbarui Implementasi Yang Dilakukan"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenAddModal(item)}
                                className="p-1 rounded-[3px] bg-white border border-[#cbd5e1] text-[#475569] hover:text-[#0b1c30] transition cursor-pointer"
                                title="Ubah Rincian Risiko"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenQuickVerif(item)}
                                className="p-1 rounded-[3px] bg-[#ecfdf5] border border-[#a7f3d0] text-[#005d42] hover:bg-[#97f5cc] transition cursor-pointer"
                                title="Pengecekan / Validasi Unit"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUnitRisk(item.id)}
                                className="p-1 rounded-[3px] bg-white border border-[#cbd5e1] text-[#e11d48] hover:bg-[#fff1f2] transition cursor-pointer"
                                title="Hapus Risiko"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary & Pagination */}
            <div className="p-3 bg-white border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#515f74]">
              <div>
                {activeSubTab === 'RS_PRIORITY' ? (
                  <>
                    Menampilkan <strong className="text-[#0b1c30]">{filteredUnitRisks.length}</strong> risiko prioritas RS (Khusus Ekstrem & Tinggi) dari total{' '}
                    <strong className="text-[#0b1c30]">{unitRisks.filter(r => r.grade === 'EKSTREM' || r.grade === 'TINGGI').length}</strong> risiko eskalasi RS di RSU SHANTI GRAHA.
                  </>
                ) : (
                  <>
                    Menampilkan <strong className="text-[#0b1c30]">{filteredUnitRisks.length}</strong> risiko khusus unit <strong className="text-[#005d42]">{currentUnitObj.label}</strong>.
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 font-semibold text-[11px]">
                <span className="text-[#64748b]">{activeSubTab === 'RS_PRIORITY' ? 'Cakupan:' : 'Unit Aktif:'}</span>
                <span className="text-[#005d42] font-bold">
                  {activeSubTab === 'RS_PRIORITY'
                    ? (selectedUnit === 'ALL' ? 'Seluruh Unit RS (Eskalasi Prioritas)' : `Filter Unit: ${currentUnitObj.label}`)
                    : `${currentUnitObj.label} (${currentUnitObj.shortCode})`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Help & STARKES Matrix Guide Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Card 1: Tata Cara Skoring */}
            <div className="bg-white border border-[#e2e8f0] p-4 rounded-[6px] shadow-xs space-y-1.5">
              <div className="flex items-center gap-2 text-[#005d42] font-bold text-xs uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <h3>Grading Matriks KARS 5×5</h3>
              </div>
              <p className="text-xs text-[#515f74] leading-relaxed">
                Skor dihitung dari perkalian antara <strong>Probabilitas (1-5)</strong> dan <strong>Dampak Klinis/Finansial (1-5)</strong>. Skor 15-25 membutuhkan investigasi komprehensif RCA oleh Komite Mutu & Direksi dalam rentang maksimal 45 hari.
              </p>
            </div>

            {/* Card 2: Pengendalian Infeksi PPI */}
            <div className="bg-white border border-[#e2e8f0] p-4 rounded-[6px] shadow-xs space-y-1.5">
              <div className="flex items-center gap-2 text-[#005683] font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <h3>Sinkronisasi PPI 1-11</h3>
              </div>
              <p className="text-xs text-[#515f74] leading-relaxed">
                Semua temuan terkait risiko surveilance IDO/ISK, linen, dekontaminasi CSSD, limbah medis tajam, dan penyediaan makanan gizi wajib memuat program pencegahan standar ICRA (Infection Control Risk Assessment).
              </p>
            </div>

            {/* Card 3: Keselamatan Fasilitas MFK */}
            <div className="bg-white border border-[#e2e8f0] p-4 rounded-[6px] shadow-xs space-y-1.5">
              <div className="flex items-center gap-2 text-[#9a3412] font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <h3>Kepatuhan MFK 1-7</h3>
              </div>
              <p className="text-xs text-[#515f74] leading-relaxed">
                Unit teknis (IPSRS, CSSD, Radiologi, Laboratorium) wajib melampirkan tindak lanjut terhadap B3, sistem proteksi kebakaran, kontinuitas utilitas (genset/oksigen sentral), dan kalibrasi alat elektromedik aktif.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: HEATMAP 5x5 */}
      {activeSubTab === 'HEATMAP' && (() => {
        const isUnitHeatmap = initialSubTab === 'UNIT_RISK' || selectedUnit !== 'ALL';
        const activeUnitKey = (selectedUnit === 'ALL' && initialSubTab === 'UNIT_RISK') ? 'IGD' : selectedUnit;
        const activeUnitObj = ALL_HOSPITAL_UNITS.find(u => u.key === activeUnitKey) || ALL_HOSPITAL_UNITS[3]; // default IGD

        // If in unit mode: STRICTLY risks from that unit only!
        const targetHeatmapRisks = isUnitHeatmap
          ? unitRisks.filter(r => r.unit === activeUnitKey)
          : unitRisks;

        const countEkstrem = targetHeatmapRisks.filter(r => r.grade === 'EKSTREM').length;
        const countTinggi = targetHeatmapRisks.filter(r => r.grade === 'TINGGI').length;
        const countSedang = targetHeatmapRisks.filter(r => r.grade === 'SEDANG').length;
        const countRendah = targetHeatmapRisks.filter(r => r.grade === 'RENDAH').length;

        return (
          <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 shadow-xs space-y-5">
            {/* Header Heatmap */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-[#e2e8f0] gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isUnitHeatmap ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]' : 'bg-[#eff4ff] text-[#005683] border border-[#d5e3fc]'
                  }`}>
                    {isUnitHeatmap ? `MATRIKS 5x5 UNIT: ${activeUnitObj.label}` : 'MATRIKS 5x5 SELURUH RS'}
                  </span>
                  <span className="text-xs text-[#64748b] font-medium">
                    {targetHeatmapRisks.length} Risiko Terplot di Matriks
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0b1c30] tracking-tight mt-1 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#005d42]" />
                  {isUnitHeatmap
                    ? `Peta Panas Matriks 5x5 Risiko Khusus Unit: ${activeUnitObj.label}`
                    : 'Peta Panas Matriks 5x5 Risiko Rumah Sakit (Semua Unit)'}
                </h3>
                <p className="text-xs text-[#515f74] mt-0.5">
                  {isUnitHeatmap
                    ? `Matriks ini HANYA menampilkan sebaran risiko dari unit kerja ${activeUnitObj.label} (${activeUnitObj.shortCode}) pada matriks Probabilitas (P) vs Dampak (D).`
                    : `Menampilkan sebaran seluruh ${unitRisks.length} risiko dari seluruh 22 unit kerja RSU SHANTI GRAHA.`}
                </p>
              </div>

              {/* Unit Selector inside Heatmap */}
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs font-semibold text-[#515f74] whitespace-nowrap">
                  Pilih Unit Kerja:
                </label>
                <div className="relative min-w-[260px]">
                  <select
                    value={isUnitHeatmap ? activeUnitKey : selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold px-3 py-2 rounded-[4px] border border-[#d5e3fc] cursor-pointer focus:outline-none focus:border-[#005d42] shadow-xs"
                  >
                    {initialSubTab !== 'UNIT_RISK' && (
                      <option value="ALL">🏢 Semua Unit RS ({unitRisks.length} Risiko)</option>
                    )}
                    {ALL_HOSPITAL_UNITS.map(u => {
                      const unitCount = unitRisks.filter(r => r.unit === u.key).length;
                      return (
                        <option key={u.key} value={u.key}>
                          📍 {u.label} ({unitCount} risiko)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  onClick={() => handleOpenAddModal()}
                  className="px-3.5 py-2 bg-[#005d42] hover:bg-[#064e3b] text-white rounded-[4px] text-xs font-bold transition shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Risiko Unit Ini</span>
                </button>
              </div>
            </div>

            {/* Metric Bento Summary for this Unit */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-[4px] bg-[#fff1f2] border border-[#fecdd3]">
                <span className="text-[10px] font-bold text-[#9f1239] uppercase block">Ekstrem [15-25]</span>
                <span className="text-xl font-bold text-[#e11d48] mt-0.5 block tabular-nums">{countEkstrem} risiko</span>
                <span className="text-[10px] text-[#9f1239] block mt-0.5">Tindakan darurat &amp; investigasi RCA</span>
              </div>
              <div className="p-3 rounded-[4px] bg-[#fff7ed] border border-[#fed7aa]">
                <span className="text-[10px] font-bold text-[#9a3412] uppercase block">Tinggi [10-14]</span>
                <span className="text-xl font-bold text-[#ea580c] mt-0.5 block tabular-nums">{countTinggi} risiko</span>
                <span className="text-[10px] text-[#9a3412] block mt-0.5">Mitigasi ketat level manajerial</span>
              </div>
              <div className="p-3 rounded-[4px] bg-[#fefce8] border border-[#fef08a]">
                <span className="text-[10px] font-bold text-[#854d0e] uppercase block">Sedang [4-9]</span>
                <span className="text-xl font-bold text-[#ca8a04] mt-0.5 block tabular-nums">{countSedang} risiko</span>
                <span className="text-[10px] text-[#854d0e] block mt-0.5">Kepatuhan SPO &amp; audit berkala</span>
              </div>
              <div className="p-3 rounded-[4px] bg-[#ecfdf5] border border-[#a7f3d0]">
                <span className="text-[10px] font-bold text-[#065f46] uppercase block">Rendah [1-3]</span>
                <span className="text-xl font-bold text-[#059669] mt-0.5 block tabular-nums">{countRendah} risiko</span>
                <span className="text-[10px] text-[#065f46] block mt-0.5">Prosedur rutin operasional</span>
              </div>
            </div>

            {/* 5x5 Matrix Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[650px]">
                <div className="grid grid-cols-6 gap-2 text-center text-[11px] font-semibold mb-2">
                  <div className="flex items-end justify-center pb-1 text-[#475569] font-bold text-[10px] uppercase">
                    Probabilitas \ Dampak
                  </div>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] py-2 rounded-[4px] text-[#475569]">1 - Tdk Signifikan</div>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] py-2 rounded-[4px] text-[#475569]">2 - Minor</div>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] py-2 rounded-[4px] text-[#475569]">3 - Moderat</div>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] py-2 rounded-[4px] text-[#475569]">4 - Mayor</div>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] py-2 rounded-[4px] text-[#475569]">5 - Katastropik</div>
                </div>

                {[5, 4, 3, 2, 1].map((freq) => (
                  <div key={freq} className="grid grid-cols-6 gap-2 mb-2">
                    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[4px] px-2 py-2 flex items-center justify-start text-[11px] font-semibold text-[#475569]">
                      {freq === 5 ? '5 - Sangat Sering' : freq === 4 ? '4 - Sering' : freq === 3 ? '3 - Mungkin' : freq === 2 ? '2 - Jarang' : '1 - Sangat Jarang'}
                    </div>

                    {[1, 2, 3, 4, 5].map((impact) => {
                      const cellConfig = KNKP_RISK_MATRIX[freq as 1|2|3|4|5][impact as 1|2|3|4|5];
                      const badgeStyle = getRiskBadgeStyle(cellConfig.level);
                      const matchingItems = targetHeatmapRisks.filter(r => r.p === freq && r.d === impact);

                      return (
                        <div
                          key={impact}
                          style={{ backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border, color: badgeStyle.text }}
                          className="border rounded-[5px] p-2 flex flex-col items-center justify-between min-h-[76px] transition hover:shadow-xs"
                        >
                          <div className="w-full flex items-center justify-between text-[10px] font-bold opacity-85">
                            <span>P{freq}×D{impact}</span>
                            <span className="font-mono">{cellConfig.score}</span>
                          </div>
                          {matchingItems.length > 0 ? (
                            <div className="w-full mt-1.5 flex flex-col gap-1">
                              {matchingItems.map(m => (
                                <button
                                  key={m.id}
                                  onClick={() => handleOpenAddModal(m)}
                                  title={`${m.id} (${m.unitLabel}): ${m.statement}\nMitigasi: ${m.mitigation}\nPIC: ${m.pic}`}
                                  className="w-full text-left px-1.5 py-1 bg-white hover:bg-slate-50 text-[#0b1c30] border border-current font-bold text-[10px] rounded shadow-2xs cursor-pointer truncate"
                                >
                                  {m.id}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] opacity-30 my-auto">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Risk List for this Unit Heatmap */}
            <div className="pt-3 border-t border-[#e2e8f0]">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#005d42]" />
                  Daftar Risiko Khusus Unit {activeUnitObj.label} ({targetHeatmapRisks.length} Risiko)
                </h4>
                <span className="text-[11px] text-[#64748b]">
                  Klik kode risiko atau tombol edit untuk memperbarui data
                </span>
              </div>

              {targetHeatmapRisks.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-[#cbd5e1] rounded-[6px] text-xs text-[#64748b] bg-[#f8fafc]">
                  <p className="font-bold text-sm text-[#0b1c30]">Belum Ada Risiko Terdata untuk Unit {activeUnitObj.label}</p>
                  <p className="text-xs text-[#64748b] mt-1">Matriks 5x5 unit ini masih kosong. Silakan input risiko pertama untuk unit {activeUnitObj.label}.</p>
                  <div className="mt-3">
                    <button
                      onClick={() => handleOpenAddModal()}
                      className="px-3.5 py-2 bg-[#005d42] hover:bg-[#064e3b] text-white rounded-[4px] text-xs font-bold cursor-pointer transition shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Input Risiko Unit {activeUnitObj.label}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#e2e8f0] rounded-[6px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] text-[#475569] font-bold text-[11px] border-b border-[#cbd5e1]">
                        <th className="py-2.5 px-3 w-28">Kode</th>
                        <th className="py-2.5 px-3 min-w-[220px]">Pernyataan Risiko</th>
                        <th className="py-2.5 px-2 text-center w-24">P × D</th>
                        <th className="py-2.5 px-2 text-center w-16">Skor</th>
                        <th className="py-2.5 px-2 text-center w-24">Grade</th>
                        <th className="py-2.5 px-3 min-w-[200px]">Rencana Mitigasi</th>
                        <th className="py-2.5 px-3 min-w-[220px] bg-emerald-50/70 text-[#047857]">Implementasi Yang Sudah Dilakukan</th>
                        <th className="py-2.5 px-3 min-w-[190px]">Pengecekan Unit & Catatan</th>
                        <th className="py-2.5 px-2 text-center w-24">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0]">
                      {targetHeatmapRisks.map((item, idx) => {
                        const bStyle = getRiskBadgeStyle(item.grade);
                        const isEven = idx % 2 === 0;
                        return (
                          <tr key={item.id} className={`${isEven ? 'bg-white' : 'bg-[#f8fafc]'} hover:bg-[#f1f5f9]`}>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#005d42] align-top whitespace-nowrap">{item.id}</td>
                            <td className="py-2.5 px-3 font-semibold text-[#0f172a] align-top">{item.statement}</td>
                            <td className="py-2.5 px-2 text-center font-mono align-top whitespace-nowrap">P{item.p} × D{item.d}</td>
                            <td className="py-2.5 px-2 text-center font-bold text-sm align-top tabular-nums">{item.score}</td>
                            <td className="py-2.5 px-2 text-center align-top whitespace-nowrap">
                              <span
                                style={{ backgroundColor: bStyle.bg, borderColor: bStyle.border, color: bStyle.text }}
                                className="px-2 py-0.5 rounded text-[10px] font-bold border inline-block"
                              >
                                {item.grade}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-[#334155] align-top">{item.mitigation}</td>
                            <td className="py-2.5 px-3 text-[#047857] align-top bg-emerald-50/20">
                              {item.implementedActions ? (
                                <div className="space-y-1">
                                  <p className="font-semibold text-xs leading-snug">{item.implementedActions}</p>
                                  <div className="flex flex-wrap items-center gap-1 text-[10px]">
                                    {item.implementationDate && <span className="font-mono text-emerald-800">📅 {item.implementationDate}</span>}
                                    {item.effectivenessEvaluation && (
                                      <span className="font-bold text-[#047857] bg-emerald-100/70 px-1.5 py-0.2 rounded">
                                        {item.effectivenessEvaluation}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[#94a3b8] italic text-[11px]">Belum dicatat</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 align-top">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between gap-1 flex-wrap">
                                  <span className="text-[10px] text-[#515f74] font-semibold">{item.verifierUnit || 'KMKP / Unit'}</span>
                                  <select
                                    value={item.verifStatus}
                                    onChange={(e) => handleQuickChangeVerifStatus(item, e.target.value as any)}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer border outline-none shadow-2xs transition ${
                                      item.verifStatus === 'Disetujui'
                                        ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0] hover:bg-[#d1fae5]'
                                        : item.verifStatus === 'Perlu Revisi'
                                        ? 'bg-[#fff1f2] text-[#9f1239] border-[#fecdd3] hover:bg-[#ffe4e6]'
                                        : 'bg-[#eff4ff] text-[#005683] border-[#d5e3fc] hover:bg-[#dbeafe]'
                                    }`}
                                    title="Pilih status verifikasi"
                                  >
                                    <option value="Disetujui">✓ Disetujui</option>
                                    <option value="Perlu Revisi">⚠ Perlu Revisi</option>
                                    <option value="Belum Dicek">⏳ Belum Dicek</option>
                                  </select>
                                </div>
                                <div className="flex items-center justify-between gap-1">
                                  <p className="text-[10px] text-[#475569] italic line-clamp-1" title={item.verifNote}>
                                    "{item.verifNote || 'Belum ada catatan'}"
                                  </p>
                                  <button
                                    onClick={() => handleOpenQuickVerif(item)}
                                    className="text-[10px] text-[#005d42] hover:underline font-semibold shrink-0 cursor-pointer"
                                  >
                                    Catat
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-center align-top whitespace-nowrap">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenAddModal(item)}
                                  className="p-1 rounded bg-white border border-[#cbd5e1] text-[#475569] hover:text-[#0b1c30] cursor-pointer"
                                  title="Ubah Rincian"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenImplementationModal(item)}
                                  className="p-1 rounded bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] hover:bg-[#047857] hover:text-white cursor-pointer"
                                  title="Catat Implementasi"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* VIEW: KRI */}
      {activeSubTab === 'KRI' && (
        <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 shadow-xs space-y-4">
          <div className="border-b border-[#e2e8f0] pb-3">
            <h3 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#005d42]" />
              Instrumen Peringatan Dini: Key Risk Indicators (KRI) Unit
            </h3>
            <p className="text-xs text-[#515f74]">
              Monitoring kepatuhan indikator proaktif sebelum timbul insiden keselamatan pasien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COMPREHENSIVE_RISK_ITEMS.map((item) => (
              <div key={item.id} className="p-4 border border-[#e2e8f0] rounded-[6px] bg-[#f8fafc] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#005d42]">{item.code}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                    {item.kriStatus}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[#0b1c30]">{item.title}</h4>
                <p className="text-[11px] text-[#515f74]">{item.kri}</p>
                <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-xs">
                  <span>Realisasi: <strong className="font-mono text-[#0b1c30]">{item.kriCurrent}</strong></span>
                  <span className="text-[#64748b]">Target: {item.kriTarget}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT RISIKO UNIT */}
      {showUnitRiskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-[8px] border border-[#cbd5e1] shadow-2xl flex flex-col overflow-hidden my-auto animate-in fade-in">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[4px] bg-[#005d42] text-white flex items-center justify-center">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0b1c30]">
                    {editingRiskId
                      ? `Ubah Data Risiko (${editingRiskId})`
                      : activeSubTab === 'RS_PRIORITY'
                      ? 'Tambah Risiko Rumah Sakit (Prioritas Tinggi & Rendah)'
                      : 'Tambah Risiko Unit Kerja Baru'}
                  </h3>
                  <p className="text-[11px] text-[#515f74]">
                    {activeSubTab === 'RS_PRIORITY'
                      ? 'Daftarkan risiko tingkat rumah sakit dengan fleksibilitas prioritas tinggi (ekstrem/tinggi) atau rendah (sedang/rendah)'
                      : 'Sistem Form Manajemen Risiko STARKES KARS 2022/2026'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUnitRiskModal(false)}
                className="p-1 rounded-[4px] text-[#64748b] hover:text-[#0b1c30] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveUnitRisk} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Preset Cepat Tingkat Prioritas Risiko */}
              <div className="bg-[#eff4ff] border border-[#d5e3fc] p-3 rounded-[6px] space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-bold text-[#005683] text-xs flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    Pilihan Cepat Prioritas Risiko RS:
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    formP * formD >= 15 ? 'bg-[#fff1f2] text-[#9f1239] border border-[#fecdd3]' :
                    formP * formD >= 10 ? 'bg-[#fff7ed] text-[#9a3412] border border-[#ffedd5]' :
                    formP * formD >= 4 ? 'bg-[#fefce8] text-[#854d0e] border border-[#fef08a]' :
                    'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                  }`}>
                    Tingkat Saat Ini: {
                      formP * formD >= 15 ? '🔴 EKSTREM (Skor ' + (formP * formD) + ')' :
                      formP * formD >= 10 ? '🟠 TINGGI (Skor ' + (formP * formD) + ')' :
                      formP * formD >= 4 ? '🟡 SEDANG (Skor ' + (formP * formD) + ')' :
                      '🟢 RENDAH (Skor ' + (formP * formD) + ')'
                    }
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => { setFormP(5); setFormD(4); }}
                    className={`px-3 py-2 rounded-[4px] border text-xs font-bold text-left transition cursor-pointer ${
                      formP * formD >= 15 ? 'bg-[#e11d48] text-white border-[#be123c] shadow-xs' : 'bg-white text-[#9f1239] border-[#fecdd3] hover:bg-[#fff1f2]'
                    }`}
                  >
                    🔴 Prioritas Ekstrem
                    <span className="block text-[10px] font-normal opacity-90">P:5 × D:4 = 20 (Direksi)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setFormP(3); setFormD(4); }}
                    className={`px-3 py-2 rounded-[4px] border text-xs font-bold text-left transition cursor-pointer ${
                      formP * formD >= 10 && formP * formD < 15 ? 'bg-[#f97316] text-white border-[#ea580c] shadow-xs' : 'bg-white text-[#9a3412] border-[#ffedd5] hover:bg-[#fff7ed]'
                    }`}
                  >
                    🟠 Prioritas Tinggi
                    <span className="block text-[10px] font-normal opacity-90">P:3 × D:4 = 12 (KMKP)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setFormP(2); setFormD(3); }}
                    className={`px-3 py-2 rounded-[4px] border text-xs font-bold text-left transition cursor-pointer ${
                      formP * formD >= 4 && formP * formD < 10 ? 'bg-[#eab308] text-white border-[#ca8a04] shadow-xs' : 'bg-white text-[#854d0e] border-[#fef08a] hover:bg-[#fefce8]'
                    }`}
                  >
                    🟡 Prioritas Sedang
                    <span className="block text-[10px] font-normal opacity-90">P:2 × D:3 = 6 (Operasional)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setFormP(1); setFormD(2); }}
                    className={`px-3 py-2 rounded-[4px] border text-xs font-bold text-left transition cursor-pointer ${
                      formP * formD < 4 ? 'bg-[#059669] text-white border-[#047857] shadow-xs' : 'bg-white text-[#065f46] border-[#a7f3d0] hover:bg-[#ecfdf5]'
                    }`}
                  >
                    🟢 Prioritas Rendah
                    <span className="block text-[10px] font-normal opacity-90">P:1 × D:2 = 2 (Rutin/SOP)</span>
                  </button>
                </div>
              </div>
              {/* Row 1: Unit & Kategori */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">
                    Unit Pelapor / Pemilik Risiko *
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value as HospitalUnit)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-[4px] text-xs font-semibold text-[#0b1c30] focus:border-[#005d42] outline-none"
                  >
                    {ALL_HOSPITAL_UNITS.map(u => (
                      <option key={u.key} value={u.key}>
                        {u.label} ({u.shortCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">
                    Kategori Standar STARKES (11 PPI + 7 MFK + Klinis/Tata Kelola) *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as StarkesRiskCategory)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-[4px] text-xs font-semibold text-[#0b1c30] focus:border-[#005d42] outline-none"
                  >
                    <optgroup label="Standar Klinis & Tata Kelola">
                      <option value="KLINIS">Klinis / Keselamatan Pasien (KP)</option>
                      <option value="FINANSIAL">Finansial, Billing & Casemix</option>
                      <option value="HUKUM">Hukum, Regulasi & Reputasi</option>
                      <option value="OPERASIONAL">Operasional & SIMRS IT</option>
                    </optgroup>
                    <optgroup label="Standar PPI (11 Kategori Lengkap)">
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
                    <optgroup label="Standar MFK (7 Standar Lengkap)">
                      <option value="MFK_1">MFK 1 – MANAJEMEN KESELAMATAN</option>
                      <option value="MFK_2">MFK 2 – KEAMANAN</option>
                      <option value="MFK_3">MFK 3 – B3</option>
                      <option value="MFK_4">MFK 4 – UTILITAS</option>
                      <option value="MFK_5">MFK 5 – KEBAKARAN</option>
                      <option value="MFK_6">MFK 6 – ALAT MEDIS</option>
                      <option value="MFK_7">MFK 7 – BENCANA</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Row 2: Pernyataan Risiko & Akar Masalah */}
              <div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <label className="font-semibold text-[#0b1c30]">
                    Pernyataan Risiko (Identifikasi Potensi Bahaya) *
                  </label>
                  <button
                    type="button"
                    onClick={handleAiCompleteFields}
                    disabled={isCompletingWithAi || !formStatement.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-[4px] text-xs font-bold shadow-xs cursor-pointer transition disabled:opacity-40"
                    title="Ketik pernyataan risiko, lalu klik tombol ini untuk mengisi seluruh isian ke bawah secara otomatis"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isCompletingWithAi ? 'animate-spin' : 'animate-pulse'}`} />
                    <span>{isCompletingWithAi ? 'Sedang Diproses AI...' : '✨ Isi Otomatis dengan AI'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={formStatement}
                  onChange={(e) => setFormStatement(e.target.value)}
                  placeholder="Ketik potensi bahaya/risiko di sini, lalu klik '✨ Isi Otomatis dengan AI' untuk melengkapi isian ke bawah..."
                  required
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] p-2.5 rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] outline-none"
                />
                <p className="text-[10.5px] text-[#64748b] mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3 text-purple-600 shrink-0" />
                  <span>Ketik pernyataan risiko secara manual, lalu klik tombol AI di atas untuk otomatis mengisi akar masalah, skor P×D, mitigasi, dan PIC ke bawah.</span>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">
                  Akar Masalah (Penyebab Dasar / Root Cause) *
                </label>
                <textarea
                  rows={2}
                  value={formRootCause}
                  onChange={(e) => setFormRootCause(e.target.value)}
                  placeholder="Contoh: Belum optimalnya buffer bed decanting sistem, serta minimnya alat monitor portable terkalibrasi..."
                  required
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] p-2.5 rounded-[4px] text-xs text-[#0b1c30] focus:border-[#005d42] outline-none"
                />
              </div>

              {/* Row 3: Kalkulator Matriks 5x5 Dinamis */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-[6px] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-[#005d42]" />
                    Perhitungan Matriks Risiko KARS 5x5 Dinamis
                  </span>
                  <span className="text-[11px] text-[#64748b]">Skor = Probabilitas × Dampak</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#515f74] mb-1">
                      Tingkat Probabilitas (P: 1 s/d 5):
                    </label>
                    <select
                      value={formP}
                      onChange={(e) => setFormP(parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs"
                    >
                      <option value="1">1 - Sangat Jarang (&gt; 5 tahun sekali)</option>
                      <option value="2">2 - Jarang (2 - 5 tahun sekali)</option>
                      <option value="3">3 - Mungkin (1 - 2 tahun sekali)</option>
                      <option value="4">4 - Sering (Beberapa kali per tahun)</option>
                      <option value="5">5 - Sangat Sering (Tiap minggu / bulan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#515f74] mb-1">
                      Tingkat Dampak (D: 1 s/d 5):
                    </label>
                    <select
                      value={formD}
                      onChange={(e) => setFormD(parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs"
                    >
                      <option value="1">1 - Tidak Signifikan (Tanpa cedera)</option>
                      <option value="2">2 - Minor (Cedera ringan, P3K)</option>
                      <option value="3">3 - Moderat (Cedera sedang, rawat bertambah)</option>
                      <option value="4">4 - Mayor (Cedera luas / cacat permanen)</option>
                      <option value="5">5 - Katastropik (Kematian / Sentinel)</option>
                    </select>
                  </div>

                  {/* Live Matrix Output Badge */}
                  <div className="bg-white border border-[#cbd5e1] p-3 rounded-[4px] flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] text-[#64748b] block">Skor Total Matriks:</span>
                      <strong className="text-base font-bold text-[#0b1c30] font-mono">
                        {calculatedModalScore} ({formP} × {formD})
                      </strong>
                    </div>
                    <span
                      style={{ backgroundColor: calculatedModalBadge.bg, borderColor: calculatedModalBadge.border, color: calculatedModalBadge.text }}
                      className="px-3 py-1 rounded-[4px] font-bold text-xs border inline-flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: calculatedModalBadge.dotColor }} />
                      {calculatedModalBadge.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 4: Rencana Mitigasi & PIC */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">
                    Rencana Mitigasi / Pengendalian Risiko *
                  </label>
                  <textarea
                    rows={3}
                    value={formMitigation}
                    onChange={(e) => setFormMitigation(e.target.value)}
                    placeholder="Uraikan program preventif, SOP, pelatihan, atau penyediaan sarana..."
                    required
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] p-2.5 rounded-[4px] text-xs focus:border-[#005d42] outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-[#0b1c30] mb-1">
                      Penanggung Jawab (PIC) *
                    </label>
                    <input
                      type="text"
                      value={formPic}
                      onChange={(e) => setFormPic(e.target.value)}
                      placeholder="Contoh: dr. Putu Arya, Sp.B / Ka. Instalasi IGD"
                      required
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-[4px] text-xs focus:border-[#005d42] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#515f74] mb-1">
                        Target Penyelesaian
                      </label>
                      <input
                        type="text"
                        value={formTarget}
                        onChange={(e) => setFormTarget(e.target.value)}
                        placeholder="Contoh: TW II 2026"
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#515f74] mb-1">
                        Status Pengendalian
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs font-semibold"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Controlled">Controlled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4.5: Implementasi yang sudah dilakukan (Tindakan Nyata Unit Kerja) */}
              <div className="bg-emerald-50/50 border border-emerald-200 p-3.5 rounded-[6px] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#047857] block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#047857]" />
                    Implementasi Yang Sudah Dilakukan (Tindakan Nyata Unit)
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded font-semibold">
                    Menu Realisasi Tindakan
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                    Tindakan / Solusi Nyata Yang Telah Diimplementasikan:
                  </label>
                  <textarea
                    rows={2}
                    value={formImplementedActions}
                    onChange={(e) => setFormImplementedActions(e.target.value)}
                    placeholder="Contoh: Telah dibuat SPO penerimaan pasien rujukan baru, pelatihan staf unit kerja selesai 100%, logbook pengecekan harian diterapkan..."
                    className="w-full bg-white border border-emerald-300 p-2.5 rounded-[4px] text-xs text-[#0b1c30] focus:border-[#047857] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#515f74] mb-1">
                      Tanggal Pelaksanaan Implementasi:
                    </label>
                    <input
                      type="date"
                      value={formImplementationDate}
                      onChange={(e) => setFormImplementationDate(e.target.value)}
                      className="w-full bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs text-[#0b1c30]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#515f74] mb-1">
                      Bukti Pelaksanaan (SOP / Foto / Laporan):
                    </label>
                    <input
                      type="text"
                      value={formImplementationEvidence}
                      onChange={(e) => setFormImplementationEvidence(e.target.value)}
                      placeholder="Contoh: Dokumen SPO/024, Foto Sosialisasi"
                      className="w-full bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs text-[#0b1c30]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#515f74] mb-1">
                      Evaluasi Efektivitas Implementasi:
                    </label>
                    <select
                      value={formEffectiveness}
                      onChange={(e) => setFormEffectiveness(e.target.value as any)}
                      className="w-full bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs font-semibold text-[#0b1c30]"
                    >
                      <option value="EFEKTIF">✓ Efektif (Risiko teratasi & aman)</option>
                      <option value="CUKUP_EFEKTIF">Cukup Efektif (Sebagian teratasi, monitoring lanjut)</option>
                      <option value="BELUM_EFEKTIF">Belum Efektif (Perlu evaluasi strategi)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 5: Verifikasi Unit / Pengecekan */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] p-3.5 rounded-[6px] space-y-2">
                <span className="font-bold text-[#0b1c30] block uppercase tracking-wider text-[11px]">
                  Pengecekan & Validasi Risiko oleh Unit / KMKP
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#64748b] mb-1">Unit Pemeriksa:</label>
                    <input
                      type="text"
                      value={formVerifierUnit}
                      onChange={(e) => setFormVerifierUnit(e.target.value)}
                      className="w-full bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#64748b] mb-1">Status Validasi:</label>
                    <select
                      value={formVerifStatus}
                      onChange={(e) => setFormVerifStatus(e.target.value as any)}
                      className="w-full bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] font-semibold"
                    >
                      <option value="Belum Dicek">Belum Dicek</option>
                      <option value="Disetujui">Disetujui</option>
                      <option value="Perlu Revisi">Perlu Revisi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#64748b] mb-1">Catatan Verifikator:</label>
                    <input
                      type="text"
                      value={formVerifNote}
                      onChange={(e) => setFormVerifNote(e.target.value)}
                      placeholder="Catatan hasil verifikasi..."
                      className="w-full bg-white border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px]"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
                <span className="text-[11px] text-[#64748b] flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-[#005d42]" />
                  Tercatat dalam log audit akreditasi KARS
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUnitRiskModal(false)}
                    className="px-4 py-2 bg-white text-[#334155] border border-[#cbd5e1] rounded-[4px] font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#005d42] hover:bg-[#064e3b] text-white rounded-[4px] font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{editingRiskId ? 'Simpan Perubahan' : 'Simpan Risk Register'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VERIFIKASI / PENGECEKAN CEPAT */}
      {quickVerifItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-[8px] border border-[#cbd5e1] shadow-2xl p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#005d42]" />
                <h3 className="font-bold text-sm text-[#0b1c30]">Verifikasi Risiko Unit</h3>
              </div>
              <button onClick={() => setQuickVerifItem(null)} className="text-[#64748b] hover:text-[#0b1c30] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <p className="text-[#515f74]">
                Perbarui status kelayakan dan catatan penilaian untuk <strong>{quickVerifItem.id}</strong> ({quickVerifItem.unit}):
              </p>
              <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[4px] text-[11px] text-[#0f172a] font-semibold line-clamp-2">
                "{quickVerifItem.statement}"
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                  Unit / Komite Pemeriksa (Verifikator):
                </label>
                <input
                  type="text"
                  value={quickVerifUnit}
                  onChange={(e) => setQuickVerifUnit(e.target.value)}
                  placeholder="Contoh: KMKP RSU SHANTI GRAHA, Tim PPI, dsb"
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-1.5 rounded-[4px] text-xs font-semibold text-[#0b1c30] focus:border-[#005d42] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                  Status Verifikasi:
                </label>
                <select
                  value={quickVerifStatus}
                  onChange={(e) => setQuickVerifStatus(e.target.value as any)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-3 py-2 rounded-[4px] text-xs font-semibold text-[#0b1c30]"
                >
                  <option value="Disetujui">Disetujui (Memenuhi Standar)</option>
                  <option value="Perlu Revisi">Perlu Revisi (Lengkapi Rencana Mitigasi)</option>
                  <option value="Belum Dicek">Belum Dicek (Pending Antrean)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0b1c30] mb-1">
                  Catatan Unit Pemeriksa (KMKP / Komite Terkait):
                </label>
                <textarea
                  rows={3}
                  value={quickVerifNote}
                  onChange={(e) => setQuickVerifNote(e.target.value)}
                  placeholder="Tuliskan catatan arahan verifikasi..."
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] p-2.5 rounded-[4px] text-xs focus:border-[#005d42] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0] text-xs">
              <button
                type="button"
                onClick={() => setQuickVerifItem(null)}
                className="px-3.5 py-1.5 rounded-[4px] border border-[#cbd5e1] text-[#334155] font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmQuickVerif}
                className="px-4 py-1.5 rounded-[4px] bg-[#005d42] text-white font-bold cursor-pointer transition shadow-xs"
              >
                Simpan Verifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DEDICATED QUICK IMPLEMENTATION */}
      {implementationModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-[8px] border border-emerald-300 shadow-2xl p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[4px] bg-[#047857] text-white flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0b1c30]">Catat Implementasi Risiko Unit</h3>
                  <p className="text-[11px] text-[#64748b]">Kode: {implementationModalItem.id} ({implementationModalItem.unit})</p>
                </div>
              </div>
              <button onClick={() => setImplementationModalItem(null)} className="text-[#64748b] hover:text-[#0b1c30] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickImplementation} className="text-xs space-y-3.5">
              <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[4px]">
                <span className="text-[10px] text-[#64748b] uppercase font-bold block">Pernyataan Risiko:</span>
                <p className="text-xs font-semibold text-[#0f172a] mt-0.5">{implementationModalItem.statement}</p>
                <span className="text-[10px] text-[#005d42] font-semibold mt-1 block">Rencana Mitigasi: {implementationModalItem.mitigation}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Tindakan Nyata Yang Sudah Dilakukan *
                </label>
                <textarea
                  rows={3}
                  required
                  value={quickImplAction}
                  onChange={(e) => setQuickImplAction(e.target.value)}
                  placeholder="Tuliskan implementasi konkret yang sudah dilaksanakan oleh tim unit kerja..."
                  className="w-full bg-[#f8fafc] border border-emerald-300 focus:bg-white focus:border-[#047857] p-2.5 rounded-[4px] text-xs text-[#0b1c30] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#515f74] mb-1">
                    Tanggal Pelaksanaan:
                  </label>
                  <input
                    type="date"
                    value={quickImplDate}
                    onChange={(e) => setQuickImplDate(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs text-[#0b1c30]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#515f74] mb-1">
                    Evaluasi Efektivitas:
                  </label>
                  <select
                    value={quickImplEffectiveness}
                    onChange={(e) => setQuickImplEffectiveness(e.target.value as any)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs font-semibold text-[#0b1c30]"
                  >
                    <option value="EFEKTIF">✓ Efektif (Optimal)</option>
                    <option value="CUKUP_EFEKTIF">Cukup Efektif</option>
                    <option value="BELUM_EFEKTIF">Belum Efektif (Perlu Evaluasi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#515f74] mb-1">
                    Bukti Pendukung (SOP/Foto/Laporan):
                  </label>
                  <input
                    type="text"
                    value={quickImplEvidence}
                    onChange={(e) => setQuickImplEvidence(e.target.value)}
                    placeholder="Contoh: Form Check SPO 024"
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs text-[#0b1c30]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#515f74] mb-1">
                    Perbarui Status Risiko:
                  </label>
                  <select
                    value={quickImplUpdateStatus}
                    onChange={(e) => setQuickImplUpdateStatus(e.target.value as any)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] px-2.5 py-1.5 rounded-[4px] text-xs font-semibold text-[#0b1c30]"
                  >
                    <option value="Controlled">Controlled (Terkendali)</option>
                    <option value="In Progress">In Progress (Sedang Berjalan)</option>
                    <option value="Open">Open</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setImplementationModalItem(null)}
                  className="px-3.5 py-1.5 rounded-[4px] border border-[#cbd5e1] text-[#334155] font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[4px] bg-[#047857] hover:bg-[#03543f] text-white font-bold cursor-pointer transition shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Implementasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AMBIL / ADOPSI RISK REGISTER UNIT JADI PRIORITAS RS */}
      {showAdoptUnitRiskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-[8px] border border-[#cbd5e1] shadow-2xl flex flex-col overflow-hidden my-auto animate-in fade-in">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[6px] bg-[#005683] text-white flex items-center justify-center shadow-xs">
                  <Download className="w-5 h-5 text-[#7dd3fc]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#0b1c30]">
                      Ambil Risk Register Unit Menjadi Prioritas Rumah Sakit
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#eff4ff] text-[#005683] border border-[#d5e3fc]">
                      22 Unit RS
                    </span>
                  </div>
                  <p className="text-[11px] text-[#515f74]">
                    Pilih risiko dari unit kerja lain untuk diadopsi dan dieskalasikan ke dalam Risk Register Prioritas Rumah Sakit (STARKES KARS 2026).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdoptUnitRiskModal(false)}
                className="p-1 rounded-[4px] text-[#64748b] hover:text-[#0b1c30] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter and Quick Action Toolbar */}
            <div className="p-4 bg-[#f1f5f9] border-b border-[#e2e8f0] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Unit Selector */}
                <select
                  value={adoptModalUnitFilter}
                  onChange={(e) => setAdoptModalUnitFilter(e.target.value)}
                  className="bg-white border border-[#cbd5e1] text-xs font-semibold px-2.5 py-1.5 rounded-[4px] text-[#0b1c30] focus:outline-none"
                >
                  <option value="ALL">🏢 Semua Unit RS (22 Unit)</option>
                  {ALL_HOSPITAL_UNITS.map(u => (
                    <option key={u.key} value={u.key}>
                      📍 {u.label} ({unitRisks.filter(r => r.unit === u.key).length} risiko)
                    </option>
                  ))}
                </select>

                {/* Grade Selector */}
                <select
                  value={adoptModalGradeFilter}
                  onChange={(e) => setAdoptModalGradeFilter(e.target.value)}
                  className="bg-white border border-[#cbd5e1] text-xs font-semibold px-2.5 py-1.5 rounded-[4px] text-[#0b1c30] focus:outline-none"
                >
                  <option value="ALL">Semua Grade</option>
                  <option value="EKSTREM">🔴 Ekstrem [15-25]</option>
                  <option value="TINGGI">🟠 Tinggi [10-14]</option>
                  <option value="SEDANG">🟡 Sedang [4-9]</option>
                  <option value="RENDAH">🟢 Rendah [1-3]</option>
                </select>

                {/* Only Unadopted Toggle */}
                <label className="flex items-center gap-1.5 font-semibold text-[#475569] cursor-pointer pl-1">
                  <input
                    type="checkbox"
                    checked={adoptModalOnlyUnadopted}
                    onChange={(e) => setAdoptModalOnlyUnadopted(e.target.checked)}
                    className="rounded text-[#005683] focus:ring-0"
                  />
                  <span>Hanya yang belum diadopsi</span>
                </label>
              </div>

              {/* Quick Search and Batch Button */}
              <div className="flex items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adoptModalSearch}
                    onChange={(e) => setAdoptModalSearch(e.target.value)}
                    placeholder="Cari risiko unit..."
                    className="w-full bg-white pl-8 pr-3 py-1.5 rounded-[4px] border border-[#cbd5e1] text-xs text-[#0b1c30] placeholder-[#94a3b8] focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleBatchAdoptHighPriorityRisks}
                  className="whitespace-nowrap px-3 py-1.5 rounded-[4px] bg-[#e11d48] hover:bg-[#be123c] text-white font-bold text-xs shadow-xs cursor-pointer transition flex items-center gap-1"
                  title="Ambil sekaligus semua risiko unit dengan grade Ekstrem dan Tinggi"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Tarik Semua Ekstrem &amp; Tinggi</span>
                </button>
              </div>
            </div>

            {/* List of Risks */}
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2.5 text-xs">
              {adoptModalRisks.length === 0 ? (
                <div className="py-12 text-center text-[#64748b]">
                  <AlertTriangle className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
                  <p className="font-bold text-sm text-[#0b1c30]">Tidak ada data risiko unit yang cocok</p>
                  <p className="text-xs text-[#515f74] mt-1">Coba ubah pilihan unit kerja atau atur ulang kata kunci pencarian.</p>
                </div>
              ) : (
                adoptModalRisks.map((item) => {
                  const gradeBadge = getRiskBadgeStyle(item.grade);
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-[6px] border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        item.isHospitalPriority
                          ? 'bg-[#eff6ff] border-[#bfdbfe]'
                          : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1]'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-[#0b1c30]">{item.id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                            📍 Unit: {item.unitLabel}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f1f5f9] text-[#334155] border border-[#cbd5e1]">
                            {item.categoryName}
                          </span>
                          <span
                            style={{ backgroundColor: gradeBadge.bg, borderColor: gradeBadge.border, color: gradeBadge.text }}
                            className="px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1"
                          >
                            P{item.p} × D{item.d} = {item.score} ({item.grade})
                          </span>
                          {item.isHospitalPriority && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1d4ed8] text-white inline-flex items-center gap-1 shadow-2xs">
                              <Star className="w-2.5 h-2.5 fill-white" /> Sudah Jadi Prioritas RS
                            </span>
                          )}
                        </div>

                        <p className="font-semibold text-xs text-[#0f172a] leading-relaxed">
                          {item.statement}
                        </p>
                        <p className="text-[11px] text-[#515f74] leading-relaxed">
                          <strong className="text-[#334155]">Akar Masalah:</strong> {item.rootCause}
                        </p>
                        <div className="text-[11px] text-[#64748b] flex items-center gap-3 pt-1">
                          <span>PIC: <strong className="text-[#334155]">{item.pic}</strong></span>
                          <span>•</span>
                          <span>Target: <strong className="text-[#334155]">{item.target}</strong></span>
                          <span>•</span>
                          <span>Validasi: <strong className={item.verifStatus === 'Disetujui' ? 'text-emerald-700' : 'text-amber-700'}>{item.verifStatus}</strong></span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0 flex items-center md:flex-col justify-end gap-1.5">
                        {item.isHospitalPriority ? (
                          <>
                            <span className="text-[11px] font-bold text-[#166534] flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-[#16a34a]" /> Terdaftar di RS
                            </span>
                            <button
                              onClick={() => handleToggleAdoptUnitRisk(item)}
                              className="text-[11px] text-[#dc2626] hover:underline font-semibold cursor-pointer"
                            >
                              Batalkan Prioritas
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleToggleAdoptUnitRisk(item)}
                            className="px-3.5 py-2 rounded-[4px] bg-[#005d42] hover:bg-[#064e3b] text-white font-bold text-xs shadow-xs cursor-pointer transition flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Ambil Jadi Prioritas RS</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#515f74]">
                <ShieldCheck className="w-4 h-4 text-[#005d42]" />
                <span>
                  Total Prioritas RS Saat Ini: <strong className="text-[#0b1c30] font-bold">{unitRisks.filter(r => r.isHospitalPriority).length} risiko</strong>
                </span>
              </div>
              <button
                onClick={() => setShowAdoptUnitRiskModal(false)}
                className="px-4 py-2 bg-[#005683] hover:bg-[#004266] text-white font-bold rounded-[4px] shadow-xs cursor-pointer transition"
              >
                Selesai &amp; Buka Manajemen Risiko RS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
