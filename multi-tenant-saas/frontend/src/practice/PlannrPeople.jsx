import React, { useCallback, useEffect, useState } from "react";
import { Plus, Search, ShieldCheck, Trash2, Pencil, RefreshCw, X } from "lucide-react";
import { useAuth } from "../context/authContext";
import { useOrganizations } from "../hooks/useOrganizations";
import apiClient from "../api/client";
import "./PlannrPeople.css";

const roles = ["staff", "manager", "admin"];

export default function PlannrPeoples() {
  const { user, token } = useAuth();
  const { organizations } = useOrganizations();
  const isDeveloper = user?.role === "developer";
  const canManage = ["developer", "admin", "manager"].includes(user?.role);
  const [people, setPeople] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", role: "staff", password: "", hourly_rate: "25", organization_id: user?.organization_id || user?.organizationId || "" });

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await apiClient.get("/employees/all", { headers: { Authorization: `Bearer ${token}` } });
      setPeople(response.data?.employees || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || "Unable to load staff.");
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm({ full_name: "", email: "", phone: "", role: "staff", password: "", hourly_rate: "25", organization_id: user?.organization_id || user?.organizationId || organizations[0]?.id || "" });
    setModal({ mode: "create" });
  };
  const openEdit = (person) => {
    setForm({ full_name: person.full_name || "", email: person.email || "", phone: person.phone || "", role: person.role || "staff", password: "", hourly_rate: String(person.hourly_rate ?? "25"), organization_id: person.organization_id || "" });
    setModal({ mode: "edit", person });
  };
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      if (modal.mode === "create") {
        await apiClient.post("/employees/create", {
          organization_id: form.organization_id, name: form.full_name, email: form.email,
          phone: form.phone || null, role: form.role, password: form.password,
          hourly_rate: form.hourly_rate === "" ? null : Number(form.hourly_rate),
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await apiClient.put(`/employees/update/${encodeURIComponent(modal.person.id)}`, {
          full_name: form.full_name, email: form.email, phone: form.phone,
          role: form.role, hourly_rate: form.hourly_rate === "" ? null : Number(form.hourly_rate),
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      setModal(null); await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || "Unable to save this staff member.");
    } finally { setSaving(false); }
  };
  const remove = async (person) => {
    if (!window.confirm(`Delete ${person.full_name || person.email}? This may be blocked when the account has historical records.`)) return;
    try {
      await apiClient.delete(`/employees/delete/${encodeURIComponent(person.id)}`, { headers: { Authorization: `Bearer ${token}` } });
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || "Unable to delete this staff member.");
    }
  };

  const filtered = people.filter((person) => [person.full_name, person.email, person.role].some((value) => String(value || "").toLowerCase().includes(query.toLowerCase())));

  return (
    <section className="pp-directory">
      <header className="pp-page-heading">
        <div><p className="pp-eyebrow">Workforce</p><h1>People</h1><p>Manage your organization's staff accounts, details and access levels.</p></div>
        {canManage && <button type="button" className="pp-primary-button" onClick={openCreate}><Plus size={16}/> Add staff</button>}
      </header>
      <div className="pp-directory-panel">
        <div className="pp-filters">
          <label className="pp-staff-search"><Search size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email or access level…"/></label>
          <button className="pp-outline-button" type="button" onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</button>
        </div>
        {error && <div className="pp-error" role="alert">{error}</div>}
        <div className="pp-staff-list">
          {loading ? <div className="pp-empty-state">Loading staff…</div> : filtered.map((person) => (
            <article className="pp-live-staff-row" key={person.id}>
              <div className="pp-live-avatar">{person.profile_image_url ? <img src={person.profile_image_url} alt="" /> : (person.full_name || person.email || "U").split(/\s+/).slice(0,2).map((part) => part[0]).join("").toUpperCase()}</div>
              <div className="pp-live-person"><strong>{person.full_name}</strong><span>{person.email}</span><small>{person.phone || "No phone number"} · {person.hourly_rate == null ? "Rate not set" : `Rate ${person.hourly_rate}/hr`}</small></div>
              <span className={`pp-live-role pp-live-role--${person.role}`}><ShieldCheck size={13}/> {person.role}</span>
              {canManage && person.role !== "developer" && <div className="pp-live-actions"><button type="button" onClick={() => openEdit(person)} aria-label="Edit staff"><Pencil size={15}/></button><button type="button" onClick={() => remove(person)} aria-label="Delete staff"><Trash2 size={15}/></button></div>}
            </article>
          ))}
          {!loading && !filtered.length && <div className="pp-empty-state">No staff members found.</div>}
        </div>
      </div>
      {modal && <div className="pp-modal-backdrop" onMouseDown={() => !saving && setModal(null)}>
        <form className="pp-live-modal" onSubmit={save} onMouseDown={(event) => event.stopPropagation()}>
          <header><div><h2>{modal.mode === "create" ? "Add staff member" : "Edit staff member"}</h2><p>Changes apply to this organization's workforce.</p></div><button type="button" onClick={() => setModal(null)}><X size={18}/></button></header>
          <label>Full name<input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} required/></label>
          <label>Email address<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required/></label>
          <label>Phone number<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })}/></label>
          <label>Access level<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>{(isDeveloper ? [...roles, "developer"] : roles).map((role) => <option key={role} value={role}>{role[0].toUpperCase() + role.slice(1)}</option>)}</select></label>
          <label>Hourly rate<input type="number" min="0" step="0.01" value={form.hourly_rate} onChange={(event) => setForm({ ...form, hourly_rate: event.target.value })}/></label>
          {modal.mode === "create" && <label>Temporary password<input type="password" minLength="8" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required/></label>}
          {isDeveloper && modal.mode === "create" && <label>Organization<select value={form.organization_id} onChange={(event) => setForm({ ...form, organization_id: event.target.value })} required>{organizations.map((organization) => <option value={organization.id} key={organization.id}>{organization.name}</option>)}</select></label>}
          {error && <div className="pp-error">{error}</div>}
          <footer><button type="button" className="pp-outline-button" onClick={() => setModal(null)} disabled={saving}>Cancel</button><button type="submit" className="pp-primary-button" disabled={saving}>{saving ? "Saving…" : "Save staff"}</button></footer>
        </form>
      </div>}
    </section>
  );
}
