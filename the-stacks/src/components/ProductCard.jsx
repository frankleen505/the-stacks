import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { catByKey } from "../data/categories.js";
import { placeholderCover } from "../utils/helpers.js";
import Stars from "./Stars.jsx";

function ribbonStyle(color) {
  return { borderColor: `${color} ${color} transparent transparent` };
}

export default function ProductCard({ product, onOpen, onAdd }) {
  const cat = catByKey[product.type];
  const [src, setSrc] = useState(product.image || placeholderCover(product.title, cat.color));

  return (
    <div className="card">
      <span className="card-tab">{product.callNumber}</span>
      <span className="card-ribbon" style={ribbonStyle(cat.color)} />
      <div className="cover-wrap" onClick={() => onOpen(product)} style={{ cursor: "pointer" }}>
        <img
          src={src}
          alt={product.title}
          onError={() => setSrc(placeholderCover(product.title, cat.color))}
          loading="lazy"
        />
      </div>
      <div className="card-body">
        <div className="eyebrow" style={{ color: cat.color }}>{cat.label}</div>
        <div className="card-title" onClick={() => onOpen(product)} style={{ cursor: "pointer" }}>{product.title}</div>
        <div className="card-creator">{product.creator}</div>
        <Stars value={product.rating} />
        <div className="card-foot">
          <span className="price">${product.price.toFixed(2)}</span>
          <button className="btn btn-primary btn-sm" onClick={() => onAdd(product)}>
            <ShoppingCart size={13} /> Check Out
          </button>
        </div>
      </div>
    </div>
  );
}
