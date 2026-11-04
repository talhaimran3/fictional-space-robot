import React, { useEffect, useState } from "react";
import { Camera, Save, UserRound } from "lucide-react";
import { useAuth } from "../context/authContext";
import apiClient from "../api/client";
import "./StaffWorkspace.css";

export default function MyProfile() {
  const { token, user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ full_name: "", email: "", phone: "" });
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiClient.get("/employees/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        if (!active) return;
        const employee = response.data?.employee || {};
        setProfile({ full_name: employee.full_name || "", email: employee.email || "", phone: employee.phone || "" });
        setImageUrl(employee.profile_image_url || "");
      })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.error || "Unable to load your profile."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await apiClient.put("/employees/me", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const employee = response.data.employee;
      updateUser({ ...user, name: employee.full_name, full_name: employee.full_name, email: employee.email, phone: employee.phone, profile_image_url: employee.profile_image_url });
      if (file) {
        const upload = await apiClient.put("/employees/me/profile-picture", file, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": file.type },
        });
        setImageUrl(upload.data?.employee?.profile_image_url || "");
        updateUser({ ...user, profile_image_url: upload.data?.employee?.profile_image_url || "" });
        setFile(null);
      }
      setNotice("Your profile has been updated.");
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.response?.data?.message || "Unable to save your profile.");
    } finally { setSaving(false); }
  };

  return (
    <section className="sw-page">
      <header className="sw-heading"><div><p className="sw-eyebrow">Account settings</p><h1>My profile</h1><p>Update the contact details used by your organization.</p></div></header>
      {loading ? <div className="sw-empty">Loading profile…</div> : (
        <form className="sw-profile-card" onSubmit={save}>
          <div className="sw-profile-avatar">
            {imageUrl && !file ? <img src={imageUrl} alt="Profile"/> : <span><UserRound size={36}/></span>}
            <label className="sw-photo-button"><Camera size={15}/> Change photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)}/></label>
            {file && <small>{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</small>}
          </div>
          <div className="sw-profile-fields">
            <label>Full name<input value={profile.full_name} onChange={(event) => setProfile((current) => ({ ...current, full_name: event.target.value }))} required/></label>
            <label>Email address<input type="email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} required/></label>
            <label>Phone number<input value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} placeholder="Add a contact number"/></label>
            <div className="sw-profile-readonly"><span>Account role</span><strong>{user?.role || "Staff"}</strong><small>Role and organization access can only be changed by an authorized administrator.</small></div>
          </div>
          {error && <div className="sw-error">{error}</div>}
          {notice && <div className="sw-success">{notice}</div>}
          <div className="sw-form-actions"><button className="sw-button" disabled={saving || (file && file.size > 5 * 1024 * 1024)}><Save size={16}/>{saving ? "Saving…" : "Save profile"}</button></div>
        </form>
      )}
    </section>
  );
}
