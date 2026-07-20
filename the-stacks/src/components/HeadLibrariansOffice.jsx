import React, { useState } from "react";
import { Plus, PauseCircle, PlayCircle, Ban, Trash2, Crown } from "lucide-react";
import { StaffAPI } from "../api/staffApi.js";

export default function HeadLibrariansOffice({ staff, refreshStaff, notify, currentUser }) {
  const [draft, setDraft] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [confirmTransfer, setConfirmTransfer] = useState(null); // staff member to become new admin

  const canManage = currentUser.role === "manager" || currentUser.role === "admin";
  const canAddManager = currentUser.role === "admin";
  const isAdmin = currentUser.role === "admin";
  // console.log("currentUser:", currentUser);

  async function setStatus(s, status) {
    if (s.role === "admin") { notify("The head librarian's account can't be changed."); return; }
    if (s.id === currentUser.id) { notify("You can't act on your own account."); return; }
    await StaffAPI.setStatus(s.id, status);
    refreshStaff();
    notify(`${s.name} marked ${status}.`);
  }

  async function remove(s) {
    await StaffAPI.remove(s.id);
    setConfirmRemove(null);
    refreshStaff();
    notify(`${s.name} removed from staff records.`);
  }

  async function addStaff(e) {
    e.preventDefault();
    if (staff.some((s) => s.username === draft.username)) { notify("That username is already taken."); return; }
    await StaffAPI.add(draft);
    setDraft(null);
    refreshStaff();
    notify("New staff account created.");
  }

  // Transfers the admin role from currentUser to the selected staff member.
  // The outgoing admin is stepped down to "manager" so there is always exactly one admin.
  async function transferAdmin(target) {
    if (!isAdmin) { notify("Only the current admin can transfer the role."); return; }
    if (target.status !== "active") { notify("Only an active staff member can be promoted to admin."); return; }

    await StaffAPI.setRole(target.id, "admin");
    await StaffAPI.setRole(currentUser.id, "manager");

    setConfirmTransfer(null);
    refreshStaff();
    notify(`${target.name} is now the admin. You've been moved to manager.`);
  }

  return (
    <div className="office-body">
      <div className="office-head">
        <div>
          <div className="eyebrow">Head Librarian's Office</div>
          <h2>Staff records ({staff.length})</h2>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setDraft({ username: "", password: "", name: "", role: "staff" })}>
            <Plus size={14} /> Add Staff Account
          </button>
        )}
      </div>

      <div className="table-wrap">
        <table className="stacks-table">
          <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td style={{ fontFamily: "var(--font-mono)" }}>{s.username}</td>
                <td><span className={`role-pill ${s.role}`}>{s.role}</span></td>
                <td><span className={`stamp ${s.status}`}>{s.status}</span></td>
                <td>
                  {s.role === "admin" ? (
                    <span className="mini-note">protected</span>
                  ) : (
                    <div className="row-actions">
                      {isAdmin && (
                        <button className="btn btn-outline-teal btn-sm" onClick={() => setConfirmTransfer(s)}>
                          <Crown size={12} /> Make Admin
                        </button>
                      )}
                      {s.status !== "suspended" && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setStatus(s, "suspended")}>
                          <PauseCircle size={12} /> Suspend
                        </button>
                      )}
                      {s.status !== "active" && (
                        <button className="btn btn-outline-teal btn-sm" onClick={() => setStatus(s, "active")}>
                          <PlayCircle size={12} /> Reactivate
                        </button>
                      )}
                      {s.status !== "banned" && (
                        <button className="btn btn-danger btn-sm" onClick={() => setStatus(s, "banned")}>
                          <Ban size={12} /> Ban
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => setConfirmRemove(s)}><Trash2 size={12} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {draft && (
        <div className="modal-center" onClick={() => setDraft(null)}>
          <form className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: 22 }} onSubmit={addStaff}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ fontFamily: "var(--font-display)" }}>Add Staff Account</h3>
              <button type="button" className="icon-btn" onClick={() => setDraft(null)}>×</button>
            </div>
            <div className="field"><label>Full name</label><input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div className="field"><label>Username</label><input required value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} /></div>
            <div className="field"><label>Password</label><input required value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} /></div>
            <div className="field">
              <label>Role</label>
              <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
                <option value="staff">Staff</option>
                {canAddManager && <option value="manager">Manager</option>}
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Create account</button>
          </form>
        </div>
      )}

      {confirmRemove && (
        <div className="modal-center" onClick={() => setConfirmRemove(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: 22 }}>
            <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 10 }}>Remove {confirmRemove.name}?</h3>
            <p className="mini-note" style={{ marginBottom: 18 }}>Their account and access will be deleted for good.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmRemove(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => remove(confirmRemove)}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {confirmTransfer && (
        <div className="modal-center" onClick={() => setConfirmTransfer(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: 22 }}>
            <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 10 }}>Make {confirmTransfer.name} the admin?</h3>
            <p className="mini-note" style={{ marginBottom: 18 }}>
              {confirmTransfer.name} will become the new admin. You ({currentUser.name}) will be moved to manager.
              This can't be undone from here — the new admin would need to transfer it back.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmTransfer(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => transferAdmin(confirmTransfer)}>Transfer admin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}