import React from "react";
import { X, ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { catByKey } from "../data/categories.js";
import { placeholderCover } from "../utils/helpers.js";

export default function CartDrawer({ open, cart, products, onClose, onQty, onRemove, onCheckout }) {
  if (!open) return null;

  const items = cart
    .map((c) => ({ ...c, product: products.find((p) => p.id === c.id) }))
    .filter((c) => c.product);
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="side-drawer">
        <div className="drawer-head">
          <h3>Library Cart</h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart size={30} style={{ marginBottom: 10 }} />
              <p>Your cart is empty. Wheel a few titles over.</p>
            </div>
          ) : (
            items.map((i) => {
              const cat = catByKey[i.product.type];
              const img = i.product.image || placeholderCover(i.product.title, cat.color);
              return (
                <div className="cart-line" key={i.id}>
                  <img src={img} alt="" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 14.5, fontWeight: 600 }}>
                      {i.product.title}
                    </div>
                    <div className="mini-note">{i.product.price.toFixed(2)} each</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                      <div className="qty-ctrl">
                        <button onClick={() => onQty(i.id, i.qty - 1)}><Minus size={12} /></button>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{i.qty}</span>
                        <button onClick={() => onQty(i.id, i.qty + 1)}><Plus size={12} /></button>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => onRemove(i.id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {items.length > 0 && (
          <div className="drawer-foot">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontFamily: "var(--font-mono)" }}>
              <span className="mini-note">Total</span>
              <span className="price" style={{ fontSize: 18 }}>N{total.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={onCheckout}>
              Complete Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
