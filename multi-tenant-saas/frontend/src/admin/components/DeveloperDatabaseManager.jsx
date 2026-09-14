// src/admin/components/DeveloperDatabaseManager.jsx
import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Database,
  Table as TableIcon,
  Columns,
  Key,
  AlertCircle
} from "lucide-react";
import "./DeveloperDatabaseManager.css";

const DeveloperDatabaseManager = ({
  initialTables = [],
  onTableCreate,
  onTableDelete,
  onColumnCreate,
  onColumnDelete
}) => {
  const [tables, setTables] = useState(initialTables);
  const [selectedTableId, setSelectedTableId] = useState(initialTables[0]?.id || "");
  const [newTableName, setNewTableName] = useState("");
  const [newCol, setNewCol] = useState({ name: "", type: "varchar", key: null });
  const [error, setError] = useState("");

  const activeTable = tables.find((t) => t.id === selectedTableId);

  /* =========================
     TABLE HANDLERS
  ========================= */
  const handleAddTable = async () => {
    setError("");
    const formattedName = newTableName.trim().toLowerCase().replace(/\s+/g, "_");

    if (!formattedName) {
      setError("Table name cannot be empty.");
      return;
    }

    if (tables.some((t) => t.name === formattedName)) {
      setError(`Table "${formattedName}" already exists.`);
      return;
    }

    const newTableObj = {
      id: formattedName,
      name: formattedName,
      rls: false,
      policies: [],
      columns: [{ name: "id", type: "uuid", key: "PK" }]
    };

    setTables((prev) => [...prev, newTableObj]);
    setSelectedTableId(formattedName);
    setNewTableName("");

    if (onTableCreate) onTableCreate(newTableObj);
  };

  const handleDeleteTable = (tableId) => {
    setError("");
    if (!window.confirm(`Are you sure you want to drop table "${tableId}"?`)) return;

    const updatedTables = tables.filter((t) => t.id !== tableId);
    setTables(updatedTables);

    if (selectedTableId === tableId) {
      setSelectedTableId(updatedTables[0]?.id || "");
    }

    if (onTableDelete) onTableDelete(tableId);
  };

  /* =========================
     COLUMN HANDLERS
  ========================= */
  const handleAddColumn = () => {
    setError("");
    const colName = newCol.name.trim().toLowerCase().replace(/\s+/g, "_");

    if (!colName) {
      setError("Column name cannot be empty.");
      return;
    }

    if (!activeTable) return;

    if (activeTable.columns.some((c) => c.name === colName)) {
      setError(`Column "${colName}" already exists in table "${activeTable.name}".`);
      return;
    }

    const updatedColumn = { name: colName, type: newCol.type, key: newCol.key };

    setTables((prev) =>
      prev.map((tbl) =>
        tbl.id === activeTable.id
          ? { ...tbl, columns: [...tbl.columns, updatedColumn] }
          : tbl
      )
    );

    setNewCol({ name: "", type: "varchar", key: null });

    if (onColumnCreate) onColumnCreate(activeTable.id, updatedColumn);
  };

  const handleDeleteColumn = (columnName) => {
    setError("");
    if (!activeTable) return;

    setTables((prev) =>
      prev.map((tbl) =>
        tbl.id === activeTable.id
          ? {
              ...tbl,
              columns: tbl.columns.filter((c) => c.name !== columnName)
            }
          : tbl
      )
    );

    if (onColumnDelete) onColumnDelete(activeTable.id, columnName);
  };

  return (
    <div className="db-manager-container">
      {/* ERROR BANNER */}
      {error && (
        <div className="db-manager-error-banner">
          <AlertCircle size={15} />
          <span>{error}</span>
          <button onClick={() => setError("")}>&times;</button>
        </div>
      )}

      <div className="db-manager-layout">
        {/* SIDEBAR: TABLE LIST */}
        <aside className="db-manager-sidebar">
          <div className="db-sidebar-header">
            <Database size={15} />
            <span>Tables ({tables.length})</span>
          </div>

          <div className="db-add-table-form">
            <input
              type="text"
              placeholder="e.g. shifts"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTable()}
            />
            <button onClick={handleAddTable} title="Create Table">
              <Plus size={14} />
            </button>
          </div>

          <ul className="db-table-list">
            {tables.map((tbl) => (
              <li
                key={tbl.id}
                className={tbl.id === selectedTableId ? "active" : ""}
                onClick={() => setSelectedTableId(tbl.id)}
              >
                <div className="db-table-item-info">
                  <TableIcon size={14} />
                  <span>{tbl.name}</span>
                </div>
                <button
                  className="db-action-danger-btn"
                  title="Drop Table"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTable(tbl.id);
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN PANEL: COLUMN EDITOR */}
        <main className="db-manager-main">
          {activeTable ? (
            <>
              <header className="db-main-header">
                <div>
                  <h2>{activeTable.name}</h2>
                  <p>{activeTable.columns.length} columns defined</p>
                </div>
              </header>

              {/* ADD COLUMN TOOLBAR */}
              <div className="db-add-column-toolbar">
                <div className="db-toolbar-input-group">
                  <input
                    type="text"
                    placeholder="Column name (e.g. user_id)"
                    value={newCol.name}
                    onChange={(e) => setNewCol({ ...newCol, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                  />
                  <select
                    value={newCol.type}
                    onChange={(e) => setNewCol({ ...newCol, type: e.target.value })}
                  >
                    <option value="varchar">varchar</option>
                    <option value="uuid">uuid</option>
                    <option value="integer">integer</option>
                    <option value="boolean">boolean</option>
                    <option value="timestamptz">timestamptz</option>
                    <option value="jsonb">jsonb</option>
                  </select>
                  <select
                    value={newCol.key || ""}
                    onChange={(e) => setNewCol({ ...newCol, key: e.target.value || null })}
                  >
                    <option value="">No Key Constraint</option>
                    <option value="PK">Primary Key (PK)</option>
                    <option value="FK">Foreign Key (FK)</option>
                  </select>
                </div>
                <button className="db-primary-btn" onClick={handleAddColumn}>
                  <Plus size={14} /> Add Column
                </button>
              </div>

              {/* TABLE DATA GRID */}
              <div className="db-table-wrapper">
                <table className="db-columns-grid">
                  <thead>
                    <tr>
                      <th style={{ width: "90px" }}>Constraint</th>
                      <th>Column Name</th>
                      <th>Data Type</th>
                      <th style={{ width: "60px", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTable.columns.map((col) => (
                      <tr key={col.name}>
                        <td>
                          <span className={`db-key-pill ${col.key || "NONE"}`}>
                            {col.key || "—"}
                          </span>
                        </td>
                        <td className="db-col-name-cell">{col.name}</td>
                        <td className="db-col-type-cell">{col.type}</td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="db-action-danger-btn"
                            title="Drop Column"
                            onClick={() => handleDeleteColumn(col.name)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="db-empty-workspace">
              <Columns size={32} />
              <p>Select a table from the sidebar or create a new one.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DeveloperDatabaseManager;