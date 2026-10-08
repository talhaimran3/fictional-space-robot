import React from "react";
import { Building2, Users, Clock3, CalendarDays, ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useOrganizations } from "../hooks/useOrganizations";
import { useEmployees } from "../hooks/useEmployees";
import { useShifts } from "../hooks/useShifts";
import "./Workspace.css";
const initials=(name="")=>name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase()||"OR";
export default function AdminDashboard(){
 const {organizations=[],loading:o}=useOrganizations(),{employees=[],loading:e}=useEmployees(),{shifts=[],loading:s}=useShifts();
 const loading=o||e||s, now=new Date();
 const active=shifts.filter(x=>new Date(x.start_time)<=now&&new Date(x.end_time)>=now&&x.status!=="cancelled").length;
 const hours=shifts.reduce((n,x)=>n+Number(x.total_hours||0),0);
 if(loading)return <div className="sp-page"><div className="sp-state"><span className="sp-spinner"/>Loading dashboard...</div></div>;
 return <div className="sp-page">
  <div className="sp-page-head"><div><span className="sp-eyebrow">WORKSPACE</span><h1>Dashboard</h1><p>Your workforce at a glance.</p></div><Link className="sp-primary" to="/admin/shifts"><Plus size={16}/> Quick Shift</Link></div>
  <div className="sp-tabs"><span className="is-active">Overview</span><span>Real-Time Analytics</span><span>Budget Tracking</span><span>Alerts</span></div>
  <div className="sp-kpis"><Kpi icon={Users} label="People" value={employees.length} note="Employees" tone="blue"/><Kpi icon={Building2} label="Organizations" value={organizations.length} note="Active tenants" tone="purple"/><Kpi icon={Clock3} label="Scheduled Hours" value={hours.toFixed(1)+"h"} note={shifts.length+" shifts"} tone="green"/><Kpi icon={CalendarDays} label="Active Today" value={active} note="Currently scheduled" tone="peach"/></div>
  <div className="sp-grid sp-grid--dashboard">
   <section className="sp-card"><div className="sp-card-head"><div><h2>Recent Organizations</h2><p>Tenants connected to your platform.</p></div><Link to="/admin/organizations">View all <ArrowRight size={14}/></Link></div><div className="sp-org-list">{organizations.slice(0,5).map(org=><Link className="sp-org-row" key={org.id} to={"/admin/organizations/"+org.id}><span className="sp-avatar sp-avatar--blue">{initials(org.name)}</span><div><strong>{org.name}</strong><small>{org.slug||"No slug"}</small></div><ArrowRight size={15}/></Link>)}{!organizations.length&&<div className="sp-empty">No organizations yet.</div>}</div></section>
   <section className="sp-card"><div className="sp-card-head"><div><h2>Quick Actions</h2><p>Jump into the workspace.</p></div></div><div className="sp-actions"><Link to="/admin/people"><Users size={18}/> People</Link><Link to="/admin/shifts"><CalendarDays size={18}/> Shifts</Link><Link to="/admin/timesheets"><Clock3 size={18}/> Timesheets</Link><Link to="/admin/organizations"><Building2 size={18}/> Organizations</Link></div></section>
  </div>
 </div>;
}
function Kpi({icon:Icon,label,value,note,tone}){return <article className="sp-kpi"><span className={"sp-kpi-icon "+tone}><Icon size={17}/></span><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></article>}