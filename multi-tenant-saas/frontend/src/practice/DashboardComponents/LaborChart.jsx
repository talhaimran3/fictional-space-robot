export function LaborChart() {
  const planned = [142, 105, 88, 169, 116, 154, 101];
  const actual = [98, 112, 94, 151, 109, 143, 76];
  const labels = ["Mon 12", "Tue 13", "Wed 14", "Thu 15", "Fri 16", "Sat 17", "Sun 18"];

  const points = (data) => data.map((v, i) => `${45 + i * 50},${160 - v * 0.65}`).join(" ");
  const area = (data) => `45,160 ${points(data)} 345,160`;

  return (
    <section className="pd-card pd-chart-card">
      <div className="pd-card-heading">
        <div>
          <h2>Scheduled vs. Actual Labor Hours</h2>
          <p>Aug 12 - Aug 18, 2024</p>
        </div>
        <div className="pd-legend">
          <span><i className="planned" /> Planned hours</span>
          <span><i className="actual" /> Actual hours</span>
        </div>
      </div>

      <div className="pd-chart-wrap">
        <div className="pd-chart-y">
          <span>200</span><span>150</span><span>100</span><span>50</span><span>0</span>
        </div>
        <svg className="pd-chart" viewBox="0 0 370 180" preserveAspectRatio="none">
          <defs>
            <linearGradient id="plannedFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#74b3e9" stopOpacity=".28" />
              <stop offset="1" stopColor="#74b3e9" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="actualFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#8d79ce" stopOpacity=".24" />
              <stop offset="1" stopColor="#8d79ce" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[20, 55, 90, 125, 160].map((y) => (
            <line key={y} x1="42" y1={y} x2="350" y2={y} className="pd-grid-line" />
          ))}
          <polygon points={area(planned)} fill="url(#plannedFill)" />
          <polygon points={area(actual)} fill="url(#actualFill)" />
          <polyline points={points(planned)} className="pd-line planned-line" />
          <polyline points={points(actual)} className="pd-line actual-line" />
          {planned.map((v, i) => (
            <circle key={`p${i}`} cx={45 + i * 50} cy={160 - v * .65} r="3" className="pd-point planned-point" />
          ))}
          {actual.map((v, i) => (
            <circle key={`a${i}`} cx={45 + i * 50} cy={160 - v * .65} r="3" className="pd-point actual-point" />
          ))}
          {labels.map((label, i) => (
            <text key={label} x={45 + i * 50} y="176" textAnchor="middle" className="pd-x-label">{label}</text>
          ))}
        </svg>
      </div>
    </section>
  );
}
