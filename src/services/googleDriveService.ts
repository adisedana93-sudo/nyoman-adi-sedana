import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UnitRiskItem } from '../types/clinical';

// Initialize Firebase App instance singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Provider with Drive scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive');

// In-memory token caching
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else if (!user) {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  webViewLink?: string;
}

/**
 * Upload Risk Register backup to Google Drive
 */
export const uploadRiskRegisterToDrive = async (
  risks: UnitRiskItem[],
  customName?: string
): Promise<DriveFileInfo> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Belum terautentikasi dengan Google Drive. Silakan login terlebih dahulu.');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = customName || `Risk_Register_RSU_SHANTI_GRAHA_${timestamp}.json`;
  const fileContent = JSON.stringify(
    {
      institution: 'RSU SHANTI GRAHA',
      exportDate: new Date().toISOString(),
      officer: 'Ns.Nyoman adi Sedana,S.Kep',
      totalRisks: risks.length,
      data: risks
    },
    null,
    2
  );

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: 'Cadangan data Risk Register STARKES Kemenkes RI - RSU SHANTI GRAHA'
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append(
    'file',
    new Blob([fileContent], { type: 'application/json' })
  );

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gagal menyimpan ke Google Drive: ${errorText}`);
  }

  const result: DriveFileInfo = await res.json();
  return result;
};

/**
 * List files saved by this app in Google Drive
 */
export const listDriveRiskBackups = async (): Promise<DriveFileInfo[]> => {
  const token = await getAccessToken();
  if (!token) {
    return [];
  }

  const q = encodeURIComponent("name contains 'Risk_Register_RSU_SHANTI_GRAHA'");
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,createdTime,webViewLink)&orderBy=createdTime desc`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.files || [];
};
