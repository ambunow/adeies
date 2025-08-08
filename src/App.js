// src/App.js
import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from "./firebaseConfig";
import Login from "./auth/Login";
import Register from "./auth/Register";
import LeaveRequestForm from "./leave/LeaveRequestForm";

export default function App() {
  const auth = getAuth(app);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const container = { padding: 20, maxWidth: 900, margin: "0 auto" };

  return (
    <div style={container}>
      {!user ? (
        <>
          <h1>Σύστημα Αδειών - Adeies</h1>
          <Login />
          <hr />
          <Register />
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1>Καλώς ήρθες, {user.email}</h1>
            <button onClick={handleLogout}>Αποσύνδεση</button>
          </div>

          {/* Φόρμα Αίτησης Άδειας */}
          <LeaveRequestForm user={user} />
        </>
      )}
    </div>
  );
}
