import { catByKey } from "../data/categories.js";

export const LS_PRODUCTS = "stacks_products_v1";

// Simulates a real backend endpoint: async, returns copies, never leaks
// the raw localStorage reference. This is what GET/POST/PATCH/DELETE
// against a real /products API would look like.
export const ProductAPI = {
  async getAll() {
    await new Promise((r) => setTimeout(r, 120));
    const raw = localStorage.getItem(LS_PRODUCTS);
    return raw ? JSON.parse(raw) : [];
  },

  async _save(list) {
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(list));
    return list;
  },

  async add(product) {
    const list = await this.getAll();
    const id = `${product.type}-${Date.now()}-${Math.floor(Math.random() * 999)}`;
    const cat = catByKey[product.type];
    const sameType = list.filter((p) => p.type === product.type).length;
    const withMeta = {
      ...product,
      id,
      callNumber: `${cat.prefix}-${String(sameType + 1).padStart(3, "0")}`,
    };
    const next = [...list, withMeta];
    await this._save(next);
    return withMeta;
  },

  async update(id, patch) {
    const list = await this.getAll();
    const next = list.map((p) => (p.id === id ? { ...p, ...patch } : p));
    await this._save(next);
    return next.find((p) => p.id === id);
  },

  async remove(id) {
    const list = await this.getAll();
    const next = list.filter((p) => p.id !== id);
    await this._save(next);
    return true;
  },
};
