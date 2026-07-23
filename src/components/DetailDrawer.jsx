import React, { useState, useEffect } from "react";
import { X, ShoppingCart, Minus, Plus } from "lucide-react";
import { catByKey } from "../data/categories.js";
import { placeholderCover, formatPrice } from "../utils/helpers.js";
import Stars from "./Stars.jsx";

export default function DetailDrawer({ product, onClose, onAdd }) {
  const cat = product ? catByKey[product.type] : null;
  const [src, setSrc] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product) {
      setSrc(product.image || placeholderCover(product.title, cat.color));
      setQty(1);
    }
  }, [product]);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    if (product) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [product, onClose]);

  if (!product) return null;

  const hasTrailer = product.type === "movie" && product.trailerKey;

  return (
    <div className="full-detail-overlay" onClick={onClose}>
      <div className="full-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn full-detail-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="full-detail-media">
          {hasTrailer ? (
            <iframe
              className="full-detail-trailer"
              src={`https://www.youtube.com/embed/${product.trailerKey}`}
              title={`${product.title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img
              src={src}
              onError={() => setSrc(placeholderCover(product.title, cat.color))}
              alt={product.title}
            />
          )}
        </div>

        <div className="full-detail-content">
          <div className="eyebrow" style={{ color: cat.color, marginBottom: 8 }}>
            {cat.label} · {product.callNumber}
          </div>
          <h2 className="full-detail-title">{product.title}</h2>
          <div className="card-creator" style={{ fontSize: 14, marginBottom: 10 }}>{product.creator}</div>
          <Stars value={product.rating} />

          <p className="full-detail-description">{product.description}</p>

          <p className="mini-note" style={{ marginBottom: 22 }}>{product.stock} copies on the shelf</p>

          <div className="full-detail-footer">
            <div className="full-detail-price-row">
              <span className="price" style={{ fontSize: 26 }}>{formatPrice(product.price)}</span>
              <div className="qty-ctrl">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"><Minus size={14} /></button>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, minWidth: 20, textAlign: "center" }}>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} aria-label="Increase quantity"><Plus size={14} /></button>
              </div>
            </div>
            <button className="btn btn-primary full-detail-add-btn" onClick={() => onAdd(product, qty)}>
              <ShoppingCart size={16} /> Add {qty > 1 ? `${qty} ` : ""}to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}