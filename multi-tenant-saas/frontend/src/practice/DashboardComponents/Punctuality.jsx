import { usePunctuality } from "../../hooks/usePunctuality";

const COLORS = {
  punctual: "#63a8dc",
  late: "#e7a15e",
  absent: "#df8058",
};

export function Punctuality() {
  const { summary, date, loading, error } = usePunctuality();
  const total = summary.evaluated;
  const punctualPct = summary.percentages?.punctual || 0;
  const latePct = summary.percentages?.late || 0;
  const absentPct = summary.percentages?.absent || 0;
  const punctualEnd = punctualPct * 3.6;
  const lateEnd = punctualEnd + latePct * 3.6;

  const donutStyle = {
    background:
      total === 0
        ? "#e9edf2"
        : `conic-gradient(${COLORS.punctual} 0deg ${punctualEnd}deg, ${COLORS.late} ${punctualEnd}deg ${lateEnd}deg, ${COLORS.absent} ${lateEnd}deg 360deg)`,
  };

  return (
    <section className="pd-card pd-punctuality">
      <div className="pd-card-heading">
        <div>
          <h2>Staff Punctuality Overview</h2>
          <p>{date ? new Date(date + "T00:00:00").toLocaleDateString() : "Today"}</p>
        </div>
      </div>

      {loading ? (
        <p role="status" className="pd-punctuality-message">Loading punctuality…</p>
      ) : error ? (
        <p role="alert" className="pd-punctuality-message">{error}</p>
      ) : (
        <>
          <div className="pd-donut-area">
            <div className="pd-donut" style={donutStyle} role="img" aria-label={`Punctual ${punctualPct} percent, late ${latePct} percent, absent ${absentPct} percent`}>
              <div className="pd-donut-hole" />
            </div>
            <div className="pd-donut-labels">
              <div><i className="blue" /><strong>{punctualPct}%</strong><span>Punctual ({summary.punctual})</span></div>
              <div><i className="orange" /><strong>{latePct}%</strong><span>Late ({summary.late})</span></div>
              <div><i className="orange2" /><strong>{absentPct}%</strong><span>Absent ({summary.absent})</span></div>
            </div>
          </div>
          <p className="pd-punctuality-footnote">
            {total === 0 ? "No arrivals or absences recorded for today's shifts yet." : `Based on ${total} recorded arrival(s) or absence(s).`}
            {summary.awaiting_clock_in > 0 ? ` ${summary.awaiting_clock_in} shift(s) awaiting clock-in.` : ""}
          </p>
        </>
      )}
    </section>
  );
}
