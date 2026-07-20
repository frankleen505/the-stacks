import React, { useState, useEffect, useMemo, useCallback } from "react";

import { CATEGORIES, catByKey } from "./data/categories.js";
import { buildSeedCatalog, fallbackCatalog } from "./data/seed.js";
import { ProductAPI, LS_PRODUCTS } from "./api/productApi.js";
import { StaffAPI, LS_STAFF, defaultStaff } from "./api/staffApi.js";

import Storefront from "./components/Storefront.jsx";
import DetailDrawer from "./components/DetailDrawer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import StaffEntrance from "./components/StaffEntrance.jsx";
import BackOffice from "./components/BackOffice.jsx";
import Toast from "./components/Toast.jsx";

const LS_SESSION = "stacks_session_v1";
const LS_CART = "stacks_cart_v1";

export default function App() {
  const [products, setProducts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState("site"); // 'site' | 'gate' | 'office'
  const [user, setUser] = useState(null);

  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_CART)) || []; } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");

  const notify = useCallback((msg) => setToast(msg), []);

  async function loadProducts() {
    const list = await ProductAPI.getAll();
    setProducts(list);
  }
  async function loadStaff() {
    const list = await StaffAPI.getAll();
    setStaff(list);
  }

  useEffect(() => {
    (async () => {
      if (!localStorage.getItem(LS_STAFF)) {
        localStorage.setItem(LS_STAFF, JSON.stringify(defaultStaff()));
      }
      await loadStaff();

      const existing = localStorage.getItem(LS_PRODUCTS);
      if (existing && JSON.parse(existing).length > 0) {
        setProducts(JSON.parse(existing));
      } else {
        let seed = await buildSeedCatalog();
        if (seed.length === 0) seed = fallbackCatalog();
        localStorage.setItem(LS_PRODUCTS, JSON.stringify(seed));
        setProducts(seed);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_SESSION);
      if (s) {
        const parsed = JSON.parse(s);
        StaffAPI.getAll().then((list) => {
          const found = list.find((u) => u.id === parsed.id);
          if (found && found.status === "active") { setUser(found); setRoute("office"); }
          else localStorage.removeItem(LS_SESSION);
        });
      }
    } catch {}
  }, []);

  useEffect(() => { localStorage.setItem(LS_CART, JSON.stringify(cart)); }, [cart]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCat === "all" || p.type === activeCat;
      const q = query.trim().toLowerCase();
      const matchQ = !q || p.title.toLowerCase().includes(q) || p.creator.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [products, activeCat, query]);

  const catCounts = useMemo(() => {
    const m = {};
    CATEGORIES.forEach((c) => (m[c.key] = 0));
    products.forEach((p) => { m[p.type] = (m[p.type] || 0) + 1; });
    return m;
  }, [products]);

  function addToCart(p, addQty = 1) {
    setCart((cur) => {
      const found = cur.find((c) => c.id === p.id);
      if (found) return cur.map((c) => (c.id === p.id ? { ...c, qty: c.qty + addQty } : c));
      return [...cur, { id: p.id, qty: addQty }];
    });
    notify(addQty > 1 ? `Added ${addQty}× "${p.title}" to your cart.` : `Added "${p.title}" to your cart.`);
    setDetail(null);
  }
  function setQty(id, qty) {
    if (qty <= 0) { setCart((cur) => cur.filter((c) => c.id !== id)); return; }
    setCart((cur) => cur.map((c) => (c.id === id ? { ...c, qty } : c)));
  }
  function removeFromCart(id) { setCart((cur) => cur.filter((c) => c.id !== id)); }
  function checkout() {
    setCart([]);
    setCartOpen(false);
    notify("Checked out — thanks for visiting the stacks.");
  }

  function handleLogin(found) {
    setUser(found);
    localStorage.setItem(LS_SESSION, JSON.stringify({ id: found.id }));
    setRoute("office");
  }
  function handleLogout() {
    setUser(null);
    localStorage.removeItem(LS_SESSION);
    setRoute("site");
  }

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  if (route === "gate") {
    return (
      <div className="stacks-app">
        <StaffEntrance onLogin={handleLogin} onBack={() => setRoute("site")} />
      </div>
    );
  }

  if (route === "office" && user) {
    return (
      <div className="stacks-app">
        <BackOffice
          user={user}
          onLogout={handleLogout}
          products={products}
          refreshProducts={loadProducts}
          staff={staff}
          refreshStaff={loadStaff}
          notify={notify}
        />
        <Toast message={toast} onDone={() => setToast("")} />
      </div>
    );
  }

  return (
    <div className="stacks-app">
      <Storefront
        activeCat={activeCat}
        setActiveCat={setActiveCat}
        query={query}
        setQuery={setQuery}
        catCounts={catCounts}
        filtered={filtered}
        loading={loading}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onGoToGate={() => setRoute("gate")}
        onOpenDetail={setDetail}
        onAddToCart={addToCart}
      />

      <DetailDrawer product={detail} onClose={() => setDetail(null)} onAdd={addToCart} />
      <CartDrawer
        open={cartOpen}
        cart={cart}
        products={products}
        onClose={() => setCartOpen(false)}
        onQty={setQty}
        onRemove={removeFromCart}
        onCheckout={checkout}
      />
      <Toast message={toast} onDone={() => setToast("")} />
    </div>
  );
}