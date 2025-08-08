// src/leave/LeaveRequestForm.js
import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const UNITS = ["Μονάδα Α", "Μονάδα Β"]; // TODO: θα έρθουν από Firestore
const RANKS = ["Στρ", "Δεκανέας", "Λοχίας", "Επιλοχίας", "Αλχίας", "Ανθλγός", "Υπλγός", "Λγός"];
const LEAVE_TYPES = [
  "Κανονική",
  "Μικράς Διαρκείας (ΑΜΔ)",
  "Αιμοδοτική",
  "Ειδική",
  "Θανάτου",
  "Γέννησης",
  "Ανατροφής Τέκνου",
  "Απαλλαγή",
  "Αναρρωτική",
  "Ελεύθερος Υπηρεσίας"
];

// TODO: σε επόμενο βήμα θα φορτώνουν δυναμικά από Firestore με βάση Μονάδα.
const COMPANY_COMMANDERS = ["Δκτής Λόχου 1", "Δκτής Λόχου 2"];
const REPLACEMENTS = ["Συνάδελφος Α", "Συνάδελφος Β"];

export default function LeaveRequestForm({ user }) {
  const [form, setForm] = useState({
    unit: "",
    rank: "",
    fullName: "",
    fatherName: "",
    am: "",
    specialty: "",
    city: "",
    requestDate: "",
    days: "",
    leaveType: "",
    leaveCity: "",
    leaveAddress: "",
    phone: "",
    replacement: "",
    remainingAfter: "",
    startDate: "",
    companyCommander: "",
  });

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();

    // απλό validation
    if (!form.unit || !form.rank || !form.fullName || !form.leaveType || !form.startDate) {
      alert("Συμπλήρωσε τουλάχιστον Μονάδα, Βαθμό, Ονοματεπώνυμο, Είδος άδειας και Ημερομηνία έναρξης.");
      return;
    }

    try {
      await addDoc(collection(db, "leaveRequests"), {
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),

        unit: form.unit,
        rank: form.rank,
        fullName: form.fullName,
        fatherName: form.fatherName,
        am: form.am,
        specialty: form.specialty,
        city: form.city,
        requestDate: form.requestDate || null,
        days: form.days ? Number(form.days) : null,
        leaveType: form.leaveType,
        leaveCity: form.leaveCity,
        leaveAddress: form.leaveAddress,
        phone: form.phone,
        replacement: form.replacement,                // θα μπει και στο κείμενο της αναφοράς
        remainingAfter: form.remainingAfter,
        startDate: form.startDate,
        companyCommander: form.companyCommander,      // επιλέγεται από dropdown

        // αρχική ροή εγκρίσεων (θα τη βελτιώσουμε μετά)
        approvals: {
          replacement: "pending",
          companyCommander: "pending",
          deputyCommander: "pending",
          commander: "pending",
          hr: "pending",
        },
        status: "pending"
      });

      alert("Η αίτηση αποθηκεύτηκε!");
      setForm({
        unit: "", rank: "", fullName: "", fatherName: "", am: "",
        specialty: "", city: "", requestDate: "", days: "",
        leaveType: "", leaveCity: "", leaveAddress: "", phone: "",
        replacement: "", remainingAfter: "", startDate: "", companyCommander: "",
      });
    } catch (err) {
      console.error(err);
      alert("Κάτι πήγε στραβά στην αποθήκευση.");
    }
  };

  const input = { margin: "6px 0", padding: 8, width: "100%", maxWidth: 480 };

  return (
    <div>
      <h2>Αίτηση Άδειας</h2>
      <form onSubmit={onSubmit} style={{ maxWidth: 520 }}>
        {/* Μονάδα */}
        <label>Μονάδα</label>
        <select name="unit" value={form.unit} onChange={onChange} style={input}>
          <option value="">-- Επιλογή --</option>
          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>

        {/* Βαθμός */}
        <label>Βαθμός</label>
        <select name="rank" value={form.rank} onChange={onChange} style={input}>
          <option value="">-- Επιλογή --</option>
          {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <label>Ονοματεπώνυμο</label>
        <input name="fullName" value={form.fullName} onChange={onChange} style={input} />

        <label>Πατρώνυμο</label>
        <input name="fatherName" value={form.fatherName} onChange={onChange} style={input} />

        <label>ΑΜ</label>
        <input name="am" value={form.am} onChange={onChange} style={input} />

        <label>Ειδικότητα / Πόστο</label>
        <input name="specialty" value={form.specialty} onChange={onChange} style={input} />

        <label>Πόλη</label>
        <input name="city" value={form.city} onChange={onChange} style={input} />

        <label>Ημερομηνία Αίτησης</label>
        <input type="date" name="requestDate" value={form.requestDate} onChange={onChange} style={input} />

        <label>Ημέρες Άδειας</label>
        <input type="number" min="1" name="days" value={form.days} onChange={onChange} style={input} />

        {/* Είδος Άδειας */}
        <label>Είδος Άδειας</label>
        <select name="leaveType" value={form.leaveType} onChange={onChange} style={input}>
          <option value="">-- Επιλογή --</option>
          {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label>Πόλη κατά την Άδεια</label>
        <input name="leaveCity" value={form.leaveCity} onChange={onChange} style={input} />

        <label>Διεύθυνση κατά την Άδεια</label>
        <input name="leaveAddress" value={form.leaveAddress} onChange={onChange} style={input} />

        <label>Κινητό Τηλέφωνο</label>
        <input name="phone" value={form.phone} onChange={onChange} style={input} />

        {/* Αντικαταστάτης */}
        <label>Αντικαταστάτης</label>
        <select name="replacement" value={form.replacement} onChange={onChange} style={input}>
          <option value="">-- Επιλογή --</option>
          {REPLACEMENTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        {/* Δκτής Λόχου */}
        <label>Δκτής Λόχου</label>
        <select name="companyCommander" value={form.companyCommander} onChange={onChange} style={input}>
          <option value="">-- Επιλογή --</option>
          {COMPANY_COMMANDERS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label>Υπόλοιπο άδειας μετά τη λήψη</label>
        <input name="remainingAfter" value={form.remainingAfter} onChange={onChange} style={input} />

        <label>Ημερομηνία έναρξης άδειας</label>
        <input type="date" name="startDate" value={form.startDate} onChange={onChange} style={input} />

        <button type="submit" style={{ marginTop: 12, padding: "10px 16px" }}>
          Υποβολή Αίτησης
        </button>
      </form>
    </div>
  );
}
