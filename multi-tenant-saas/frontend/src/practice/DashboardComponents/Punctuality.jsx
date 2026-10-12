export function Punctuality() {
  return (
    <section className="pd-card pd-punctuality">
      <div className="pd-card-heading">
        <div>
          <h2>Staff Punctuality Overview</h2>
          <p>Today</p>
        </div>
      </div>

      <div className="pd-donut-area">
        <div className="pd-donut">
          <div className="pd-donut-hole" />
        </div>
        <div className="pd-donut-labels">
          <div><i className="blue" /><strong>90%</strong><span>Punctual</span></div>
          <div><i className="orange" /><strong>5%</strong><span>Late</span></div>
          <div><i className="orange2" /><strong>5%</strong><span>Absent</span></div>
        </div>
      </div>
    </section>
  );
}