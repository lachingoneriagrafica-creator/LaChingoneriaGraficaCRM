import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db, testFirestoreConnection } from '../lib/firebase';
import { UserProfile, UserRole, ROLE_DEFAULT_PERMISSIONS } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authErrorMessage: string | null;
  clearAuthError: () => void;
  allUsers: UserProfile[];
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  loginAsDemoUser: (role: UserRole) => void;
  logout: () => Promise<void>;
  updateUserRoleAndPermissions: (
    uid: string, 
    role: UserRole, 
    status: 'active' | 'pending' | 'disabled', 
    customPermissions?: Partial<UserProfile['permissions']>
  ) => Promise<void>;
  activeRole: UserRole;
  isSimulatingRole: boolean;
  setSimulatedRole: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial staff fallback data for preview and local directory
const INITIAL_STAFF: UserProfile[] = [
  {
    uid: 'admin_master_1',
    email: 'lachingoneriagrafica@gmail.com',
    displayName: 'Super Admin LCG',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    role: 'admin',
    status: 'active',
    department: 'Dirección General',
    permissions: ROLE_DEFAULT_PERMISSIONS.admin,
    createdAt: '2023-10-01'
  },
  {
    uid: 'staff_gerente_2',
    email: 'gerencia@lachingoneria.mx',
    displayName: 'Lic. Mariana Soto',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    role: 'gerente',
    status: 'active',
    department: 'Ventas & Cotizaciones',
    permissions: ROLE_DEFAULT_PERMISSIONS.gerente,
    createdAt: '2023-10-05'
  },
  {
    uid: 'staff_diseno_3',
    email: 'arte@lachingoneria.mx',
    displayName: 'Carlos Vega',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: 'disenador',
    status: 'active',
    department: 'Pre-prensa & CTP',
    permissions: ROLE_DEFAULT_PERMISSIONS.disenador,
    createdAt: '2023-10-10'
  },
  {
    uid: 'staff_prod_4',
    email: 'taller@lachingoneria.mx',
    displayName: 'Roberto Mendez',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    role: 'produccion',
    status: 'active',
    department: 'Prensa Offset & Acabados',
    permissions: ROLE_DEFAULT_PERMISSIONS.produccion,
    createdAt: '2023-10-12'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(INITIAL_STAFF[0]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_STAFF);
  const [loading, setLoading] = useState<boolean>(true);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [simulatedRole, setSimulatedRoleState] = useState<UserRole | null>(null);

  const clearAuthError = () => setAuthErrorMessage(null);

  // Test connection on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          const isMainAdmin = 
            firebaseUser.email === 'lachingoneriagrafica@gmail.com' || 
            firebaseUser.email?.includes('admin');

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            setUserProfile(data);
          } else {
            // Create user profile in Firestore if not already existing
            const assignedRole: UserRole = isMainAdmin ? 'admin' : 'gerente';
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || (firebaseUser.email?.split('@')[0] || 'Usuario LCG'),
              photoURL: firebaseUser.photoURL || undefined,
              role: assignedRole,
              status: 'active',
              permissions: ROLE_DEFAULT_PERMISSIONS[assignedRole],
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            };

            await setDoc(userDocRef, newProfile);

            // If main admin, set admin flag document
            if (isMainAdmin) {
              await setDoc(doc(db, 'admins', firebaseUser.uid), {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                assignedAt: new Date().toISOString()
              });
            }

            setUserProfile(newProfile);
          }
        } catch (err) {
          console.warn("User profile sync fallback:", err);
          setUserProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Usuario LCG',
            photoURL: firebaseUser.photoURL || undefined,
            role: 'admin',
            status: 'active',
            permissions: ROLE_DEFAULT_PERMISSIONS.admin,
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to all users in Firestore for the Admin Dashboard
  useEffect(() => {
    if (!currentUser) return;

    const usersCol = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const userList: UserProfile[] = [];
          snapshot.forEach((docSnap) => {
            userList.push(docSnap.data() as UserProfile);
          });
          const merged = [...userList];
          INITIAL_STAFF.forEach(staff => {
            if (!merged.some(u => u.uid === staff.uid || u.email === staff.email)) {
              merged.push(staff);
            }
          });
          setAllUsers(merged);
        }
      },
      (error) => {
        console.warn("Snapshot users listener warning:", error.message);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Login with Email & Password
  const loginWithEmailPassword = async (email: string, password: string) => {
    try {
      setLoading(true);
      setAuthErrorMessage(null);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: any) {
      const code = error?.code || '';
      console.warn("Firebase email auth code:", code);

      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setAuthErrorMessage('Correo electrónico o contraseña incorrectos. Verifica tus credenciales de Firebase.');
      } else if (code === 'auth/invalid-email') {
        setAuthErrorMessage('El formato de correo electrónico no es válido.');
      } else if (code === 'auth/user-disabled') {
        setAuthErrorMessage('Esta cuenta ha sido deshabilitada en Firebase Auth. Contacta al administrador.');
      } else if (code === 'auth/too-many-requests') {
        setAuthErrorMessage('Demasiados intentos fallidos. Por seguridad, espera unos minutos o restablece la contraseña.');
      } else {
        setAuthErrorMessage(error?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Demo user login for testing and previewing
  const loginAsDemoUser = (role: UserRole) => {
    setAuthErrorMessage(null);
    const demoUser = INITIAL_STAFF.find(u => u.role === role) || INITIAL_STAFF[0];
    setUserProfile(demoUser);
    setCurrentUser({
      uid: demoUser.uid,
      email: demoUser.email,
      displayName: demoUser.displayName,
      photoURL: demoUser.photoURL,
      emailVerified: true,
    } as any);
    setSimulatedRoleState(null);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out local fallback");
    }
    setCurrentUser(null);
    setUserProfile(null);
    setSimulatedRoleState(null);
    setAuthErrorMessage(null);
  };

  const updateUserRoleAndPermissions = async (
    uid: string, 
    role: UserRole, 
    status: 'active' | 'pending' | 'disabled',
    customPermissions?: Partial<UserProfile['permissions']>
  ) => {
    const permissions = {
      ...ROLE_DEFAULT_PERMISSIONS[role],
      ...(customPermissions || {})
    };

    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        role,
        status,
        permissions,
        updatedAt: new Date().toISOString()
      });

      // Update admin security collection
      const adminRef = doc(db, 'admins', uid);
      if (role === 'admin') {
        await setDoc(adminRef, {
          uid,
          assignedAt: new Date().toISOString()
        });
      }

    } catch (err) {
      console.warn("Firestore updateDoc fallback to local state:", err);
    }

    // Update local state
    setAllUsers(prev => prev.map(u => {
      if (u.uid === uid) {
        return { ...u, role, status, permissions };
      }
      return u;
    }));

    if (userProfile?.uid === uid) {
      setUserProfile(prev => prev ? { ...prev, role, status, permissions } : null);
    }
  };

  const activeRole: UserRole = simulatedRole || userProfile?.role || 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        authErrorMessage,
        clearAuthError,
        allUsers,
        loginWithEmailPassword,
        loginAsDemoUser,
        logout,
        updateUserRoleAndPermissions,
        activeRole,
        isSimulatingRole: !!simulatedRole,
        setSimulatedRole: setSimulatedRoleState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
