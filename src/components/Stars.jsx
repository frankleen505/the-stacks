import React from "react";
import { Star } from "lucide-react";

export default function Stars({ value }) {
  return (
    <span className="card-rating">
      <Star size={12} fill="currentColor" /> {value.toFixed(1)}
    </span>
  );
}
