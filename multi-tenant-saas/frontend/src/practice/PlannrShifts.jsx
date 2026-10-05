import React, { useState } from "react";
import {
  CalendarDays,
  Wallet,
  Plus,
  ChevronDown,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Send,
  Clock3,
  Coffee,
  Sun,
  HeartPulse,
  Moon,
  Globe2,
  CloudCheck,
  X,
  CheckCircle2,
} from "lucide-react";
import "./PlannrShifts.css";

const initialStaff = [
  {
    id: "1",
    name: "Jerry Helfer",
    role: "Office manager",
    meta: "32h / 4 shifts",
    initials: "JH",
  },
  {
    id: "2",
    name: "Bessie Cooper",
    role: "Customer support",
    meta: "24h / 3 shifts",
    initials: "BC",
  },
  {
    id: "3",
    name: "Ralph Edwards",
    role: "Operations associate",
    meta: "26h / 3 shifts",
    initials: "RE",
  },
];

const days = [
  { d: "MON", n: "12" },
  { d: "TUE", n: "13" },
  { d: "WED", n: "14" },
  { d: "THU", n: "15" },
  { d: "FRI", n: "16" },
  { d: "SAT", n: "17" },
  { d: "SUN", n: "18" },
];

const locations = [
  "Dublin Office",
  "London Hub",
  "New York HQ",
  "Remote / Work from Home",
];

export default function PlannrShifts() {
  const [activeTab, setActiveTab] = useState("Shifts");
  const [selectedLocation, setSelectedLocation] = useState("Dublin Office");
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);

  // Modals state
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [published, setPublished] = useState(false);

  // Date State
  const [weekOffset, setWeekOffset] = useState(0);

  // Form State
  const [shiftForm, setShiftForm] = useState({
    staffId: "1",
    day: "MON",
    time: "09:00 - 17:00",
    breakLabel: "60m break",
    overtime: "",
  });

  const handleOpenShiftModal = (staffId = "1", day = "MON") => {
    setShiftForm((prev) => ({ ...prev, staffId, day }));
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = (e) => {
    e.preventDefault();
    setIsShiftModalOpen(false);
    setPublished(false);
    alert(
      `Shift added/updated for ${days.find((d) => d.d === shiftForm.day)?.d || "selected day"}!`,
    );
  };

  const handlePublish = () => {
    setPublished(true);
    setIsPublishModalOpen(false);
  };

  return (
    <>
      {/* Content-only – no Sidebar / Topbar (provided by AdminLayout) */}
      <section className="page">
        <div className="page-heading-row">
          <div>
            <h1>Shifts</h1>
            <p>A clear week. A well-balanced team.</p>
          </div>
          <div className="saved">
            <CloudCheck size={15} />
            All changes saved
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="tabs">
          {["Shifts", "TimeSheets"].map((t) => (
            <button
              key={t}
              className={activeTab === t ? "active" : ""}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>

        {/* Schedule Controls / Toolbar */}
        <div className="toolbar">
          <div className="location-dropdown-wrap">
            <button
              className="location-btn"
              onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
            >
              <MapPin size={16} />
              <strong>{selectedLocation}</strong>
              <ChevronDown size={14} />
            </button>
            {isLocationMenuOpen && (
              <div className="location-menu">
                {locations.map((loc) => (
                  <button
                    key={loc}
                    className={selectedLocation === loc ? "active" : ""}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setIsLocationMenuOpen(false);
                    }}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="date-switch">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              aria-label="Previous week"
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              <CalendarDays size={17} />
              {weekOffset === 0
                ? "12 - 18 Aug, 2024"
                : `Week (${weekOffset > 0 ? `+${weekOffset}` : weekOffset})`}
            </span>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              aria-label="Next week"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="toolbar-actions">
            <button
              className="publish"
              onClick={() => setIsPublishModalOpen(true)}
              disabled={published}
            >
              <Send size={17} />
              {published ? "Published" : "Publish (2)"}
            </button>
          </div>
        </div>

        {/* Grid Schedule */}
        <div className="schedule-wrap">
          <div className="schedule-grid schedule-head">
            <div className="staff-head">
              <span>STAFF MEMBER</span>
              <span className="count">3</span>
            </div>
            {days.map((day) => (
              <div className="day-head" key={day.d}>
                <span>{day.d}</span>
                <strong>{day.n}</strong>
              </div>
            ))}
          </div>

          {/* Row 1: Jerry Helfer */}
          <div className="schedule-grid staff-row">
            <div className="staff-cell">
              <Avatar initials={initialStaff[0].initials} />
              <div>
                <strong>{initialStaff[0].name}</strong>
                <span>{initialStaff[0].role}</span>
                <small>
                  <Clock3 size={12} />
                  {initialStaff[0].meta}
                </small>
              </div>
            </div>
            <div className="slot" onClick={() => handleOpenShiftModal("1", "MON")}>
              <ShiftCard />
            </div>
            <div className="slot" onClick={() => handleOpenShiftModal("1", "TUE")}>
              <ShiftCard />
            </div>
            <div className="slot" onClick={() => handleOpenShiftModal("1", "WED")}>
              <ShiftCard />
            </div>
            <div className="slot" onClick={() => handleOpenShiftModal("1", "THU")}>
              <ShiftCard />
            </div>
            <div className="slot">
              <StatusCard type="casual" />
            </div>
            <div className="slot">
              <StatusCard type="weekend" />
            </div>
            <div className="slot">
              <StatusCard type="weekend" />
            </div>
          </div>

          {/* Row 2: Bessie Cooper */}
          <div className="schedule-grid staff-row">
            <div className="staff-cell">
              <Avatar initials={initialStaff[1].initials} />
              <div>
                <strong>{initialStaff[1].name}</strong>
                <span>{initialStaff[1].role}</span>
                <small>
                  <Clock3 size={12} />
                  {initialStaff[1].meta}
                </small>
              </div>
            </div>
            <div className="slot">
              <StatusCard type="sick" />
            </div>
            <div className="slot">
              <StatusCard type="sick" />
            </div>
            <div className="slot" onClick={() => handleOpenShiftModal("2", "WED")}>
              <ShiftCard time="10:00 - 18:00" />
            </div>
            <div className="slot" onClick={() => handleOpenShiftModal("2", "THU")}>
              <ShiftCard time="10:00 - 18:00" />
            </div>
            <div className="slot" onClick={() => handleOpenShiftModal("2", "FRI")}>
              <ShiftCard time="10:00 - 18:00" />
            </div>
            <div className="slot">
              <StatusCard type="weekend" />
            </div>
            <div className="slot">
              <StatusCard type="weekend" />
            </div>
          </div>

          {/* Row 3: Ralph Edwards */}
          <div className="schedule-grid staff-row">
            <div className="staff-cell">
              <Avatar initials={initialStaff[2].initials} />
              <div>
                <strong>{initialStaff[2].name}</strong>
                <span>{initialStaff[2].role}</span>
                <small>
                  <Clock3 size={12} />
                  {initialStaff[2].meta}
                </small>
              </div>
            </div>
            <div className="slot" onClick={() => handleOpenShiftModal("3", "MON")}>
              <ShiftCard time="08:00 - 16:00" breakLabel="30m break" />
            </div>
            <div className="slot" onClick={() => handleOpenShiftModal("3", "TUE")}>
              <ShiftCard time="08:00 - 16:00" breakLabel="30m break" />
            </div>
            <div className="slot" onClick={() => handleOpenShiftModal("3", "WED")}>
              <ShiftCard time="08:00 - 18:00" overtime="+2h OT" />
            </div>
            <div className="slot" onClick={() => handleOpenShiftModal("3", "THU")}>
              <OpenShift />
            </div>
            <div className="slot">
              <StatusCard type="off" />
            </div>
            <div className="slot">
              <StatusCard type="weekend" />
            </div>
            <div className="slot">
              <StatusCard type="weekend" />
            </div>
          </div>

          {/* Summary Rows */}
          <div className="schedule-grid summary-row">
            <div>
              <Clock3 size={15} />
              Daily Hours
            </div>
            {["40 hrs", "40 hrs", "48 hrs", "32 hrs", "24 hrs", "0 hrs", "0 hrs"].map(
              (x, i) => (
                <div key={i}>{x}</div>
              ),
            )}
          </div>
          <div className="schedule-grid summary-row">
            <div>
              <Wallet size={15} />
              Est. Labor Cost
            </div>
            {["$1,000", "$1,000", "$1,240", "$800", "$600", "$0", "$0"].map(
              (x, i) => (
                <div key={i}>{x}</div>
              ),
            )}
          </div>
          <div className="schedule-footer">
            <span>Showing 3 staff members</span>
            <span>
              <Globe2 size={14} />
              Europe/Dublin (GMT+1)
            </span>
          </div>
        </div>

        <div className="legend-row">
          <span className="changes">
            <i />
            {published ? "0 unpublished changes" : "2 unpublished changes"}
          </span>
        </div>
      </section>

      {/* --- MODAL: Add/Edit Shift --- */}
      {isShiftModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsShiftModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add or Edit Shift</h2>
              <button
                className="close-btn"
                onClick={() => setIsShiftModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveShift} className="modal-body">
              <label>
                <span>Staff Member</span>
                <select
                  value={shiftForm.staffId}
                  onChange={(e) =>
                    setShiftForm({ ...shiftForm, staffId: e.target.value })
                  }
                >
                  {initialStaff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Day</span>
                <select
                  value={shiftForm.day}
                  onChange={(e) =>
                    setShiftForm({ ...shiftForm, day: e.target.value })
                  }
                >
                  {days.map((d) => (
                    <option key={d.d} value={d.d}>
                      {d.d} ({d.n} Aug)
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Shift Timing</span>
                <input
                  type="text"
                  value={shiftForm.time}
                  onChange={(e) =>
                    setShiftForm({ ...shiftForm, time: e.target.value })
                  }
                  placeholder="e.g. 09:00 - 17:00"
                />
              </label>

              <label>
                <span>Break Duration</span>
                <input
                  type="text"
                  value={shiftForm.breakLabel}
                  onChange={(e) =>
                    setShiftForm({ ...shiftForm, breakLabel: e.target.value })
                  }
                  placeholder="e.g. 60m break"
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setIsShiftModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="publish">
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Publish Confirmation --- */}
      {isPublishModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsPublishModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Publish Shifts</h2>
              <button
                className="close-btn"
                onClick={() => setIsPublishModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: "#586c85", fontSize: "13px" }}>
                You are about to publish <strong>2 changes</strong> to staff
                schedules for <strong>{selectedLocation}</strong>. Email
                notifications will be sent automatically.
              </p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setIsPublishModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="publish"
                  onClick={handlePublish}
                >
                  <CheckCircle2 size={16} /> Confirm Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Avatar({ initials, dark = false }) {
  return (
    <div className={`avatar ${dark ? "avatar-dark" : ""}`}>{initials}</div>
  );
}

function ShiftCard({
  time = "09:00 - 17:00",
  breakLabel = "60m break",
  overtime,
}) {
  return (
    <div className="shift-card scheduled">
      <div className="shift-card-top">
        <span>Office shift</span>
        <span className="tiny-dot" />
      </div>
      <div className="shift-time">{time}</div>
      <div className={`pill ${overtime ? "pill-ot" : ""}`}>
        {overtime ? <Clock3 size={11} /> : <Coffee size={11} />}
        {overtime || breakLabel}
      </div>
    </div>
  );
}

function StatusCard({ type }) {
  const config = {
    sick: { label: "Sick Leave", icon: HeartPulse, cls: "sick" },
    casual: { label: "Casual Leave", icon: Sun, cls: "casual" },
    weekend: { label: "Weekend", icon: Coffee, cls: "weekend" },
    off: { label: "Off", icon: Moon, cls: "off" },
  }[type] || { label: "Off", icon: Moon, cls: "off" };

  const Icon = config.icon;
  return (
    <div className={`status-card ${config.cls}`}>
      <Icon size={20} strokeWidth={1.7} />
      <span>{config.label}</span>
    </div>
  );
}

function OpenShift() {
  return (
    <div className="open-shift">
      <Plus size={16} />
      <span>Open Shift</span>
    </div>
  );
}