import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { petPalette } from '../theme/theme';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Firestore rejects undefined values — strip them before any write
function stripUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
}

const EMPTY_STATE = {
  activePetId: null,
  pets: [],
  reminders: [],
  records: [],
};

const PetsCtx = createContext(null);

// ─── Firestore helpers ────────────────────────────────────────────────────────
function petsCol(uid) { return collection(db, 'users', uid, 'pets'); }
function remindersCol(uid) { return collection(db, 'users', uid, 'reminders'); }
function recordsCol(uid) { return collection(db, 'users', uid, 'records'); }
function userDoc(uid) { return doc(db, 'users', uid); }

async function fetchUserState(uid) {
  const [petsSnap, remindersSnap, recordsSnap, userSnap] = await Promise.all([
    getDocs(petsCol(uid)),
    getDocs(remindersCol(uid)),
    getDocs(recordsCol(uid)),
    getDoc(userDoc(uid)),
  ]);

  const pets = petsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const reminders = remindersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const records = recordsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const activePetId = userSnap.exists() ? userSnap.data().activePetId || null : null;

  return { pets, reminders, records, activePetId };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PetsProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [state, setState] = useState(EMPTY_STATE);
  const [ready, setReady] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
        };
        setCurrentUser(user);
        try {
          const userState = await fetchUserState(firebaseUser.uid);
          setState(userState);
        } catch (e) {
          console.warn('Failed to load user data from Firestore', e);
          setState(EMPTY_STATE);
        }
      } else {
        setCurrentUser(null);
        setState(EMPTY_STATE);
      }
      setReady(true);
    });
    return unsub;
  }, []);

  // ── Auth: Login ────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = {
        id: cred.user.uid,
        name: cred.user.displayName || email.split('@')[0],
        email: cred.user.email,
      };
      setCurrentUser(user);
      const userState = await fetchUserState(cred.user.uid);
      setState(userState);
      return { success: true };
    } catch (e) {
      const code = e.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        return { success: false, error: 'No account found with this email. Please create one.' };
      }
      if (code === 'auth/wrong-password') {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
      if (code === 'auth/invalid-email') {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (code === 'auth/too-many-requests') {
        return { success: false, error: 'Too many failed attempts. Please try again later.' };
      }
      return { success: false, error: e.message || 'Login failed' };
    }
  }, []);

  // ── Auth: Register ─────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      const user = { id: cred.user.uid, name, email: cred.user.email };

      // Create the user document in Firestore
      await setDoc(userDoc(cred.user.uid), {
        name,
        email: cred.user.email,
        createdAt: new Date().toISOString(),
        activePetId: null,
      });

      setCurrentUser(user);
      setState(EMPTY_STATE);
      return { success: true };
    } catch (e) {
      const code = e.code || '';
      if (code === 'auth/email-already-in-use') {
        return { success: false, error: 'An account with this email already exists. Please sign in.' };
      }
      if (code === 'auth/invalid-email') {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (code === 'auth/weak-password') {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }
      return { success: false, error: e.message || 'Registration failed' };
    }
  }, []);

  // ── Auth: Logout ───────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await signOut(auth);
    setCurrentUser(null);
    setState(EMPTY_STATE);
  }, []);

  // ── activePetId ────────────────────────────────────────────────────────────
  const setActivePetId = useCallback(async (id) => {
    setState((s) => ({ ...s, activePetId: id }));
    if (currentUser) {
      await setDoc(userDoc(currentUser.id), { activePetId: id }, { merge: true }).catch(() => null);
    }
  }, [currentUser]);

  // ── Pets ───────────────────────────────────────────────────────────────────
  const addPet = useCallback(async (pet) => {
    if (!currentUser) return;
    const color = petPalette[state.pets.length % petPalette.length];
    const newPet = {
      weightHistory: [Number(pet.weight) || 0],
      food: { title: 'Not set yet', desc: 'Add feeding guidance in the pet profile.' },
      exercise: { title: 'Not set yet', desc: 'Add exercise guidance in the pet profile.' },
      nextVet: '—',
      color,
      ...pet,
    };

    const docRef = await addDoc(petsCol(currentUser.id), stripUndefined(newPet));
    const id = docRef.id;

    setState((s) => ({
      ...s,
      pets: [...s.pets, { id, ...newPet }],
      activePetId: id,
    }));

    // Save active pet
    await setDoc(userDoc(currentUser.id), { activePetId: id }, { merge: true }).catch(() => null);

    return id;
  }, [currentUser, state.pets.length]);

  const updatePet = useCallback(async (id, patch) => {
    setState((s) => ({
      ...s,
      pets: s.pets.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, ...patch };
        if (patch.weight != null && Number(patch.weight) !== p.weight) {
          next.weightHistory = [...(p.weightHistory || []), Number(patch.weight)].slice(-8);
        }
        return next;
      }),
    }));

    if (currentUser) {
      const petRef = doc(db, 'users', currentUser.id, 'pets', id);
      await updateDoc(petRef, patch).catch(() => null);
    }
  }, [currentUser]);

  const deletePet = useCallback(async (id) => {
    setState((s) => {
      const pets = s.pets.filter((p) => p.id !== id);
      return {
        ...s,
        pets,
        activePetId: s.activePetId === id ? (pets[0] ? pets[0].id : null) : s.activePetId,
        reminders: s.reminders.filter((r) => r.petId !== id),
        records: s.records.filter((r) => r.petId !== id),
      };
    });

    if (currentUser) {
      await deleteDoc(doc(db, 'users', currentUser.id, 'pets', id)).catch(() => null);
    }
  }, [currentUser]);

  // ── Reminders ─────────────────────────────────────────────────────────────
  const addReminder = useCallback(async (reminder) => {
    const newReminder = { status: 'upcoming', ...reminder };

    if (currentUser) {
      const docRef = await addDoc(remindersCol(currentUser.id), stripUndefined(newReminder)).catch(() => null);
      if (docRef) {
        setState((s) => ({
          ...s,
          reminders: [{ id: docRef.id, ...newReminder }, ...s.reminders],
        }));
        return;
      }
    }

    setState((s) => ({
      ...s,
      reminders: [{ id: uid(), ...newReminder }, ...s.reminders],
    }));
  }, [currentUser]);

  const cycleReminderStatus = useCallback(async (id) => {
    const order = ['overdue', 'upcoming', 'done'];
    let nextStatus;

    setState((s) => ({
      ...s,
      reminders: s.reminders.map((r) => {
        if (r.id !== id) return r;
        const idx = order.indexOf(r.status);
        nextStatus = order[(idx + 1) % order.length];
        return { ...r, status: nextStatus };
      }),
    }));

    if (currentUser && nextStatus) {
      const remRef = doc(db, 'users', currentUser.id, 'reminders', id);
      await updateDoc(remRef, { status: nextStatus }).catch(() => null);
    }
  }, [currentUser]);

  const deleteReminder = useCallback(async (id) => {
    setState((s) => ({ ...s, reminders: s.reminders.filter((r) => r.id !== id) }));
    if (currentUser) {
      await deleteDoc(doc(db, 'users', currentUser.id, 'reminders', id)).catch(() => null);
    }
  }, [currentUser]);

  // ── Records ───────────────────────────────────────────────────────────────
  const addRecord = useCallback(async (record) => {
    if (currentUser) {
      const docRef = await addDoc(recordsCol(currentUser.id), stripUndefined(record)).catch(() => null);
      if (docRef) {
        setState((s) => ({ ...s, records: [{ id: docRef.id, ...record }, ...s.records] }));
        return;
      }
    }
    setState((s) => ({ ...s, records: [{ id: uid(), ...record }, ...s.records] }));
  }, [currentUser]);

  const deleteRecord = useCallback(async (id) => {
    setState((s) => ({ ...s, records: s.records.filter((r) => r.id !== id) }));
    if (currentUser) {
      await deleteDoc(doc(db, 'users', currentUser.id, 'records', id)).catch(() => null);
    }
  }, [currentUser]);

  // ── Context value ──────────────────────────────────────────────────────────
  const value = useMemo(
    () => ({
      ready,
      currentUser,
      login,
      register,
      logout,
      pets: state.pets,
      reminders: state.reminders,
      records: state.records,
      activePetId: state.activePetId || (state.pets[0] && state.pets[0].id),
      setActivePetId,
      addPet,
      updatePet,
      deletePet,
      addReminder,
      cycleReminderStatus,
      deleteReminder,
      addRecord,
      deleteRecord,
    }),
    [
      ready,
      currentUser,
      login,
      register,
      logout,
      state,
      setActivePetId,
      addPet,
      updatePet,
      deletePet,
      addReminder,
      cycleReminderStatus,
      deleteReminder,
      addRecord,
      deleteRecord,
    ]
  );

  return <PetsCtx.Provider value={value}>{children}</PetsCtx.Provider>;
}

export function usePets() {
  const ctx = useContext(PetsCtx);
  if (!ctx) throw new Error('usePets must be used within PetsProvider');
  return ctx;
}
