import React, { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, Lock, RefreshCcw, Info, Menu, X } from "lucide-react";
import { CATEGORIES, catByKey } from "../data/categories.js";
import ProductCard from "./ProductCard.jsx";

export default function Storefront({
  activeCat, setActiveCat, query, setQuery, catCounts, filtered, loading,
  cartCount, onOpenCart, onGoToGate, onOpenDetail, onAddToCart,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (menuOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [menuOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  return (
    <>
      <div className={`menu-overlay ${menuOpen ? "visible" : ""}`} onClick={() => setMenuOpen(false)} />
      <header className="hdr">
        <div className="hdr-row">
          <div className="logo">StarkNova<small>Est. Circulation · Vol. 01</small></div>
          <button className="hamburger" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className={`hdr-mobile ${menuOpen ? "open" : ""}`}>
            <nav className="tabs">
              <button className={`tab ${activeCat === "all" ? "active" : ""}`} onClick={() => { setActiveCat("all"); setMenuOpen(false); }}>All</button>
              {CATEGORIES.map((c) => (
                <button key={c.key} className={`tab ${activeCat === c.key ? "active" : ""}`} onClick={() => { setActiveCat(c.key); setMenuOpen(false); }}>
                  {c.label}
                </button>
              ))}
            </nav>
            <div className="search-box">
              <Search size={14} color="var(--text-muted)" />
              <input ref={searchRef} placeholder="Search titles, creators…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <button className="icon-btn" onClick={onOpenCart}>
              <ShoppingCart size={17} />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </button>
            <button className="staff-link" onClick={onGoToGate}><Lock size={12} /> Staff Entrance</button>
          </div>
          <button className="cart-fab" onClick={onOpenCart}>
            <ShoppingCart size={17} />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow">A lending archive, open to browsing</div>
        <h1>My stories worth<br /><em>checking out.</em></h1>
        <p className="lede">
          Films, manga, books and comics — catalogued, shelved and ready for your cart.
          Every title is real, pulled from the open archive, not stock photos.
        </p>
        <div className="drawer-tabs">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.key}
                className="drawer-tab"
                onClick={() => {
                  setActiveCat(c.key);
                  document.getElementById("catalog-grid")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Icon size={14} color={c.color} />
                {c.label} <span className="count">· {catCounts[c.key] || 0}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="section-wrap" id="catalog-grid">
        <div className="section-head">
          <h2>{activeCat === "all" ? "The full collection" : catByKey[activeCat].label}</h2>
          <span className="mini-note">{filtered.length} title{filtered.length !== 1 ? "s" : ""} on the shelf</span>
        </div>

        {loading ? (
          <div className="empty-state">
            <RefreshCcw size={22} style={{ marginBottom: 10 }} />
            <p>Pulling titles from the archive…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Info size={22} style={{ marginBottom: 10 }} />
            <p>Nothing matches that search. Try another shelf.</p>
          </div>
        ) : (
          <div className="grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={onOpenDetail} onAdd={onAddToCart} />
            ))}
          </div>
        )}
      </section>

      <footer className="footer">Franks E-commerce · A DEMO ARCHIVE · TITLES SOURCED FROM PUBLIC APIS</footer>
    </>
  );
}
