import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  ExternalLink, 
  LogOut, 
  RefreshCw, 
  ShieldCheck,
  X
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logoutGoogle, 
  uploadRiskRegisterToDrive, 
  listDriveRiskBackups, 
  DriveFileInfo 
} from '../services/googleDriveService';
import { UnitRiskItem } from '../types/clinical';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  risks: UnitRiskItem[];
  onShowToast: (msg: string, type?: 'success' | 'alert') => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  risks,
  onShowToast
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileInfo[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        fetchFiles();
      },
      () => {
        setCurrentUser(null);
        setDriveFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const fetchFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const files = await listDriveRiskBackups();
      setDriveFiles(files);
    } catch (e) {
      console.warn('Gagal memuat file dari Google Drive:', e);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        onShowToast(`Berhasil masuk dengan akun Google: ${result.user.email}`);
        await fetchFiles();
      }
    } catch (e: any) {
      onShowToast(e.message || 'Gagal login dengan Google', 'alert');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setCurrentUser(null);
    setDriveFiles([]);
    onShowToast('Berhasil keluar dari akun Google Drive.');
  };

  // User Confirmation Dialog Requirement before mutation/saving
  const promptUploadBackup = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Konfirmasi Simpan ke Google Drive',
      description: `Apakah Anda ingin mengunggah cadangan data Risk Register (${risks.length} item risiko) ke Google Drive akun ${currentUser?.email}? File ini akan tersimpan aman di akun Google Drive Anda.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        setIsUploading(true);
        try {
          const uploaded = await uploadRiskRegisterToDrive(risks);
          onShowToast(`File cadangan "${uploaded.name}" berhasil disimpan ke Google Drive!`);
          await fetchFiles();
        } catch (e: any) {
          onShowToast(e.message || 'Gagal mengunggah ke Google Drive', 'alert');
        } finally {
          setIsUploading(false);
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[8px] border border-[#cbd5e1] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0b1c30] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Cloud className="w-4 h-4 text-[#7bd8b1]" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Integrasi Google Drive</h3>
              <p className="text-[11px] text-slate-300">Cadangkan & Kelola Berkas Risk Register RSU SHANTI GRAHA</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {!currentUser ? (
            /* Sign in required state */
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#eff4ff] border border-[#bfdbfe] text-[#005683] flex items-center justify-center mx-auto">
                <Cloud className="w-7 h-7" />
              </div>
              <div className="max-w-sm mx-auto">
                <h4 className="font-bold text-sm text-[#0b1c30]">Hubungkan Akun Google Anda</h4>
                <p className="text-[11px] text-[#64748b] mt-1">
                  Sinkronisasikan dan simpan berkas risk register RSU SHANTI GRAHA langsung ke Google Drive Anda secara aman dengan izin akses resmi.
                </p>
              </div>

              {/* Official Google Sign In Button */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="flex items-center gap-3 bg-white hover:bg-slate-50 text-[#374151] border border-[#d1d5db] font-semibold text-xs px-4 py-2.5 rounded-[4px] shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>{isSigningIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged in state */
            <div className="space-y-4">
              {/* User Account Info Bar */}
              <div className="flex items-center justify-between p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px]">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || ''} 
                      className="w-8 h-8 rounded-full border border-slate-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#005d42] text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.displayName?.charAt(0) || 'G'}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-[#0b1c30] text-xs">{currentUser.displayName || 'Pengguna Google'}</p>
                    <p className="text-[11px] text-[#64748b]">{currentUser.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-semibold cursor-pointer px-2 py-1 rounded hover:bg-red-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>

              {/* Action Banner to Backup */}
              <div className="p-3.5 bg-[#ecfdf5] border border-[#a7f3d0] rounded-[6px] flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-[#065f46]">Simpan Cadangan Risk Register</h5>
                  <p className="text-[11px] text-[#047857] mt-0.5">
                    Data aktif saat ini: <strong>{risks.length} item risiko</strong> terdata.
                  </p>
                </div>
                <button
                  onClick={promptUploadBackup}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#005d42] hover:bg-[#064e3b] text-white text-xs font-semibold rounded-[4px] cursor-pointer transition shadow-xs disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isUploading ? 'Menyimpan...' : 'Cadangkan ke Drive'}</span>
                </button>
              </div>

              {/* List of Previous Backups */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-xs text-[#0b1c30] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#515f74]" />
                    <span>Riwayat Cadangan di Google Drive ({driveFiles.length})</span>
                  </h5>
                  <button
                    onClick={fetchFiles}
                    disabled={isLoadingFiles}
                    className="text-[#005683] hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                    <span>Segarkan</span>
                  </button>
                </div>

                {driveFiles.length === 0 ? (
                  <div className="text-center py-5 border border-dashed border-[#cbd5e1] rounded-[6px] text-slate-500 text-[11px]">
                    Belum ada berkas cadangan di Google Drive. Klik tombol "Cadangkan ke Drive" di atas.
                  </div>
                ) : (
                  <div className="border border-[#e2e8f0] rounded-[6px] divide-y divide-[#f1f5f9] max-h-48 overflow-y-auto">
                    {driveFiles.map((file) => (
                      <div key={file.id} className="p-2.5 flex items-center justify-between hover:bg-[#f8fafc] text-xs">
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <FileText className="w-3.5 h-3.5 text-[#005d42] shrink-0" />
                          <div className="truncate">
                            <span className="font-medium text-[#0f172a] block truncate text-[11px]">{file.name}</span>
                            {file.createdTime && (
                              <span className="text-[10px] text-[#64748b]">
                                {new Date(file.createdTime).toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                        </div>

                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#005683] hover:text-[#003b5c] p-1 shrink-0"
                            title="Buka di Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Confirmation Modal Dialog */}
        {confirmDialog && confirmDialog.isOpen && (
          <div className="p-4 bg-[#fff7ed] border-t border-[#fed7aa] text-xs">
            <h5 className="font-bold text-[#9a3412] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#ea580c]" />
              <span>{confirmDialog.title}</span>
            </h5>
            <p className="text-[11px] text-[#7c2d12] mt-1">{confirmDialog.description}</p>
            <div className="flex items-center justify-end gap-2 mt-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-3 py-1.5 border border-[#fed7aa] bg-white text-[#9a3412] font-semibold rounded-[4px] cursor-pointer hover:bg-orange-50"
              >
                Batal
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-3 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold rounded-[4px] cursor-pointer shadow-xs"
              >
                Lanjutkan Simpan
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-5 py-3 flex items-center justify-between text-[11px] text-[#64748b]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#005d42]" />
            <span>Koneksi aman dengan Google Drive API</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#334155] rounded-[4px] font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
