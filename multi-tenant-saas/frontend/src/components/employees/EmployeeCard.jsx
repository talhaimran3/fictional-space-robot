import {
  Building2,
  CalendarDays,
  Mail,
  Pencil,
  UserCheck,
  Briefcase,
  Clock3,
} from "lucide-react";

const EmployeeCard = ({ employee, onEdit }) => {
  const name = employee.user?.name || employee.full_name || "Unnamed";
  const email = employee.user?.email || employee.email || "No email";
  const organizationName = employee.organization?.name || "—";
  const role = employee.employee_role || employee.role || "staff";
  const status = employee.employee_status || employee.status || "active";
  const shifts = Array.isArray(employee.shifts) ? employee.shifts : [];
  const avatarLetter = name.charAt(0).toUpperCase();

  return (
    <article className="emp-card">
      <div className="emp-card__top">
        <div className="emp-card__avatar">
          {employee.user?.avatar_url ? (
            <img src={employee.user.avatar_url} alt={name} />
          ) : (
            avatarLetter
          )}
        </div>
        <div className="emp-card__meta">
          <h2>{name}</h2>
          <span className="emp-card__code">{employee.employee_code || "No code"}</span>
        </div>
        <button
          type="button"
          className="emp-card__edit"
          onClick={() => onEdit(employee)}
          title="Edit employee"
        >
          <Pencil size={15} />
        </button>
      </div>

      <div className="emp-card__stats">
        <div className="emp-stat">
          <div className="emp-stat__icon">
            <Building2 size={15} />
          </div>
          <div>
            <span>Organization</span>
            <strong>{organizationName}</strong>
          </div>
        </div>
        <div className="emp-stat">
          <div className="emp-stat__icon">
            <Briefcase size={15} />
          </div>
          <div>
            <span>Role</span>
            <strong className="emp-role">{role}</strong>
          </div>
        </div>
        <div className="emp-stat">
          <div className="emp-stat__icon">
            <UserCheck size={15} />
          </div>
          <div>
            <span>Status</span>
            <strong>
              <span className={`sa-status-pill sa-status-pill--${status}`}>
                {String(status).replace("_", " ")}
              </span>
            </strong>
          </div>
        </div>
        <div className="emp-stat">
          <div className="emp-stat__icon">
            <CalendarDays size={15} />
          </div>
          <div>
            <span>Hired</span>
            <strong>
              {employee.hired_at
                ? new Date(employee.hired_at).toLocaleDateString()
                : "—"}
            </strong>
          </div>
        </div>
      </div>

      <div className="emp-card__shift">
        <div className="emp-card__shift-icon">
          <Clock3 size={16} />
        </div>
        <div className="emp-card__shift-info">
          <span>Total Shifts</span>
          <strong>{shifts.length}</strong>
        </div>
      </div>

      <div className="emp-card__footer">
        <div className="emp-card__email">
          <Mail size={14} />
          <span>{email}</span>
        </div>
      </div>
    </article>
  );
};

export default EmployeeCard;
