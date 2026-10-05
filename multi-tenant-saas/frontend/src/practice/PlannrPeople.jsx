import React, { useMemo, useState } from "react";
import {
  ArrowDown,
  CalendarDays,
  ChevronDown,
  Download,
  Search,
  ShieldCheck,
  Users,
  UserCheck,
  Coffee,
  X,
  CheckCircle2,
} from "lucide-react";
import "./PlannrPeople.css";

const INITIAL_PEOPLE = [
  {
    id: 1,
    name: "Sophia Martinez",
    email: "sophia.m@acme.com",
    role: "UX Designer",
    department: "Design",
    status: "Active",
    shifts: "5 shifts / 40 hrs",
    tone: "purple",
    initials: "SM",
  },
  {
    id: 2,
    name: "James Patel",
    email: "james.p@acme.com",
    role: "Team Lead",
    department: "Engineering",
    status: "Active",
    shifts: "4 shifts / 32 hrs",
    tone: "blue",
    initials: "JP",
  },
  {
    id: 3,
    name: "Bessie Cooper",
    email: "bessie.c@acme.com",
    role: "Accountant",
    department: "Finance",
    status: "On Leave",
    shifts: "0 shifts / 0 hrs",
    tone: "peach",
    initials: "BC",
  },
  {
    id: 4,
    name: "Priya Johnson",
    email: "priya.j@acme.com",
    role: "HR Specialist",
    department: "People Ops",
    status: "Part-Time",
    shifts: "3 shifts / 24 hrs",
    tone: "teal",
    initials: "PJ",
  },
];

function Avatar({ initials, tone = "blue", size = "large" }) {
  return (
    <div className={`pp-avatar pp-avatar--${tone} pp-avatar--${size}`}>
      {initials}
    </div>
  );
}

function MetricCard({ icon: Icon, title, value, context, tone }) {
  return (
    <div className="pp-metric-card">
      <div className={`pp-metric-icon pp-metric-icon--${tone}`}>
        <Icon size={21} strokeWidth={1.8} />
      </div>
      <div className="pp-metric-copy">
        <span>{title}</span>
        <div>
          <strong>{value}</strong>
          <small>{context}</small>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const type =
    status === "On Leave"
      ? "leave"
      : status === "Part-Time"
        ? "part-time"
        : "active";

  return (
    <span className={`pp-status pp-status--${type}`}>
      <i />
      {status}
    </span>
  );
}

function StaffRow({ person, selected, onSelect, onEdit }) {
  return (
    <div className="pp-staff-row">
      <input
        className="pp-checkbox"
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(person.id)}
        aria-label={`Select ${person.name}`}
      />

      <div className="pp-employee-cell">
        <Avatar initials={person.initials} tone={person.tone} />
        <div className="pp-employee-copy">
          <strong>{person.name}</strong>
          <span>{person.email}</span>
        </div>
      </div>

      <div className="pp-fixed-cell pp-role-cell">
        <span className="pp-tag">{person.role}</span>
      </div>

      <div className="pp-fixed-cell pp-department-cell">
        <span className="pp-tag">{person.department}</span>
      </div>

      <div className="pp-fixed-cell pp-status-cell">
        <StatusBadge status={person.status} />
      </div>

      <div className="pp-fixed-cell pp-week-cell">
        <CalendarDays size={14} />
        <span>{person.shifts}</span>
      </div>

      <div className="pp-action-cell">
        <button className="pp-edit-button" type="button" onClick={() => onEdit(person)}>
          Edit
        </button>
      </div>
    </div>
  );
}

function PeopleDirectory({ people, onEditPerson }) {
  const [activeTab, setActiveTab] = useState("All Staff");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);

  const [selectedDept, setSelectedDept] = useState("All departments");
  const [selectedRole, setSelectedRole] = useState("All roles");
  const [selectedStatus, setSelectedStatus] = useState("All statuses");
  const [activeMenu, setActiveMenu] = useState(null);

  const departments = ["All departments", "Design", "Engineering", "Finance", "People Ops"];
  const roles = ["All roles", "UX Designer", "Team Lead", "Accountant", "HR Specialist"];
  const statuses = ["All statuses", "Active", "On Leave", "Part-Time"];

  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      const matchesQuery =
        person.name.toLowerCase().includes(query.toLowerCase()) ||
        person.email.toLowerCase().includes(query.toLowerCase());

      const matchesDept = selectedDept === "All departments" || person.department === selectedDept;
      const matchesRole = selectedRole === "All roles" || person.role === selectedRole;
      const matchesStatus = selectedStatus === "All statuses" || person.status === selectedStatus;

      const matchesTab =
        activeTab === "All Staff" ||
        (activeTab === "Active" && person.status === "Active") ||
        (activeTab === "On Leave" && person.status === "On Leave");

      return matchesQuery && matchesDept && matchesRole && matchesStatus && matchesTab;
    });
  }, [people, activeTab, query, selectedDept, selectedRole, selectedStatus]);

  const toggleSelected = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const selectAll = (event) => {
    setSelected(event.target.checked ? filteredPeople.map((person) => person.id) : []);
  };

  return (
    <section className="pp-directory">
      <div className="pp-directory-panel">
        <div className="pp-directory-nav">
          <div className="pp-tabs">
            {[
              ["All Staff", people.length],
              ["Active", people.filter((p) => p.status === "Active").length],
              ["On Leave", people.filter((p) => p.status === "On Leave").length],
              ["Departments", ""],
              ["Roles & Rates", ""],
            ].map(([label, count]) => (
              <button
                key={label}
                className={`pp-tab ${activeTab === label ? "is-active" : ""}`}
                type="button"
                onClick={() => setActiveTab(label)}
              >
                {label} {count !== "" && `(${count})`}
              </button>
            ))}
          </div>

          <button
            className="pp-outline-button"
            type="button"
            onClick={() => window.alert("Exporting staff directory CSV...")}
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="pp-filters">
          <label className="pp-staff-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or email..."
            />
          </label>

          <div className="pp-filter-dropdown-wrap">
            <button
              className="pp-filter"
              type="button"
              onClick={() => setActiveMenu(activeMenu === "dept" ? null : "dept")}
            >
              <div>
                <span>Department</span>
                <strong>{selectedDept}</strong>
              </div>
              <ChevronDown size={14} />
            </button>
            {activeMenu === "dept" && (
              <div className="pp-popover-menu">
                {departments.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={selectedDept === d ? "is-selected" : ""}
                    onClick={() => {
                      setSelectedDept(d);
                      setActiveMenu(null);
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pp-filter-dropdown-wrap">
            <button
              className="pp-filter"
              type="button"
              onClick={() => setActiveMenu(activeMenu === "role" ? null : "role")}
            >
              <div>
                <span>Role</span>
                <strong>{selectedRole}</strong>
              </div>
              <ChevronDown size={14} />
            </button>
            {activeMenu === "role" && (
              <div className="pp-popover-menu">
                {roles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={selectedRole === r ? "is-selected" : ""}
                    onClick={() => {
                      setSelectedRole(r);
                      setActiveMenu(null);
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pp-filter-dropdown-wrap">
            <button
              className="pp-filter"
              type="button"
              onClick={() => setActiveMenu(activeMenu === "status" ? null : "status")}
            >
              <div>
                <span>Status</span>
                <strong>{selectedStatus}</strong>
              </div>
              <ChevronDown size={14} />
            </button>
            {activeMenu === "status" && (
              <div className="pp-popover-menu">
                {statuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={selectedStatus === s ? "is-selected" : ""}
                    onClick={() => {
                      setSelectedStatus(s);
                      setActiveMenu(null);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Table View */}
        <div className="pp-table-scroll-wrapper">
          <div className="pp-table-head">
            <input
              className="pp-checkbox"
              type="checkbox"
              checked={
                filteredPeople.length > 0 &&
                filteredPeople.every((person) => selected.includes(person.id))
              }
              onChange={selectAll}
              aria-label="Select all staff"
            />
            <button className="pp-member-heading" type="button">
              STAFF MEMBER
              <ArrowDown size={12} />
            </button>
            <span className="pp-fixed-cell pp-role-cell">ROLE</span>
            <span className="pp-fixed-cell pp-department-cell">DEPARTMENT</span>
            <span className="pp-fixed-cell pp-status-cell">STATUS</span>
            <span className="pp-fixed-cell pp-week-cell">THIS WEEK</span>
            <span className="pp-action-cell" />
          </div>

          <div className="pp-staff-list">
            {filteredPeople.map((person) => (
              <StaffRow
                key={person.id}
                person={person}
                selected={selected.includes(person.id)}
                onSelect={toggleSelected}
                onEdit={onEditPerson}
              />
            ))}
            {!filteredPeople.length && (
              <div className="pp-empty-state">
                <Users size={22} />
                <strong>No staff found</strong>
                <span>Try changing your search or filters.</span>
              </div>
            )}
          </div>
        </div>

        <div className="pp-directory-footer">
          <div>
            <span>Showing {filteredPeople.length} staff members</span>
            <span>•</span>
            <span>{selected.length} selected</span>
          </div>
          <div className="pp-pagination">
            <button type="button" aria-label="Previous page">
              ‹
            </button>
            <button className="is-current" type="button">
              1
            </button>
            <button type="button">2</button>
            <button type="button" aria-label="Next page">
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="pp-privacy-note">
        <ShieldCheck size={15} />
        <span>Your team’s information is private and secure.</span>
      </div>
    </section>
  );
}

export default function PlannrPeoples() {
  const [people, setPeople] = useState(INITIAL_PEOPLE);
  const [modalPerson, setModalPerson] = useState(null); // null = closed, {} = add, personObj = edit
  const [toast, setToast] = useState("");

  const handleSaveMember = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const email = formData.get("email");
    const role = formData.get("role");
    const department = formData.get("department");

    if (modalPerson?.id) {
      setPeople((prev) =>
        prev.map((p) =>
          p.id === modalPerson.id ? { ...p, name, email, role, department } : p
        )
      );
      showToast(`${name}'s details updated successfully.`);
    } else {
      const initials =
        name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "EX";
      const newPerson = {
        id: Date.now(),
        name,
        email,
        role,
        department,
        status: "Active",
        shifts: "0 shifts / 0 hrs",
        tone: "blue",
        initials,
      };
      setPeople((prev) => [newPerson, ...prev]);
      showToast(`${name} added to the workspace.`);
    }

    setModalPerson(null);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  return (
    <>
      {/* Content-only – no Sidebar / Header (provided by AdminLayout) */}
      <div className="pp-page">
        <div className="pp-page-overview">
          <div className="pp-heading-row">
            <div>
              <h1>Peoples</h1>
              <p>A great team starts with the right people. Manage yours here.</p>
            </div>

            <div className="pp-week-indicator">
              <CalendarDays size={15} />
              <span>This week · Oct 5–11</span>
            </div>
          </div>

          <div className="pp-metrics">
            <MetricCard
              icon={Users}
              title="Total staff"
              value={people.length}
              context="Across departments"
              tone="blue"
            />
            <MetricCard
              icon={UserCheck}
              title="Active members"
              value={people.filter((p) => p.status === "Active").length}
              context="Ready for work"
              tone="green"
            />
            <MetricCard
              icon={Coffee}
              title="On leave"
              value={people.filter((p) => p.status === "On Leave").length}
              context="Time off scheduled"
              tone="peach"
            />
          </div>
        </div>

        <PeopleDirectory people={people} onEditPerson={(person) => setModalPerson(person)} />
      </div>

      {/* --- ADD / EDIT MEMBER MODAL --- */}
      {modalPerson !== null && (
        <div className="pp-modal-backdrop" onClick={() => setModalPerson(null)}>
          <div className="pp-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pp-modal-header">
              <h2>{modalPerson.id ? "Edit Team Member" : "Add Team Member"}</h2>
              <button className="pp-close-btn" onClick={() => setModalPerson(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveMember} className="pp-modal-body">
              <label>
                <span>Full Name</span>
                <input
                  name="name"
                  defaultValue={modalPerson.name || ""}
                  placeholder="e.g. Alex Morgan"
                  required
                />
              </label>

              <label>
                <span>Email Address</span>
                <input
                  type="email"
                  name="email"
                  defaultValue={modalPerson.email || ""}
                  placeholder="e.g. alex.m@acme.com"
                  required
                />
              </label>

              <label>
                <span>Role</span>
                <input
                  name="role"
                  defaultValue={modalPerson.role || ""}
                  placeholder="e.g. Operations Manager"
                  required
                />
              </label>

              <label>
                <span>Department</span>
                <select name="department" defaultValue={modalPerson.department || "Engineering"}>
                  <option value="Design">Design</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Finance">Finance</option>
                  <option value="People Ops">People Ops</option>
                </select>
              </label>

              <div className="pp-modal-actions">
                <button
                  type="button"
                  className="pp-outline-button"
                  onClick={() => setModalPerson(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="pp-primary-button">
                  <CheckCircle2 size={16} /> Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="pp-toast">{toast}</div>}
    </>
  );
}