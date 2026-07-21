import React, { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, Lock, RefreshCcw, Info, Menu, X, BookOpen, Film, Sparkles } from "lucide-react";
import { CATEGORIES, catByKey } from "../data/categories.js";
import { placeholderCover } from "../utils/helpers.js";
import ProductCard from "./ProductCard.jsx";

export default function Storefront({
  activeCat, setActiveCat, query, setQuery, catCounts, filtered, loading,
  cartCount, onOpenCart, onGoToGate, onOpenDetail, onAddToCart,
}) {
  const [menuOpen, setMenuOpen] = useState(false);   // hamburger -> category dropdown
  const [searchOpen, setSearchOpen] = useState(false); // search icon -> search panel
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const scrollToGrid = () => {
    document.getElementById("catalog-grid")?.scrollIntoView({ behavior: "smooth" });
  };

  const featured = filtered[0] || null;
  const heroThumbs = filtered.slice(0, 4);

  return (
    <>
      <div
        className={`menu-overlay ${menuOpen || searchOpen ? "visible" : ""}`}
        onClick={() => { setMenuOpen(false); setSearchOpen(false); }}
      />
      <header className="hdr">
        <div className="hdr-row">
          <div className="logo">StarkNova<small></small></div>

          <nav className="tabs tabs-desktop">
            <button className={`tab ${activeCat === "all" ? "active" : ""}`} onClick={() => setActiveCat("all")}>All</button>
            {CATEGORIES.map((c) => (
              <button key={c.key} className={`tab ${activeCat === c.key ? "active" : ""}`} onClick={() => setActiveCat(c.key)}>
                {c.label}
              </button>
            ))}
          </nav>

          <div className="hdr-actions-desktop">
            <div className="search-box">
              <Search size={14} color="var(--text-muted)" />
              <input placeholder="Search titles, creators…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <button className="icon-btn" onClick={onOpenCart}>
              <ShoppingCart size={17} />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </button>
            <button className="staff-link" onClick={onGoToGate}><Lock size={12} /> Staff Entrance</button>
          </div>

          {/* mobile: single row of icons */}
          <div className="hdr-icons-mobile">
            <button
              className="icon-btn"
              onClick={() => { setMenuOpen((o) => !o); setSearchOpen(false); }}
              aria-label="Toggle categories"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <button
              className="icon-btn"
              onClick={() => { setSearchOpen((o) => !o); setMenuOpen(false); }}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button className="icon-btn" onClick={onOpenCart} aria-label="Cart">
              <ShoppingCart size={18} />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </button>
            <button className="icon-btn" onClick={onGoToGate} aria-label="Staff Entrance">
              <Lock size={18} />
            </button>
          </div>
        </div>

        {/* mobile category dropdown */}
        <div className={`mobile-nav-dropdown ${menuOpen ? "open" : ""}`}>
          <button className={`tab ${activeCat === "all" ? "active" : ""}`} onClick={() => { setActiveCat("all"); setMenuOpen(false); }}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c.key} className={`tab ${activeCat === c.key ? "active" : ""}`} onClick={() => { setActiveCat(c.key); setMenuOpen(false); }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* mobile search panel */}
        <div className={`mobile-search-panel ${searchOpen ? "open" : ""}`}>
          <div className="search-box">
            <Search size={14} color="var(--text-muted)" />
            <input
              ref={searchRef}
              placeholder="Search titles, creators…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="eyebrow"></div>
            <h1>Stories worth<br /><em>checking out.</em></h1>
            <p className="lede">
              Films, manga, books and comics — catalogued, shelved and ready for your cart.
              Every title is real, pulled from the open archive, not stock photos.
            </p>

            <div className="hero-cta-row">
              <button className="btn btn-primary" onClick={scrollToGrid}>Browse Catalog</button>
              <button className="btn btn-outline-teal" onClick={() => { setActiveCat("all"); scrollToGrid(); }}>Explore Shelves</button>
            </div>

            {heroThumbs.length > 0 && (
              <div className="hero-thumbs">
                {heroThumbs.map((p) => (
                  <button key={p.id} className="hero-thumb" onClick={() => onOpenDetail(p)} title={p.title}>
                    <img
                      src={p.image || placeholderCover(p.title, catByKey[p.type]?.color)}
                      alt={p.title}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hero-visual">
            <div className="hero-glow" />
            {featured && (
              <div className="hero-cover-float">
                <img
                  src={featured.image || placeholderCover(featured.title, catByKey[featured.type]?.color)}
                  alt={featured.title}
                />
              </div>
            )}
            <div className="floating-icon fi-1"><BookOpen size={18} /></div>
            <div className="floating-icon fi-2"><Film size={16} /></div>
            <div className="floating-icon fi-3"><Sparkles size={14} /></div>
          </div>
        </div>

        <div className="drawer-tabs">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.key}
                className="drawer-tab"
                onClick={() => {
                  setActiveCat(c.key);
                  scrollToGrid();
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

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo">StarkNova<small></small></div>
            <p className="footer-tagline">
              A lending archive for films, manga, books and comics — every title real,
              catalogued and ready for your shelf.
            </p>
          </div>

          <div className="footer-col">
            <h4>Browse</h4>
            <button onClick={() => { setActiveCat("all"); scrollToGrid(); }}>All Titles</button>
            {CATEGORIES.map((c) => (
              <button key={c.key} onClick={() => { setActiveCat(c.key); scrollToGrid(); }}>{c.label}</button>
            ))}
          </div>

          <div className="footer-col">
            <h4>Archive</h4>
            <button onClick={onOpenCart}>Your Cart</button>
            <button onClick={onGoToGate}>Staff Entrance</button>
            <a href="#catalog-grid" onClick={(e) => { e.preventDefault(); scrollToGrid(); }}>Full Collection</a>
          </div>

          <div className="footer-col">
            <h4>About</h4>
            <p className="footer-note">
              This is StarkNova . Titles, covers and pricing are sourced from
              public APIs for demonstration purposes only.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} StarkNova</span>
          <span className="footer-meta">Titles sourced from public APIs</span>
        </div>
      </footer>
    </>
  );
}