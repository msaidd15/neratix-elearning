import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function PrivateRoute() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthed(Boolean(user));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return null;
  }

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
