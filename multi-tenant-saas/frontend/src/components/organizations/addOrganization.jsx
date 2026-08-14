import { useState } from "react";
import apiClient from "../../../api/client.js";
import "./addOrganization.css";

export const AddOrganization = () => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNameChange = (event) => {
    const value = event.target.value;
    setName(value);
    if (!slug) {
      const autoSlug = value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/^-+|-+$/g, "");
      setSlug(autoSlug);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");
    if (!name.trim() || !slug.trim()) {
      setError("Company name and slug are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/admin/create-tenant", {
        name: name.trim(),
        slug: slug.trim(),
      });
      setStatus(`Company created: ${response.data.data.name}`);
      setName("");
      setSlug("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || "Unable to create company.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Add New Company</h2>
        <p className="description">
          Fill in the company name and a unique slug to add a new tenant.
        </p>
        <form onSubmit={handleSubmit} className="form">
          <label className="label" htmlFor="company-name">
            Company Name
          </label>
          <input
            id="company-name"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Example Company"
            className="input"
          />

          <label className="label" htmlFor="company-slug">
            Company Slug
          </label>
          <input
            id="company-slug"
            type="text"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="example-company"
            className="input"
          />

          <button type="submit" className="button" disabled={loading}>
            {loading ? "Saving..." : "Create Company"}
          </button>
        </form>
        {status && <div className="success">{status}</div>}
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
};
