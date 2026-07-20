export const LS_STAFF = "stacks_staff_v1";

export function defaultStaff() {
  return [
    { id: "u-admin", username: "admin", password: "admin123", name: "S. Okafor", role: "admin", status: "active" },
    { id: "u-manager", username: "manager1", password: "manager123", name: "R. Ibe", role: "manager", status: "active" },
    { id: "u-staff", username: "staff1", password: "staff123", name: "T. Aku", role: "staff", status: "active" },
  ];
}

export const StaffAPI = {
  async getAll() {
    const raw = localStorage.getItem(LS_STAFF);
    return raw ? JSON.parse(raw) : [];
  },

  async _save(list) {
    localStorage.setItem(LS_STAFF, JSON.stringify(list));
    return list;
  },

  async add(staff) {
    const list = await this.getAll();
    const id = `u-${Date.now()}`;
    const next = [...list, { ...staff, id, status: "active" }];
    await this._save(next);
    return next;
  },

  async setStatus(id, status) {
    const list = await this.getAll();
    const next = list.map((s) => (s.id === id ? { ...s, status } : s));
    await this._save(next);
    return next;
  },

  async setRole(id, role) {
    const list = await this.getAll();
    const next = list.map((s) => (s.id === id ? { ...s, role } : s));
    await this._save(next);
    return next;
  },

  async remove(id) {
    const list = await this.getAll();
    await this._save(list.filter((s) => s.id !== id));
    return true;
  },

  async authenticate(username, password) {
    const list = await this.getAll();
    const found = list.find((s) => s.username === username && s.password === password);
    return found || null;
  },
};