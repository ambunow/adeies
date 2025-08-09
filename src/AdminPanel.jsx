// src/AdminPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import app, { db } from "./firebaseConfig"; // ✅ χρησιμοποιούμε το δικό σου αρχείο

const auth = getAuth(app);

function useCurrentRole() {
  const [role, setRole] = useState("loading");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      if (!u) {
        setRole("anonymous");
        return;
      }
      try {
        const snap = await getDocs(collection(db, "users"));
        let r = "user";
        snap.forEach((d) => {
          if (d.id === u.uid && d.data()?.role) r = d.data().role;
        });
        setRole(r);
      } catch (e) {
        console.error(e);
        setRole("user");
      }
    });
    return () => unsub();
  }, []);

  return { user, role, loading: role === "loading" };
}

function ListSection({ title, colName, schema }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(() =>
    schema.reduce((acc, f) => ({ ...acc, [f.name]: f.default ?? "" }), {})
  );

  const colRef = useMemo(() => collection(db, colName), [colName]);

  const load = async () => {
    const snap = await getDocs(colRef);
    const data = [];
    snap.forEach((d) => data.push({ id: d.id, ...d.data() }));
    setItems(data);
  };

  useEffect(() => {
    load();
  }, [colName]);

  const onChange = (e, name, type) => {
    const v =
      type === "checkbox" ? e.target.checked : (e.target?.value ?? e ?? "");
    setForm((s) => ({ ...s, [name]: v }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {};
    schema.forEach((f) => {
      const val = form[f.name];
      payload[f.name] = f.type === "checkbox" ? !!val : `${val}`.trim();
    });
    await addDoc(colRef, payload);
    setForm(
      schema.reduce((acc, f) => ({ ...acc, [f.name]: f.default ?? "" }), {})
    );
    await load();
  };

  const onDelete = async (id) => {
    await deleteDoc(doc(db, colName, id));
    await load();
  };

  return (
    <div className="max-w-3xl w-full border rounded-xl p-4 mb-10">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>

      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-3">
        {schema.map((f) => (
          <div key={f.name} className="flex flex-col">
            <label className="text-sm mb-1">{f.label}</label>
            {f.type === "checkbox" ? (
              <input
                type="checkbox"
                checked={!!form[f.name]}
                onChange={(e) => onChange(e, f.name, f.type)}
              />
            ) : (
              <input
                type={f.type || "text"}
                className="border rounded px-3 py-2"
                value={form[f.name]}
                onChange={(e) => onChange(e, f.name, f.type)}
                placeholder={f.placeholder || ""}
                required={f.required !== false}
              />
            )}
          </div>
        ))}
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full border px-4 py-2 rounded bg-black text-white"
          >
            Προσθήκη
          </button>
        </div>
      </form>

      <div className="mt-5">
        {items.length === 0 ? (
          <p className="text-sm text-gray-600">Δεν υπάρχουν εγγραφές ακόμη.</p>
        ) : (
          <ul className="divide-y">
            {items.map((it) => (
              <li
                key={it.id}
                className="py-2 flex items-center justify-between"
              >
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(it, null, 2)}
                </pre>
                <button
                  onClick={() => onDelete(it.id)}
                  className="border px-3 py-1 rounded"
                  title="Διαγραφή"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { user, role, loading } = useCurrentRole();

  if (loading) return <div className="p-6">Φόρτωση…</div>;
  if (!user) return <div className="p-6">Πρέπει να κάνεις σύνδεση.</div>;
  if (role !== "superadmin")
    return <div className="p-6">Δεν έχεις πρόσβαση (superadmin only).</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin • Ρυθμίσεις Λιστών</h1>

      <ListSection
        title="Μονάδες"
        colName="units"
        schema={[
          { name: "name", label: "Ονομασία", placeholder: "π.χ. 482 ΤΔΒ" },
          { name: "code", label: "Κωδικός", placeholder: "π.χ. 482" },
          { name: "city", label: "Πόλη", placeholder: "π.χ. Κιλκίς" },
          { name: "active", label: "Ενεργή;", type: "checkbox", required: false, default: true },
        ]}
      />

      <ListSection
        title="Είδη Άδειας"
        colName="leaveTypes"
        schema={[
          { name: "name", label: "Ονομασία", placeholder: "π.χ. Κανονική" },
          { name: "requiresDateRange", label: "Απαιτεί Ημερομηνίες;", type: "checkbox", required: false, default: true },
          { name: "requiresReplacement", label: "Απαιτεί Αντικαταστάτη;", type: "checkbox", required: false, default: false },
          { name: "active", label: "Ενεργή;", type: "checkbox", required: false, default: true },
        ]}
      />

      <ListSection
        title="Είδη Υπηρεσίας"
        colName="serviceTypes"
        schema={[
          { name: "name", label: "Ονομασία", placeholder: "π.χ. Νυχτερινή" },
          { name: "description", label: "Περιγραφή", placeholder: "π.χ. 22:00–06:00", required: false },
          { name: "active", label: "Ενεργή;", type: "checkbox", required: false, default: true },
        ]}
      />
    </div>
  );
}
