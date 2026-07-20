import React, { useState } from "react";
import { ClipboardList, Users, LogOut } from "lucide-react";
import CirculationDesk from "./CirculationDesk.jsx";
import HeadLibrariansOffice from "./HeadLibrariansOffice.jsx";

export default function BackOffice({ user, onLogout, products, refreshProducts, staff, refreshStaff, notify }) {
  const canSeeStaff = user.role === "manager" || user.role === "admin";
  const [tab, setTab] = useState("desk");

  return (
    <div className="office-shell">
      <div className="office-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="logo" style={{ fontSize: 18 }}>StarkNova</div>
          <span className="role-pill" style={{ borderColor: "var(--ink-line)" }}>{user.name} · {user.role}</span>
        </div>
        <div className="office-nav">
          <button className={tab === "desk" ? "active" : ""} onClick={() => setTab("desk")}>
            <ClipboardList size={13} /> Circulation Desk
          </button>
          {canSeeStaff && (
            <button className={tab === "staff" ? "active" : ""} onClick={() => setTab("staff")}>
              <Users size={13} /> Head Librarian's Office
            </button>
          )}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onLogout}><LogOut size={13} /> Sign out</button>
      </div>

      {tab === "desk" && <CirculationDesk products={products} refresh={refreshProducts} notify={notify} />}
      {tab === "staff" && canSeeStaff && (
        <HeadLibrariansOffice staff={staff} refreshStaff={refreshStaff} notify={notify} currentUser={user} />
      )}
    </div>
  );
}
