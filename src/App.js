// src/App.js
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import AdminPanel from "./AdminPanel";
import app from "./firebaseConfig";

const auth = getAuth(app);

function Home() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Αίτηση Άδειας</h1>
      <p>Αυτή είναι η αρχική (φόρμα). Το Admin είναι ξεχωριστή σελίδα.</p>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u || null)), []);

  return (
    <BrowserRouter>
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <nav className="flex gap-4">
          <Link to="/">Αρχική</Link>
          <Link to="/admin">Admin</Link>
        </nav>
        <div className="text-sm">
          {user ? (
            <div className="flex items-center gap-3">
              <span>Καλώς ήρθες, {user.email}</span>
              <button onClick={() => signOut(auth)} className="border px-3 py-1 rounded">
                Αποσύνδεση
              </button>
            </div>
          ) : (
            <span>Δεν έχεις συνδεθεί</span>
          )}
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}
