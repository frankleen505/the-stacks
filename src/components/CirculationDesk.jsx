import React, { useState } from "react";
import { Plus, Pencil, Trash2, ClipboardList } from "lucide-react";
import { CATEGORIES, catByKey } from "../data/categories.js";
import { ProductAPI } from "../api/productApi.js";

function emptyDraft() {
  return { type: "movie", title: "", creator: "", image: "", description: "", price: "", rating: 4.5, stock: 5 };
}

export default function CirculationDesk({ products, refresh, notify }) {
  const [draft, setDraft] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showApi, setShowApi] = useState(false);
  const [apiPreview, setApiPreview] = useState("");

  function openNew() { setDraft(emptyDraft()); setEditingId(null); }
  function openEdit(p) {
    setDraft({
      type: p.type, title: p.title, creator: p.creator, image: p.image,
      description: p.description, price: p.price, rating: p.rating, stock: p.stock,
    });
    setEditingId(p.id);
  }

  async function save(e) {
    e.preventDefault();
    const payload = {
      ...draft,
      price: parseFloat(draft.price) || 0,
      rating: parseFloat(draft.rating) || 0,
      stock: parseInt(draft.stock) || 0,
    };
    if (editingId) {
      await ProductAPI.update(editingId, payload);
      notify("Title updated on the shelf.");
    } else {
      await ProductAPI.add(payload);
      notify("New title catalogued.");
    }
    setDraft(null);
    setEditingId(null);
    refresh();
  }

  async function doDelete(id) {
    await ProductAPI.remove(id);
    setConfirmDelete(null);
    notify("Title withdrawn from circulation.");
    refresh();
  }

  async function previewApi() {
    const list = await ProductAPI.getAll();
    setApiPreview(JSON.stringify({ endpoint: "GET /products", count: list.length, sample: list.slice(0, 2) }, null, 2));
    setShowApi(true);
  }

  return (
    <div className="office-body">
      <div className="office-head">
        <div>
          <div className="eyebrow">Circulation Desk</div>
          <h2>Titles in the collection ({products.length})</h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline-teal" onClick={previewApi}><ClipboardList size={14} /> Preview API</button>
          <button className="btn btn-primary" onClick={openNew}><Plus size={14} /> Add Title</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="stacks-table">
          <thead>
            <tr><th>Call No.</th><th>Title</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{p.callNumber}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.title}</div>
                  <div className="mini-note">{p.creator}</div>
                </td>
                <td><span className="eyebrow" style={{ color: catByKey[p.type].color }}>{catByKey[p.type].label}</span></td>
                <td style={{ fontFamily: "var(--font-mono)" }}>${p.price.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}><Pencil size={12} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(p)}><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6}><div className="empty-state">No titles yet — add the first one.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showApi && (
        <div className="modal-center" onClick={() => setShowApi(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <h3 style={{ fontFamily: "var(--font-display)" }}>API Preview</h3>
              <button className="icon-btn" onClick={() => setShowApi(false)}>×</button>
            </div>
            <p className="mini-note" style={{ marginBottom: 10 }}>
              This is what the storefront receives when it calls ProductAPI.getAll() — the same function
              backs both the site and this desk.
            </p>
            <div className="api-console">{apiPreview}</div>
          </div>
        </div>
      )}

      {draft && (
        <div className="modal-center" onClick={() => setDraft(null)}>
          <form className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: 22 }} onSubmit={save}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ fontFamily: "var(--font-display)" }}>{editingId ? "Edit Title" : "Add Title"}</h3>
              <button type="button" className="icon-btn" onClick={() => setDraft(null)}>×</button>
            </div>
            <div className="field">
              <label>Category</label>
              <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div className="field"><label>Title</label><input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
            <div className="field"><label>Creator</label><input required value={draft.creator} onChange={(e) => setDraft({ ...draft, creator: e.target.value })} /></div>
            <div className="field"><label>Cover image URL (optional)</label><input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} placeholder="https://…" /></div>
            <div className="field"><label>Description</label><textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
            <div className="field-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div className="field"><label>Price ($)</label><input type="number" step="0.01" required value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} /></div>
              <div className="field"><label>Rating</label><input type="number" step="0.1" max="5" min="0" value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: e.target.value })} /></div>
              <div className="field"><label>Stock</label><input type="number" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} /></div>
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
              {editingId ? "Save changes" : "Add to collection"}
            </button>
          </form>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-center" onClick={() => setConfirmDelete(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: 22 }}>
            <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 10 }}>Withdraw this title?</h3>
            <p className="mini-note" style={{ marginBottom: 18 }}>"{confirmDelete.title}" will be removed from the storefront immediately.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => doDelete(confirmDelete.id)}>Withdraw</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
