import { useEffect, useState } from "react";
import { Users, Search, LayoutGrid, List, Plus } from "lucide-react";
import { useEmployees } from "../../hooks/useEmployees.js";
import { AddEditEmployeeFormModal } from "./AddEditEmployeeFormModal.jsx";
import EmployeeCard from "./EmployeeCard.jsx";
import PageHeader from "../../admin/shared/PageHeader";
import EmptyState from "../../admin/shared/EmptyState";
import LoadingState from "../../admin/shared/LoadingState";
import "../../admin/shared/admin-ui.css";
import "./AllEmployeesPage.css";

const AllEmployeesPage = () => {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const { employees, loading, error, fetchEmployees } = useEmployees();

  useEffect(() => {
    fetchEmployees();
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
    const name = emp.user?.name?.toLowerCase() || "";
    const email = emp.user?.email?.toLowerCase() || "";
    const employeeCode = emp.employee_code?.toLowerCase() || "";
    const organizationName = emp.organization?.name?.toLowerCase() || "";
    const matchesSearch =
      !query ||
      name.includes(query) ||
      email.includes(query) ||
      employeeCode.includes(query) ||
      organizationName.includes(query);
    const matchesStatus =
      statusFilter === "all" || emp.employee_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="sa-page emp-page">
        <LoadingState message="Loading employees..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="sa-page emp-page">
        <div className="sa-error sa-card">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sa-page emp-page">
      <PageHeader
        eyebrow="Workforce"
        title="Employees"
        description="Manage employees across all organizations."
        actions={
          <>
            <div className="sa-pill">
              <strong>{employees.length}</strong>
              <span>{employees.length === 1 ? "employee" : "employees"}</span>
            </div>
            <button type="button" className="sa-btn sa-btn--primary" onClick={openCreate}>
              <Plus size={18} />
              Add Employee
            </button>
          </>
        }
      />

      <div className="sa-toolbar">
        <div className="sa-search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search by name, code, email, org..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <span className="sa-search__count">{filteredEmployees.length}</span>}
        </div>
        <div className="emp-filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="emp-status-filter"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On leave</option>
          </select>
          <div className="sa-view-toggle">
            <button
              type="button"
              className={`sa-view-btn ${viewMode === "grid" ? "is-active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              className={`sa-view-btn ${viewMode === "list" ? "is-active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description={
            search || statusFilter !== "all"
              ? "Try a different search or filter."
              : "There are currently no employees."
          }
          action={
            !search && statusFilter === "all" ? (
              <button type="button" className="sa-btn sa-btn--primary" onClick={openCreate}>
                <Plus size={16} />
                Add first employee
              </button>
            ) : null
          }
        />
      ) : viewMode === "grid" ? (
        <div className="emp-grid">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id || employee.employee_id}
              employee={employee}
              onEdit={openEdit}
            />
          ))}
        </div>
      ) : (
        <div className="emp-list">
          {filteredEmployees.map((employee) => (
            <div key={employee.employee_id || employee.id} className="emp-row sa-card">
              <div className="emp-row__main">
                <div className="emp-row__avatar">
                  {employee.user?.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <h2>{employee.user?.name || "Unnamed"}</h2>
                  <span>
                    {employee.employee_code || "—"} · {employee.user?.email || "No email"}
                  </span>
                </div>
              </div>
              <div className="emp-row__meta">
                <span>{employee.organization?.name || "—"}</span>
                <span className="emp-role">{employee.employee_role || "staff"}</span>
                <span
                  className={`sa-status-pill sa-status-pill--${employee.employee_status || "active"}`}
                >
                  {(employee.employee_status || "active").replace("_", " ")}
                </span>
                <span className="emp-row__shifts">
                  <span>Shifts</span>
                  <strong>{employee.shifts?.length || 0}</strong>
                </span>
              </div>
              <div className="emp-row__actions">
                <button
                  type="button"
                  className="sa-btn sa-btn--ghost"
                  onClick={() => openEdit(employee)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddEditEmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={editingEmployee}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default AllEmployeesPage;
