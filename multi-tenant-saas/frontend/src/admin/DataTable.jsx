// DataTable.jsx — developer database explorer with row CRUD modals

import React, { useEffect, useState, useCallback } from "react";
import {
  Database,
  Table2,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Columns3,
  Rows3,
  AlertCircle,
} from "lucide-react";
import apiClient from "../api/client.js";
import "./DataTable.css";

const EMPTY_DETAILS = { columns: [], rows: [] };

const DataTable = () => {
  const [tables, setTables] = useState([]);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [schemaError, setSchemaError] = useState(null);

  const [selectedTable, setSelectedTable] = useState(null);
  const [tableDetails, setTableDetails] = useState(EMPTY_DETAILS);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  const [tableSearch, setTableSearch] = useState("");

  // Row modal: null | "add" | "edit"
  const [rowModalMode, setRowModalMode] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [rowForm, setRowForm] = useState({});
  const [rowModalLoading, setRowModalLoading] = useState(false);
  const [rowModalError, setRowModalError] = useState("");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'row', id, label }
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Column modal (add column)
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [colName, setColName] = useState("");
  const [colType, setColType] = useState("TEXT");
  const [colNullable, setColNullable] = useState(true);
  const [colDefault, setColDefault] = useState("");
  const [colModalLoading, setColModalLoading] = useState(false);
  const [colModalError, setColModalError] = useState("");

  // --------------------------------------------------
  // Fetch tables
  // --------------------------------------------------
  const fetchTables = useCallback(async () => {
    try {
      setSchemaLoading(true);
      setSchemaError(null);
      const res = await apiClient.get("/developer/database/table-data");
      const schemaTables = Array.isArray(res?.data?.data) ? res.data.data : [];
      setTables(schemaTables);
    } catch (err) {
      setSchemaError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch database schema registry."
      );
    } finally {
      setSchemaLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // --------------------------------------------------
  // Fetch table data
  // --------------------------------------------------
  const handleTableSelect = async (tableName) => {
    if (!tableName) return;
    setSelectedTable(tableName);
    setTableDetails(EMPTY_DETAILS);
    setDataError(null);
    setDataLoading(true);
    setRowModalMode(null);
    setDeleteTarget(null);

    try {
      const res = await apiClient.get(
        `/developer/database/table-data/${tableName}`
      );
      if (res?.data?.success) {
        setTableDetails({
          columns: Array.isArray(res.data.columns) ? res.data.columns : [],
          rows: Array.isArray(res.data.rows) ? res.data.rows : [],
        });
      } else {
        setDataError(res?.data?.message || "Failed to populate table records.");
      }
    } catch (err) {
      setDataError(
        err?.response?.data?.message ||
          err?.message ||
          `Failed to fetch public.${tableName}.`
      );
    } finally {
      setDataLoading(false);
    }
  };

  const refreshTable = () => {
    if (selectedTable) handleTableSelect(selectedTable);
  };

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------
  const formatColumnName = (column) =>
    String(column).replace(/_/g, " ").toUpperCase();

  const formatCellValue = (value) => {
    if (value === null || value === undefined) {
      return <em className="dt-null">null</em>;
    }
    if (typeof value === "object") {
      return (
        <pre className="dt-json">{JSON.stringify(value, null, 2)}</pre>
      );
    }
    if (typeof value === "boolean") return value ? "true" : "false";
    return String(value);
  };

  const primaryKey = (row) => {
    if (row?.id !== undefined && row?.id !== null) return row.id;
    // fallback: first column value
    const first = tableDetails.columns[0];
    return first ? row?.[first] : null;
  };

  const filteredTables = tables.filter((t) => {
    const name = t?.table_name || t?.name || "";
    if (!tableSearch.trim()) return true;
    return name.toLowerCase().includes(tableSearch.toLowerCase().trim());
  });

  // --------------------------------------------------
  // Row modal open / form
  // --------------------------------------------------
  const openAddRow = () => {
    const empty = {};
    tableDetails.columns.forEach((col) => {
      if (col === "id") return; // skip auto id
      empty[col] = "";
    });
    setEditingRow(null);
    setRowForm(empty);
    setRowModalError("");
    setRowModalMode("add");
  };

  const openEditRow = (row) => {
    const form = {};
    tableDetails.columns.forEach((col) => {
      const v = row[col];
      if (v === null || v === undefined) form[col] = "";
      else if (typeof v === "object") form[col] = JSON.stringify(v);
      else form[col] = String(v);
    });
    setEditingRow(row);
    setRowForm(form);
    setRowModalError("");
    setRowModalMode("edit");
  };

  const handleRowFieldChange = (col, value) => {
    setRowForm((prev) => ({ ...prev, [col]: value }));
  };

  const parseFormValue = (raw) => {
    if (raw === "" || raw === undefined) return null;
    const trimmed = String(raw).trim();
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    if (trimmed === "null") return null;
    // try number
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const n = Number(trimmed);
      if (!Number.isNaN(n)) return n;
    }
    // try JSON
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        return JSON.parse(trimmed);
      } catch {
        /* keep string */
      }
    }
    return raw;
  };

  const handleRowSave = async (e) => {
    e.preventDefault();
    if (!selectedTable) return;
    setRowModalError("");
    setRowModalLoading(true);

    try {
      const payload = {};
      Object.keys(rowForm).forEach((col) => {
        if (rowModalMode === "add" && col === "id") return;
        payload[col] = parseFormValue(rowForm[col]);
      });

      if (rowModalMode === "add") {
        await apiClient.post(
          `/developer/database/table-data/${selectedTable}/rows`,
          { data: payload }
        );
      } else {
        const pk = primaryKey(editingRow);
        await apiClient.patch(
          `/developer/database/table-data/${selectedTable}/rows/${pk}`,
          { data: payload }
        );
      }

      setRowModalMode(null);
      await handleTableSelect(selectedTable);
    } catch (err) {
      setRowModalError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to save row."
      );
    } finally {
      setRowModalLoading(false);
    }
  };

  // --------------------------------------------------
  // Delete row
  // --------------------------------------------------
  const confirmDelete = async () => {
    if (!deleteTarget || !selectedTable) return;
    setDeleteLoading(true);
    try {
      await apiClient.delete(
        `/developer/database/table-data/${selectedTable}/rows/${deleteTarget.id}`
      );
      setDeleteTarget(null);
      await handleTableSelect(selectedTable);
    } catch (err) {
      setDataError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete row."
      );
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // --------------------------------------------------
  // Add column
  // --------------------------------------------------
  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!selectedTable || !colName.trim()) {
      setColModalError("Column name is required.");
      return;
    }
    setColModalError("");
    setColModalLoading(true);
    try {
      await apiClient.post(
        `/developer/database/table-data/${selectedTable}/columns`,
        {
          name: colName.trim(),
          type: colType,
          nullable: colNullable,
          defaultValue: colDefault.trim() || null,
        }
      );
      setShowColumnModal(false);
      setColName("");
      setColType("TEXT");
      setColNullable(true);
      setColDefault("");
      await handleTableSelect(selectedTable);
    } catch (err) {
      setColModalError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add column."
      );
    } finally {
      setColModalLoading(false);
    }
  };

  // --------------------------------------------------
  // Loading / error (schema)
  // --------------------------------------------------
  if (schemaLoading) {
    return (
      <div className="dt-page">
        <div className="dt-status">
          <div className="dt-spinner" />
          <p>Connecting to PostgreSQL database...</p>
        </div>
      </div>
    );
  }

  if (schemaError) {
    return (
      <div className="dt-page">
        <div className="dt-status dt-status--error">
          <AlertCircle size={28} />
          <p>Database Error: {schemaError}</p>
          <button type="button" className="dt-btn dt-btn--ghost" onClick={fetchTables}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <div className="dt-page">
      {/* Sidebar */}
      <aside className="dt-sidebar">
        <header className="dt-sidebar__header">
          <div className="dt-sidebar__title-row">
            <Database size={22} className="dt-sidebar__icon" />
            <div>
              <h1>Database</h1>
              <p>PostgreSQL Schema Registry</p>
            </div>
          </div>

          <div className="dt-sidebar__search">
            <Search size={15} />
            <input
              type="text"
              placeholder="Filter tables..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
          </div>
        </header>

        {filteredTables.length === 0 ? (
          <div className="dt-sidebar__empty">No database tables found.</div>
        ) : (
          <div className="dt-sidebar__list">
            {filteredTables.map((table) => {
              const tableName = table?.table_name || table?.name;
              if (!tableName) return null;
              const isActive = selectedTable === tableName;
              return (
                <button
                  key={tableName}
                  type="button"
                  className={`dt-table-btn ${isActive ? "is-active" : ""}`}
                  onClick={() => handleTableSelect(tableName)}
                >
                  <Table2 size={16} />
                  <div>
                    <span className="dt-table-btn__name">{tableName}</span>
                    <span className="dt-table-btn__meta">PostgreSQL relation</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="dt-main">
        {!selectedTable && (
          <div className="dt-empty">
            <div className="dt-empty__icon">
              <Database size={36} />
            </div>
            <h3>No table selected</h3>
            <p>
              Select a PostgreSQL table from the schema registry to inspect its
              columns and records.
            </p>
          </div>
        )}

        {selectedTable && dataLoading && (
          <div className="dt-status">
            <div className="dt-spinner" />
            <p>Loading public.{selectedTable}...</p>
          </div>
        )}

        {selectedTable && !dataLoading && dataError && (
          <div className="dt-status dt-status--error">
            <AlertCircle size={24} />
            <p>Query Error: {dataError}</p>
            <button type="button" className="dt-btn dt-btn--ghost" onClick={refreshTable}>
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}

        {selectedTable && !dataLoading && !dataError && (
          <>
            <div className="dt-view-header">
              <div>
                <h2>
                  <span className="dt-schema">public.</span>
                  {selectedTable}
                </h2>
                <p>PostgreSQL table records</p>
              </div>

              <div className="dt-view-actions">
                <span className="dt-badge">
                  <Rows3 size={14} />
                  {tableDetails.rows.length} records
                </span>
                <span className="dt-badge dt-badge--muted">
                  <Columns3 size={14} />
                  {tableDetails.columns.length} columns
                </span>
                <button
                  type="button"
                  className="dt-btn dt-btn--ghost"
                  onClick={refreshTable}
                  title="Refresh"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  type="button"
                  className="dt-btn dt-btn--ghost"
                  onClick={() => {
                    setColModalError("");
                    setShowColumnModal(true);
                  }}
                >
                  <Plus size={16} />
                  Column
                </button>
                <button
                  type="button"
                  className="dt-btn dt-btn--primary"
                  onClick={openAddRow}
                >
                  <Plus size={16} />
                  Add row
                </button>
              </div>
            </div>

            {tableDetails.rows.length === 0 ? (
              <div className="dt-empty dt-empty--inline">
                <div className="dt-empty__icon">
                  <Rows3 size={32} />
                </div>
                <h3>Empty relation</h3>
                <p>This table exists but currently contains no records.</p>
                <button
                  type="button"
                  className="dt-btn dt-btn--primary"
                  onClick={openAddRow}
                >
                  <Plus size={16} />
                  Insert first row
                </button>
              </div>
            ) : (
              <div className="dt-table-wrap">
                <div className="dt-table-scroll">
                  <table className="dt-table">
                    <thead>
                      <tr>
                        {tableDetails.columns.map((column) => (
                          <th key={column}>{formatColumnName(column)}</th>
                        ))}
                        <th className="dt-th-actions">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableDetails.rows.map((row, rowIndex) => (
                        <tr key={primaryKey(row) ?? rowIndex}>
                          {tableDetails.columns.map((column) => (
                            <td key={column}>{formatCellValue(row[column])}</td>
                          ))}
                          <td className="dt-td-actions">
                            <button
                              type="button"
                              className="dt-icon-btn"
                              title="Edit row"
                              onClick={() => openEditRow(row)}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              className="dt-icon-btn dt-icon-btn--danger"
                              title="Delete row"
                              onClick={() =>
                                setDeleteTarget({
                                  type: "row",
                                  id: primaryKey(row),
                                  label: `row ${primaryKey(row) ?? rowIndex + 1}`,
                                })
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ========== Add / Edit Row Modal ========== */}
      {rowModalMode && (
        <div
          className="dt-modal-overlay"
          onClick={() => setRowModalMode(null)}
        >
          <div
            className="dt-modal dt-modal--wide"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="dt-modal__header">
              <h2>
                {rowModalMode === "add" ? "Insert row" : "Edit row"}
                <span className="dt-modal__sub">public.{selectedTable}</span>
              </h2>
              <button
                type="button"
                className="dt-modal__close"
                onClick={() => setRowModalMode(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRowSave} className="dt-modal__form">
              <div className="dt-form-grid">
                {tableDetails.columns.map((col) => {
                  const isId = col === "id";
                  const skipOnAdd = rowModalMode === "add" && isId;
                  if (skipOnAdd) return null;

                  return (
                    <label key={col} className={isId ? "dt-field--readonly" : ""}>
                      <span>{formatColumnName(col)}</span>
                      <input
                        type="text"
                        value={rowForm[col] ?? ""}
                        onChange={(e) => handleRowFieldChange(col, e.target.value)}
                        disabled={rowModalMode === "edit" && isId}
                        placeholder={
                          isId ? "auto" : "value (or null / true / false / JSON)"
                        }
                      />
                    </label>
                  );
                })}
              </div>

              {rowModalError && (
                <div className="dt-modal__error">{rowModalError}</div>
              )}

              <div className="dt-modal__actions">
                <button
                  type="button"
                  className="dt-btn dt-btn--ghost"
                  onClick={() => setRowModalMode(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dt-btn dt-btn--primary"
                  disabled={rowModalLoading}
                >
                  {rowModalLoading
                    ? "Saving..."
                    : rowModalMode === "add"
                      ? "Insert row"
                      : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== Add Column Modal ========== */}
      {showColumnModal && (
        <div
          className="dt-modal-overlay"
          onClick={() => setShowColumnModal(false)}
        >
          <div
            className="dt-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="dt-modal__header">
              <h2>
                Add column
                <span className="dt-modal__sub">public.{selectedTable}</span>
              </h2>
              <button
                type="button"
                className="dt-modal__close"
                onClick={() => setShowColumnModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddColumn} className="dt-modal__form">
              <label>
                Column name
                <input
                  type="text"
                  value={colName}
                  onChange={(e) => setColName(e.target.value)}
                  placeholder="new_column"
                  autoFocus
                />
              </label>

              <label>
                Data type
                <select
                  value={colType}
                  onChange={(e) => setColType(e.target.value)}
                >
                  <option value="TEXT">TEXT</option>
                  <option value="VARCHAR(255)">VARCHAR(255)</option>
                  <option value="INTEGER">INTEGER</option>
                  <option value="BIGINT">BIGINT</option>
                  <option value="BOOLEAN">BOOLEAN</option>
                  <option value="NUMERIC">NUMERIC</option>
                  <option value="TIMESTAMP">TIMESTAMP</option>
                  <option value="TIMESTAMPTZ">TIMESTAMPTZ</option>
                  <option value="DATE">DATE</option>
                  <option value="JSONB">JSONB</option>
                  <option value="UUID">UUID</option>
                </select>
              </label>

              <label className="dt-checkbox">
                <input
                  type="checkbox"
                  checked={colNullable}
                  onChange={(e) => setColNullable(e.target.checked)}
                />
                Allow NULL
              </label>

              <label>
                Default value (optional)
                <input
                  type="text"
                  value={colDefault}
                  onChange={(e) => setColDefault(e.target.value)}
                  placeholder="e.g. 0 or 'pending'"
                />
              </label>

              {colModalError && (
                <div className="dt-modal__error">{colModalError}</div>
              )}

              <div className="dt-modal__actions">
                <button
                  type="button"
                  className="dt-btn dt-btn--ghost"
                  onClick={() => setShowColumnModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dt-btn dt-btn--primary"
                  disabled={colModalLoading}
                >
                  {colModalLoading ? "Adding..." : "Add column"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== Delete confirm ========== */}
      {deleteTarget && (
        <div
          className="dt-modal-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="dt-modal dt-modal--sm"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="dt-modal__header">
              <h2>Delete row?</h2>
              <button
                type="button"
                className="dt-modal__close"
                onClick={() => setDeleteTarget(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="dt-modal__body">
              <p>
                Permanently delete <strong>{deleteTarget.label}</strong> from{" "}
                <code>public.{selectedTable}</code>? This cannot be undone.
              </p>
            </div>
            <div className="dt-modal__actions" style={{ padding: "0 20px 20px" }}>
              <button
                type="button"
                className="dt-btn dt-btn--ghost"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dt-btn dt-btn--danger"
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
