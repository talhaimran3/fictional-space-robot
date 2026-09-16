// multi-tenant-saas/frontend/src/components/employees/AllEmployeesPage.jsx

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  LayoutGrid,
  List,
  Plus,
} from "lucide-react";

import "./AllEmployeesPage.css";

import { useEmployees } from "../../../hooks/useEmployees.js";
import { AddEditEmployeeFormModal } from "./AddEditEmployeeFormModal.jsx";
import EmployeeCard from "./EmployeeCard.jsx";

const AllEmployeesPage = () => {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const {
    employees,
    loading,
    error,
    fetchEmployees,
  } = useEmployees();

  useEffect(() => {
    fetchEmployees();

    // fetchEmployees is recreated by the hook on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const openEdit = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchEmployees();
  };

  const filteredEmployees = employees.filter((emp) => {
    const query = search.toLowerCase().trim();

    const name =
      emp.user?.name?.toLowerCase() || "";

    const email =
      emp.user?.email?.toLowerCase() || "";

    const employeeCode =
      emp.employee_code?.toLowerCase() || "";

    const organizationName =
      emp.organization?.name?.toLowerCase() || "";

    const matchesSearch =
      !query ||
      name.includes(query) ||
      email.includes(query) ||
      employeeCode.includes(query) ||
      organizationName.includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      emp.employee_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="emp-page">
        <div className="emp-loading">
          <div className="emp-spinner" />
          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="emp-page">
        <div className="emp-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="emp-page">

      {/* Header */}
      <header className="emp-header">
        <div className="emp-header__left">
          <span className="emp-eyebrow">
            Workforce
          </span>

          <h1>Employees</h1>

          <p>
            Manage employees across all organizations.
          </p>
        </div>

        <div className="emp-header__right">
          <div className="emp-total-pill">
            <strong>{employees.length}</strong>

            <span>
              {employees.length === 1
                ? "employee"
                : "employees"}
            </span>
          </div>

          <button
            type="button"
            className="emp-btn emp-btn--primary"
            onClick={openCreate}
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="emp-toolbar">

        <div className="emp-search">
          <Search
            size={17}
            className="emp-search__icon"
          />

          <input
            type="text"
            placeholder="Search by name, code, email, org..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <span className="emp-search__count">
              {filteredEmployees.length}
            </span>
          )}
        </div>

        <div className="emp-filters">

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="emp-status-filter"
          >
            <option value="all">
              All statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>

            <option value="on_leave">
              On leave
            </option>
          </select>

          <div className="emp-view-toggle">

            <button
              type="button"
              className={`emp-view-btn ${
                viewMode === "grid"
                  ? "is-active"
                  : ""
              }`}
              onClick={() =>
                setViewMode("grid")
              }
              title="Grid view"
            >
              <LayoutGrid size={18} />
            </button>

            <button
              type="button"
              className={`emp-view-btn ${
                viewMode === "list"
                  ? "is-active"
                  : ""
              }`}
              onClick={() =>
                setViewMode("list")
              }
              title="List view"
            >
              <List size={18} />
            </button>

          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 ? (
        <div className="emp-empty">

          <div className="emp-empty__icon">
            <Users size={28} />
          </div>

          <h3>No employees found</h3>

          <p>
            {search || statusFilter !== "all"
              ? "Try a different search or filter."
              : "There are currently no employees."}
          </p>

          {!search &&
            statusFilter === "all" && (
              <button
                type="button"
                className="emp-btn emp-btn--primary"
                onClick={openCreate}
              >
                <Plus size={16} />
                Add first employee
              </button>
            )}

        </div>
      ) : viewMode === "grid" ? (

        /* Grid */
        <div className="emp-grid">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={openEdit}
            />
          ))}
        </div>

      ) : (

        /* List */
        <div className="emp-list">

          {filteredEmployees.map((employee) => (
            <div
              key={employee.employee_id}
              className="emp-row"
            >
              <div className="emp-row__main">

                <div className="emp-row__avatar">
                  {employee.user?.name
                    ?.charAt(0)
                    .toUpperCase() || "?"}
                </div>

                <div>
                  <h2>
                    {employee.user?.name ||
                      "Unnamed"}
                  </h2>

                  <span>
                    {employee.employee_code ||
                      "—"}{" "}
                    ·{" "}
                    {employee.user?.email ||
                      "No email"}
                  </span>
                </div>

              </div>

              <div className="emp-row__meta">

                <span>
                  {employee.organization?.name ||
                    "—"}
                </span>

                <span className="emp-role">
                  {employee.employee_role ||
                    "staff"}
                </span>

                <span
                  className={`emp-status-pill emp-status-pill--${
                    employee.employee_status ||
                    "active"
                  }`}
                >
                  {(
                    employee.employee_status ||
                    "active"
                  ).replace("_", " ")}
                </span>

                <span className="emp-row__shifts">
                  <span>
                    Shifts
                  </span>
                  <strong>
                    {employee.shifts?.length || 0}
                  </strong>
                </span>

              </div>

              <div className="emp-row__actions">

                <button
                  type="button"
                  className="emp-btn emp-btn--ghost"
                  onClick={() =>
                    openEdit(employee)
                  }
                >
                  Edit
                </button>

              </div>
            </div>
          ))}

        </div>
      )}

      {/* Modal */}
      <AddEditEmployeeFormModal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        employee={editingEmployee}
        onSuccess={handleSuccess}
      />

    </div>
  );
};

export default AllEmployeesPage;