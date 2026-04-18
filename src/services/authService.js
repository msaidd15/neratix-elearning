import { deleteApp, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { app, auth, firebaseConfig } from "./firebase";
import { getUserDataByEmail } from "./usersService";

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function loginWithEmailPassword(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  return signOut(auth);
}

export function getCurrentAuthUser() {
  return auth.currentUser;
}

export async function getCurrentUserWithProfile() {
  const user = auth.currentUser;
  if (!user?.email) return null;
  const profile = await getUserDataByEmail(user.email);
  if (!profile) return null;
  return { authUser: user, profile };
}

export async function createStudentAuthAccount(email, password) {
  const secondaryApp = initializeApp(firebaseConfig, `admin-create-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await signOut(secondaryAuth);
    return credential.user;
  } finally {
    await deleteApp(secondaryApp);
  }
}

export function getAuthInstance() {
  return auth;
}

export function getFirebaseApp() {
  return app;
}
