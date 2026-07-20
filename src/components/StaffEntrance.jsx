import React, { useState } from "react";
import { ChevronLeft, Lock, AlertTriangle } from "lucide-react";
import { StaffAPI } from "../api/staffApi.js";

export default function StaffEntrance({ onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const found = await StaffAPI.authenticate(username.trim(), password);
    setBusy(false);
    if (!found) { setErr("That username and password don't match our records."); return; }
    if (found.status === "banned") { setErr("This account has been banned. Contact the head librarian."); return; }
    if (found.status === "suspended") { setErr("This account is suspended for now. Contact the head librarian."); return; }
    onLogin(found);
  }

  return (
    <div className="gate-wrap">
      <div className="gate-card">
        <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 18 }}>
          <ChevronLeft size={14} /> Back to the stacks
        </button>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Staff Entrance</div>
        <div className="gate-title">Sign the ledger</div>
        <p className="mini-note" style={{ marginBottom: 20 }}>Staff, managers and the head librarian sign in here.</p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {err && (
            <div className="error-text">
              <AlertTriangle size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
              {err}
            </div>
          )}
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 6 }} disabled={busy}>
            <Lock size={13} /> {busy ? "Checking the ledger…" : "Enter"}
          </button>
        </form>
        <div className="demo-box">
          DEMO ACCOUNTS<br />
          admin / admin123 — head librarian<br />
          manager1 / manager123 — manager<br />
          staff1 / staff123 — staff
        </div>
      </div>
    </div>
  );
}
