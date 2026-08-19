import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db, createFirebaseAuthUser } from '../lib/firebase';
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
    customPermissions?: Partial<UserProfile['permissions']>,
    additionalData?: { displayName?: string; department?: string; phone?: string; photoURL?: string }
  ) => Promise<void>;
  updateUserProfilePhoto: (uid: string, photoURL: string) => Promise<void>;
  createUserProfile: (
    profileData: {
      email: string;
      password?: string;
      displayName: string;
      role: UserRole;
      status: 'active' | 'pending' | 'disabled';
      department?: string;
      phone?: string;
      photoURL?: string;
      permissions?: Partial<UserProfile['permissions']>;
    }
  ) => Promise<string>;
  deleteUserProfile: (uid: string) => Promise<void>;
  activeRole: UserRole;
  isSimulatingRole: boolean;
  setSimulatedRole: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial fallback staff in case of fresh database or offline
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

  // Listen to Firebase Auth state
  useEffect(() => {
    let profileUnsub: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);

      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const isMainAdmin = 
            firebaseUser.email?.toLowerCase() === 'lachingoneriagrafica@gmail.com' || 
            firebaseUser.email?.toLowerCase().includes('admin');

          // Check if document exists
          const userSnap = await getDoc(userDocRef);

          if (!userSnap.exists()) {
            // First time login: create user in Firestore
            const assignedRole: UserRole = isMainAdmin ? 'admin' : 'gerente';
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || (firebaseUser.email?.split('@')[0] || 'Usuario LCG'),
              photoURL: firebaseUser.photoURL || undefined,
              role: assignedRole,
              status: 'active',
              department: isMainAdmin ? 'Dirección General' : 'Ventas & Cotizaciones',
              permissions: ROLE_DEFAULT_PERMISSIONS[assignedRole],
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            };

            await setDoc(userDocRef, newProfile);

            if (assignedRole === 'admin') {
              await setDoc(doc(db, 'admins', firebaseUser.uid), {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                assignedAt: new Date().toISOString()
              }).catch(() => {});
            }

            setUserProfile(newProfile);
          } else {
            // Existing user: record last login
            const existingData = userSnap.data() as UserProfile;
            setUserProfile(existingData);
            updateDoc(userDocRef, { lastLogin: new Date().toISOString() }).catch(() => {});
          }

          // Real-time listener on active user's document to catch instant role/privilege changes from admin
          profileUnsub = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
              const updatedProfile = snap.data() as UserProfile;
              setUserProfile(updatedProfile);
            }
          }, (err) => {
            console.warn("User profile live sync warning:", err.message);
          });

        } catch (err) {
          console.warn("User profile sync error:", err);
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

    return () => {
      authUnsubscribe();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  // Subscribe in real-time to all users in Firestore for the Admin Dashboard
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
          // Sort by name
          userList.sort((a, b) => a.displayName.localeCompare(b.displayName));
          setAllUsers(userList);
        } else {
          // If Firestore is empty, seed with current user profile
          if (userProfile) {
            setAllUsers([userProfile]);
          }
        }
      },
      (error) => {
        console.warn("Users collection snapshot warning:", error.message);
      }
    );

    return () => unsubscribe();
  }, [currentUser, userProfile]);

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

  // Register with Email & Password directly from the app
  const registerWithEmailPassword = async (
    email: string, 
    password: string, 
    displayName: string, 
    department?: string, 
    phone?: string,
    requestedRole?: UserRole
  ) => {
    try {
      setLoading(true);
      setAuthErrorMessage(null);
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = userCred.user;
      
      const cleanDisplayName = displayName.trim() || email.split('@')[0];
      await updateProfile(firebaseUser, { displayName: cleanDisplayName }).catch(() => {});

      const isMainAdmin = 
        email.trim().toLowerCase() === 'lachingoneriagrafica@gmail.com' || 
        email.trim().toLowerCase().includes('admin');
      
      const assignedRole: UserRole = isMainAdmin ? 'admin' : (requestedRole || 'gerente');

      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || email.trim(),
        displayName: cleanDisplayName,
        role: assignedRole,
        status: 'active',
        department: department?.trim() || (isMainAdmin ? 'Dirección General' : 'Ventas & Cotizaciones'),
        phone: phone?.trim() || '',
        permissions: ROLE_DEFAULT_PERMISSIONS[assignedRole],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);

      if (assignedRole === 'admin') {
        await setDoc(doc(db, 'admins', firebaseUser.uid), {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          assignedAt: new Date().toISOString()
        }).catch(() => {});
      }

      setUserProfile(newProfile);
    } catch (error: any) {
      const code = error?.code || '';
      console.warn("Firebase register code:", code);

      if (code === 'auth/email-already-in-use') {
        setAuthErrorMessage('Este correo electrónico ya está registrado. Por favor selecciona "Iniciar Sesión".');
      } else if (code === 'auth/weak-password') {
        setAuthErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      } else if (code === 'auth/invalid-email') {
        setAuthErrorMessage('El formato de correo electrónico no es válido.');
      } else if (code === 'auth/operation-not-allowed') {
        setAuthErrorMessage('El registro con correo y contraseña no está habilitado en Firebase Auth.');
      } else {
        setAuthErrorMessage(error?.message || 'Error al registrar la cuenta en Firebase.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Demo user login for testing and previewing
  const loginAsDemoUser = (role: UserRole) => {
    setAuthErrorMessage(null);
    const demoUser: UserProfile = {
      uid: 'demo_' + role + '_' + Date.now(),
      email: `${role}@lachingoneria.mx`,
      displayName: role === 'admin' ? 'Super Admin LCG' : role === 'gerente' ? 'Gerente de Ventas' : role === 'disenador' ? 'Diseñador Pre-prensa' : 'Operador de Taller',
      role,
      status: 'active',
      department: role === 'admin' ? 'Dirección General' : role === 'gerente' ? 'Ventas' : role === 'disenador' ? 'Arte & CTP' : 'Taller Offset',
      permissions: ROLE_DEFAULT_PERMISSIONS[role],
    };
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

  // Update role and privileges directly in Firestore
  const updateUserRoleAndPermissions = async (
    uid: string, 
    role: UserRole, 
    status: 'active' | 'pending' | 'disabled',
    customPermissions?: Partial<UserProfile['permissions']>,
    additionalData?: { displayName?: string; department?: string; phone?: string; photoURL?: string }
  ) => {
    const permissions = {
      ...ROLE_DEFAULT_PERMISSIONS[role],
      ...(customPermissions || {})
    };

    const updatePayload: Record<string, any> = {
      role,
      status,
      permissions,
      updatedAt: new Date().toISOString()
    };

    if (additionalData?.displayName) updatePayload.displayName = additionalData.displayName;
    if (additionalData?.department) updatePayload.department = additionalData.department;
    if (additionalData?.phone !== undefined) updatePayload.phone = additionalData.phone;
    if (additionalData?.photoURL !== undefined) updatePayload.photoURL = additionalData.photoURL;

    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updatePayload);

      // Manage /admins/{uid} collection for security rules lookup
      const adminRef = doc(db, 'admins', uid);
      if (role === 'admin') {
        await setDoc(adminRef, {
          uid,
          assignedAt: new Date().toISOString()
        });
      } else {
        await deleteDoc(adminRef).catch(() => {});
      }

    } catch (err) {
      console.warn("Firestore updateDoc fallback to local state:", err);
    }

    // Immediate local state update for fast UI response
    setAllUsers(prev => prev.map(u => {
      if (u.uid === uid) {
        return { 
          ...u, 
          role, 
          status, 
          permissions,
          ...(additionalData || {})
        };
      }
      return u;
    }));

    if (userProfile?.uid === uid) {
      setUserProfile(prev => prev ? { 
        ...prev, 
        role, 
        status, 
        permissions,
        ...(additionalData || {})
      } : null);
    }
  };

  // Update profile photo in Firestore and local state
  const updateUserProfilePhoto = async (uid: string, photoURL: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { 
        photoURL,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Firestore photo update warning:", err);
    }

    setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, photoURL } : u));
    if (userProfile?.uid === uid) {
      setUserProfile(prev => prev ? { ...prev, photoURL } : null);
    }
  };

  // Create new user profile in Firestore (and Firebase Auth if password provided) by Super Admin
  const createUserProfile = async (profileData: {
    email: string;
    password?: string;
    displayName: string;
    role: UserRole;
    status: 'active' | 'pending' | 'disabled';
    department?: string;
    phone?: string;
    photoURL?: string;
    permissions?: Partial<UserProfile['permissions']>;
  }): Promise<string> => {
    let uid = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // If a password was provided by the Super Admin, create real Firebase Auth credentials
    if (profileData.password && profileData.password.length >= 6) {
      try {
        uid = await createFirebaseAuthUser(profileData.email.trim(), profileData.password);
      } catch (authErr: any) {
        console.warn("Firebase Auth user creation warning, using generated UID:", authErr);
        if (authErr?.code === 'auth/email-already-in-use') {
          throw new Error('El correo electrónico ya está registrado en Firebase Authentication.');
        } else if (authErr?.code === 'auth/weak-password') {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        } else {
          throw new Error(authErr?.message || 'Error al crear credenciales en Firebase Auth.');
        }
      }
    }

    const permissions = {
      ...ROLE_DEFAULT_PERMISSIONS[profileData.role],
      ...(profileData.permissions || {})
    };

    const newProfile: UserProfile = {
      uid,
      email: profileData.email.trim(),
      displayName: profileData.displayName.trim(),
      role: profileData.role,
      status: profileData.status,
      department: profileData.department || '',
      phone: profileData.phone || '',
      photoURL: profileData.photoURL || undefined,
      permissions,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', uid), newProfile);

      if (profileData.role === 'admin') {
        await setDoc(doc(db, 'admins', uid), {
          uid,
          email: profileData.email.trim(),
          assignedAt: new Date().toISOString()
        }).catch(() => {});
      }
    } catch (err) {
      console.warn("Firestore user creation warning:", err);
    }

    setAllUsers(prev => [newProfile, ...prev]);
    return uid;
  };

  // Delete user from Firestore
  const deleteUserProfile = async (uid: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'users', uid));
      await deleteDoc(doc(db, 'admins', uid)).catch(() => {});
    } catch (err) {
      console.warn("Firestore user deletion warning:", err);
    }

    setAllUsers(prev => prev.filter(u => u.uid !== uid));
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
        updateUserProfilePhoto,
        createUserProfile,
        deleteUserProfile,
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
