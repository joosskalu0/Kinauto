import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';

import firebaseConfig from '../../firebase-applet-config.json';
import { Vehicle, Lead, DealershipAccount } from '../types';
import { INITIAL_VEHICLES } from '../data/mockVehicles';
import { INITIAL_LEADS } from '../data/mockLeads';
import { INITIAL_DEALERSHIP_ACCOUNTS } from '../data/mockSaas';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore with custom databaseId and auto-detect long polling for reliable connection
const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== ''
  ? firebaseConfig.firestoreDatabaseId
  : '(default)';

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  }, databaseId);
} catch {
  firestoreInstance = getFirestore(app, databaseId);
}

export const db = firestoreInstance;

// --------------------------------------------------------
// FIRESTORE ERROR HANDLING (Per skill specifications)
// --------------------------------------------------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  let currentUserInfo: any = null;
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('congocar_user') : null;
    if (raw) currentUserInfo = JSON.parse(raw);
  } catch (_) {}

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUserInfo?.id ? String(currentUserInfo.id) : undefined,
      email: currentUserInfo?.email,
      emailVerified: true,
      isAnonymous: !currentUserInfo,
      tenantId: undefined,
      providerInfo: []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test initial connection with soft timeout to prevent 10s blocking warnings
export async function testConnection() {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 3000)
    );
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      timeoutPromise
    ]);
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('timeout'))) {
      console.warn("Firestore running in offline / cache resilience mode.");
    }
  }
}
testConnection().catch(() => {});

// --------------------------------------------------------
// VEHICLES FIRESTORE SYNC
// --------------------------------------------------------
export const subscribeVehicles = (callback: (vehicles: Vehicle[]) => void) => {
  const colRef = collection(db, 'vehicles');
  
  return onSnapshot(colRef, async (snapshot) => {
    try {
      if (snapshot.empty) {
        // Seed initial mock vehicles if database is completely empty
        try {
          const batch = writeBatch(db);
          INITIAL_VEHICLES.forEach((v) => {
            const docRef = doc(db, 'vehicles', v.id);
            batch.set(docRef, v);
          });
          await batch.commit();
        } catch (batchErr) {
          console.warn('Could not seed initial vehicles batch to Firestore:', batchErr);
        }
        callback(INITIAL_VEHICLES);
      } else {
        const list: Vehicle[] = [];
        const existingIds = new Set<string>();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Vehicle;
          // Fix any missing dealershipId from legacy seeds
          if (!data.dealershipId) {
            const match = INITIAL_VEHICLES.find((iv) => iv.id === data.id);
            data.dealershipId = match?.dealershipId || 'dealership-1';
          }
          existingIds.add(data.id);
          list.push(data);
        });

        // Automatically sync any missing initial network vehicles
        const missingVehicles = INITIAL_VEHICLES.filter((iv) => !existingIds.has(iv.id));
        if (missingVehicles.length > 0) {
          try {
            const batch = writeBatch(db);
            missingVehicles.forEach((mv) => {
              const docRef = doc(db, 'vehicles', mv.id);
              batch.set(docRef, mv, { merge: true });
              list.push(mv);
            });
            batch.commit().catch((err) => console.warn('Background sync warning:', err));
          } catch (syncErr) {
            console.warn('Background vehicle sync notice:', syncErr);
          }
        }

        callback(list.length > 0 ? list : INITIAL_VEHICLES);
      }
    } catch (processErr) {
      handleFirestoreError(processErr, OperationType.GET, 'vehicles');
      callback(INITIAL_VEHICLES);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'vehicles');
    callback(INITIAL_VEHICLES);
  });
};

export const syncAllVehiclesToFirestore = async (overrideVehicles?: Vehicle[]) => {
  try {
    const listToSync = overrideVehicles || INITIAL_VEHICLES;
    const batch = writeBatch(db);
    listToSync.forEach((v) => {
      const docRef = doc(db, 'vehicles', v.id);
      batch.set(docRef, v, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'vehicles');
  }
};

export const saveVehicleToFirestore = async (vehicle: Vehicle) => {
  try {
    const docRef = doc(db, 'vehicles', vehicle.id);
    await setDoc(docRef, vehicle, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `vehicles/${vehicle.id}`);
  }
};

export const deleteVehicleFromFirestore = async (vehicleId: string) => {
  try {
    const docRef = doc(db, 'vehicles', vehicleId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `vehicles/${vehicleId}`);
  }
};

// --------------------------------------------------------
// LEADS FIRESTORE SYNC
// --------------------------------------------------------
export const subscribeLeads = (callback: (leads: Lead[]) => void) => {
  const colRef = collection(db, 'leads');

  return onSnapshot(colRef, async (snapshot) => {
    try {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_LEADS.forEach((l) => {
            const docRef = doc(db, 'leads', l.id);
            batch.set(docRef, l);
          });
          await batch.commit();
        } catch (batchErr) {
          console.warn('Could not seed leads to Firestore:', batchErr);
        }
        callback(INITIAL_LEADS);
      } else {
        const list: Lead[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Lead);
        });
        callback(list);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'leads');
      callback(INITIAL_LEADS);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'leads');
    callback(INITIAL_LEADS);
  });
};

export const saveLeadToFirestore = async (lead: Lead) => {
  try {
    const docRef = doc(db, 'leads', lead.id);
    await setDoc(docRef, lead, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `leads/${lead.id}`);
  }
};

export const deleteLeadFromFirestore = async (leadId: string) => {
  try {
    const docRef = doc(db, 'leads', leadId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `leads/${leadId}`);
  }
};

// Helper to get and set deleted dealership IDs
export const getDeletedDealershipIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem('autoconcession_deleted_dealership_ids');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
};

export const markDealershipAsDeleted = (id: string) => {
  try {
    const ids = getDeletedDealershipIds();
    ids.add(id);
    localStorage.setItem('autoconcession_deleted_dealership_ids', JSON.stringify(Array.from(ids)));
  } catch (e) {
    console.warn(e);
  }
};

// --------------------------------------------------------
// ACCOUNTS FIRESTORE SYNC (Multi-tenant SaaS)
// --------------------------------------------------------
export const subscribeAccounts = (callback: (accounts: DealershipAccount[]) => void) => {
  const colRef = collection(db, 'accounts');

  return onSnapshot(colRef, async (snapshot) => {
    try {
      const deletedIds = getDeletedDealershipIds();
      if (snapshot.empty) {
        const toSeed = INITIAL_DEALERSHIP_ACCOUNTS.filter((a) => !deletedIds.has(a.id));
        try {
          const batch = writeBatch(db);
          toSeed.forEach((acc) => {
            const docRef = doc(db, 'accounts', acc.id);
            batch.set(docRef, acc);
          });
          await batch.commit();
        } catch (batchErr) {
          console.warn('Could not seed initial accounts to Firestore:', batchErr);
        }
        callback(toSeed);
      } else {
        const list: DealershipAccount[] = [];
        const existingIds = new Set<string>();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as DealershipAccount;
          if (!deletedIds.has(data.id)) {
            existingIds.add(data.id);
            list.push(data);
          }
        });

        // Filter out deleted IDs from initial seeds
        const missingAccounts = INITIAL_DEALERSHIP_ACCOUNTS.filter(
          (ia) => !existingIds.has(ia.id) && !deletedIds.has(ia.id)
        );
        if (missingAccounts.length > 0) {
          try {
            const batch = writeBatch(db);
            missingAccounts.forEach((ma) => {
              const docRef = doc(db, 'accounts', ma.id);
              batch.set(docRef, ma, { merge: true });
              list.push(ma);
            });
            batch.commit().catch((err) => console.warn('Account sync warning:', err));
          } catch (syncErr) {
            console.warn('Account background sync notice:', syncErr);
          }
        }

        callback(list.length > 0 ? list : INITIAL_DEALERSHIP_ACCOUNTS.filter((a) => !deletedIds.has(a.id)));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'accounts');
      const deletedIds = getDeletedDealershipIds();
      callback(INITIAL_DEALERSHIP_ACCOUNTS.filter((a) => !deletedIds.has(a.id)));
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'accounts');
    const deletedIds = getDeletedDealershipIds();
    callback(INITIAL_DEALERSHIP_ACCOUNTS.filter((a) => !deletedIds.has(a.id)));
  });
};

export const saveAccountToFirestore = async (account: DealershipAccount) => {
  try {
    const docRef = doc(db, 'accounts', account.id);
    await setDoc(docRef, account, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `accounts/${account.id}`);
  }
};

export const deleteAccountFromFirestore = async (accountId: string) => {
  try {
    markDealershipAsDeleted(accountId);
    const docRef = doc(db, 'accounts', accountId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `accounts/${accountId}`);
  }
};

export const deleteDealershipAndVehicles = async (dealershipId: string, vehiclesList: Vehicle[] = []) => {
  try {
    markDealershipAsDeleted(dealershipId);
    const batch = writeBatch(db);
    
    // Delete account doc
    const accDocRef = doc(db, 'accounts', dealershipId);
    batch.delete(accDocRef);

    // Delete all vehicles belonging to this dealership if list provided
    const toDelete = vehiclesList.filter((v) => v.dealershipId === dealershipId);
    toDelete.forEach((v) => {
      const vDocRef = doc(db, 'vehicles', v.id);
      batch.delete(vDocRef);
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `accounts/${dealershipId}`);
  }
};

// --------------------------------------------------------
// AUTHENTICATION (Migrated from Firebase Auth to Node.js + MySQL + JWT)
// --------------------------------------------------------
import { authApi, setAuthToken, removeAuthToken } from '../services/api';

export const loginAdmin = async (email: string, pass: string) => {
  const res = await authApi.login({ email, password: pass });
  if (res.success && res.data?.token) {
    setAuthToken(res.data.token);
    localStorage.setItem('congocar_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const registerAdmin = async (email: string, pass: string) => {
  const res = await authApi.register({
    name: email.split('@')[0],
    email,
    password: pass,
    role: 'admin'
  });
  if (res.success && res.data?.token) {
    setAuthToken(res.data.token);
    localStorage.setItem('congocar_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const logoutAdmin = async () => {
  try {
    await authApi.logout();
  } catch (_) {}
  removeAuthToken();
};

export const subscribeAuth = (callback: (user: any | null) => void) => {
  const saved = localStorage.getItem('congocar_user');
  if (saved) {
    try {
      callback(JSON.parse(saved));
    } catch {
      callback(null);
    }
  } else {
    callback(null);
  }
  return () => {};
};
