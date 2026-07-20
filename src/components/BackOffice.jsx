import React, { useState } from "react";
import { ClipboardList, Users, LogOut, Menu, X } from "lucide-react";
import CirculationDesk from "./CirculationDesk.jsx";
import HeadLibrariansOffice from "./HeadLibrariansOffice.jsx";

export default function BackOffice({ user, onLogout, products, refreshProducts, staff, refreshStaff, notify }) {
  const canSeeStaff = user.role === "manager" || user.role === "admin";
  const [tab, setTab] = useState("desk");
  const [officeMenuOpen, setOfficeMenuOpen] = useState(false);

  return (
    <div className="office-shell">
      <div className="office-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="logo" style={{ fontSize: 18 }}>StarkNova</div>
          <span className="role-pill" style={{ borderColor: "var(--ink-line)" }}>{user.name} · {user.role}</span>
        </div>
        <button className="office-hamburger" onClick={() => setOfficeMenuOpen((o) => !o)} aria-label="Toggle menu">
          {officeMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <div className={`office-mobile ${officeMenuOpen ? "open" : ""}`}>
          <div className="office-nav">
            <button className={tab === "desk" ? "active" : ""} onClick={() => { setTab("desk"); setOfficeMenuOpen(false); }}>
              <ClipboardList size={13} /> Circulation Desk
            </button>
            {canSeeStaff && (
              <button className={tab === "staff" ? "active" : ""} onClick={() => { setTab("staff"); setOfficeMenuOpen(false); }}>
                <Users size={13} /> Head Librarian's Office
              </button>
            )}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}><LogOut size={13} /> Sign out</button>
        </div>
      </div>

      {tab === "desk" && <CirculationDesk products={products} refresh={refreshProducts} notify={notify} />}
      {tab === "staff" && canSeeStaff && (
        <HeadLibrariansOffice staff={staff} refreshStaff={refreshStaff} notify={notify} currentUser={user} />
      )}
    </div>
  );
}
