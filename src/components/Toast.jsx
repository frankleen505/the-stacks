import React, { useEffect } from "react";
import { Check } from "lucide-react";

export default function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;
  return (
    <div className="toast">
      <Check size={16} /> {message}
    </div>
  );
}
