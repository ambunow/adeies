import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from "./firebaseConfig";
import Login from "./auth/Login";
import Register from "./auth/Register";

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

  return (
    <div style={{ padding: "20px" }}>
      {!user ? (
        <>
          <h1>Σύστημα Αδειών - Adeies</h1>
          <Login />
          <hr />
          <Register />
        </>
      ) : (
        <>
          <h1>Καλώς ήρθες, {user.email}</h1>
          <button onClick={handleLogout}>Αποσύνδεση</button>
        </>
      )}
    </div>
  );
}
