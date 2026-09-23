// multi-tenant-saas/frontend/src/components/employees/AddEditEmployeeFormModal.jsx

import { useEffect, useState } from "react";
import { Users, X } from "lucide-react";

import { useOrganizations } from "../../hooks/useOrganizations.js";
import apiClient from "../../api/client.js";

import "./AddEditEmployeeFormModal.css";

export const AddEditEmployeeFormModal = ({
  isOpen,
  onClose,
  employee = null,
  onSuccess,
}) => {
  /*
   * Your API now returns:
   *
   * employee.employee_id
   * employee.employee_role
   * employee.employee_status
   * employee.user.name
   * employee.user.email
   * employee.user_id
   * employee.organization_id
   */

  const employeeId = employee?.employee_id || employee?.id;
  const isEdit = Boolean(employeeId);

  const { organizations = [] } = useOrganizations();

  const [organizationId, setOrganizationId] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [role, setRole] = useState("staff");
  const [status, setStatus] = useState("active");
  const [hiredAt, setHiredAt] = useState("");

  // User information
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /*
   * Populate form when opening / changing employee
   */
  useEffect(() => {
    if (!isOpen) return;

    if (employee) {
      setOrganizationId(
        employee.organization_id ||
        employee.organizationId ||
        employee.organization?.id ||
        ""
      );

      setEmployeeCode(
        employee.employee_code || ""
      );

      setRole(
        employee.employee_role ||
        employee.role ||
        "staff"
      );

      setStatus(
        employee.employee_status || "active"
      );

      setHiredAt(
        employee.hired_at
          ? new Date(employee.hired_at)
            .toISOString()
            .slice(0, 10)
          : ""
      );

      setName(
        employee.user?.name ||
        employee.full_name ||
        employee.name ||
        ""
      );

      setEmail(
        employee.user?.email ||
        employee.email ||
        ""
      );

      setUserId(
        employee.user_id ||
        employee.user?.id ||
        employee.id ||
        ""
      );
    } else {
      setOrganizationId("");
      setEmployeeCode("");
      setRole("staff");
      setStatus("active");

      setHiredAt(
        new Date()
          .toISOString()
          .slice(0, 10)
      );

      setName("");
      setEmail("");
      setUserId("");
    }

    setError("");
  }, [isOpen, employee]);

  /*
   * Submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!organizationId) {
      setError("Organization is required.");
      return;
    }

    if (!isEdit) {
      if (!name.trim()) {
        setError("Employee name is required.");
        return;
      }

      if (!email.trim()) {
        setError("Employee email is required.");
        return;
      }
    }

    setLoading(true);

    try {
      /*
       * Employee fields
       */
      const payload = {
        organization_id: organizationId,
        organizationId,
        employee_code:
          employeeCode.trim() || null,
        role: role || "staff",
        status: status || "active",
        hired_at: hiredAt || null,
      };

      /*
       * UPDATE
       */
      if (isEdit) {
        if (userId) {
          payload.user_id = userId;
        }

        const response = await apiClient.put(
          `/employees/update/${employeeId}`,
          payload
        );

        onSuccess?.(
          response.data?.data ||
          response.data
        );
      }

      /*
       * CREATE
       */
      else {
        const response = await apiClient.post(
          "/employees/create",
          {
            ...payload,
            name: name.trim(),
            email: email
              .trim()
              .toLowerCase(),  
          }
        );

        onSuccess?.(
          response.data?.data ||
          response.data
        );
      }

      onClose();
    } catch (err) {
      console.error(
        "Employee form error:",
        err
      );

      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        `Unable to ${isEdit
          ? "update"
          : "create"
        } employee.`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="add-edit-emp-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-modal-title"
      >

        {/* Close */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="emp-modal-icon">
          <Users size={25} />
        </div>

        {/* Header */}
        <div className="emp-modal-header">
          <h2
            id="employee-modal-title"
            className="emp-modal-title"
          >
            {isEdit
              ? "Edit Employee"
              : "Add New Employee"}
          </h2>

          <p className="emp-modal-desc">
            {isEdit
              ? "Update the employee details below."
              : "Create an employee and assign them to an organization."}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="emp-modal-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="emp-modal-form"
        >

          {/* Organization */}
          <label htmlFor="emp-org">
            Organization
            <span className="required">
              *
            </span>

            <select
              id="emp-org"
              value={organizationId}
              onChange={(e) =>
                setOrganizationId(
                  e.target.value
                )
              }
              disabled={loading}
              required
            >
              <option value="">
                Select organization
              </option>

              {organizations.map(
                (org) => (
                  <option
                    key={org.id}
                    value={org.id}
                  >
                    {org.name}
                  </option>
                )
              )}
            </select>
          </label>

          {/* Create user fields */}
          {!isEdit && (
            <>
              <label htmlFor="emp-name">
                Full name
                <span className="required">
                  *
                </span>

                <input
                  id="emp-name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Jane Doe"
                  disabled={loading}
                  autoComplete="name"
                  required
                />
              </label>

              <label htmlFor="emp-email">
                Email
                <span className="required">
                  *
                </span>

                <input
                  id="emp-email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="jane@example.com"
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </label>
            </>
          )}

          {/* Edit user information */}
          {isEdit && (
            <div className="emp-modal-readonly">
              <span>Employee</span>

              <strong>
                {name ||
                  email ||
                  "Unnamed employee"}
              </strong>

              {email && (
                <small>
                  {email}
                </small>
              )}
            </div>
          )}

          {/* Employee Code */}
          <label htmlFor="emp-code">
            Employee code

            <input
              id="emp-code"
              type="text"
              value={employeeCode}
              onChange={(e) =>
                setEmployeeCode(
                  e.target.value
                )
              }
              placeholder="EMP-001"
              disabled={loading}
            />
          </label>

          {/* Role */}
          <label htmlFor="emp-role">
            Role

            <select
              id="emp-role"
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              disabled={loading}
            >
              <option value="staff">
                Staff
              </option>

              <option value="manager">
                Manager
              </option>

              <option value="admin">
                Admin
              </option>

              <option value="owner">
                Owner
              </option>
            </select>
          </label>

          {/* Status */}
          <label htmlFor="emp-status">
            Status

            <select
              id="emp-status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              disabled={loading}
            >
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
          </label>

          {/* Hired date */}
          <label htmlFor="emp-hired">
            Hired date

            <input
              id="emp-hired"
              type="date"
              value={hiredAt}
              onChange={(e) =>
                setHiredAt(
                  e.target.value
                )
              }
              disabled={loading}
            />
          </label>

          {/* Actions */}
          <div className="modal-actions">

            <button
              type="button"
              className="emp-modal-btn secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="emp-modal-btn"
              disabled={loading}
            >
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                  ? "Update Employee"
                  : "Create Employee"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};