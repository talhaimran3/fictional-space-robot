import React,{useMemo,useState} from "react";
import {CalendarDays,Search,Plus,Pencil,Clock3} from "lucide-react";
import {useShifts} from "../hooks/useShifts";
import {useOrganizations} from "../hooks/useOrganizations";
import {AddEditShiftFormModal} from "../components/shifts/AddEditShiftFormModal";
import "./Workspace.css";
export default function Shifts(){
 const{shifts=[],loading,error}=useShifts();const{organizations=[]}=useOrganizations();const[search,setSearch]=useState("");const[status,setStatus]=useState("all");const[modal,setModal]=useState(false);const[editing,setEditing]=useState(null);const[orgId,setOrgId]=useState("");
 const rows=useMemo(()=>shifts.filter(s=>{const q=search.toLowerCase();return(!q||s.title?.toLowerCase().includes(q)||s.employee?.name?.toLowerCase().includes(q)||s.organization?.name?.toLowerCase().includes(q))&&(status==="all"||s.status===status)}),[shifts,search,status]);
 const openNew=()=>{setEditing(null);setOrgId(shifts[0]?.organization_id||organizations[0]?.id||"");setModal(true)};
 const openEdit=s=>{setEditing(s);setOrgId(s.organization_id);setModal(true)};
 if(loading)return <div className="sp-page"><div className="sp-state"><span className="sp-spinner"/>Loading shifts...</div></div>;
 if(error)return <div className="sp-page"><div className="sp-error">{error}</div></div>;
 return <div className="sp-page"><div className="sp-page-head"><div><span className="sp-eyebrow">SCHEDULING</span><h1>Shifts</h1><p>A clear schedule using the live admin data.</p></div><button className="sp-primary" onClick={openNew}><Plus size={16}/> Quick Shift</button></div>
 <div className="sp-toolbar"><div className="sp-search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search shifts, staff, organizations..."/></div><select className="sp-select" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no_show">No show</option></select></div>
 <div className="sp-shift-list">{rows.map(s=><article className="sp-shift-row" key={s.id}><div className="sp-shift-cell"><strong>{s.title||s.name||"Scheduled Shift"}</strong><span>{s.organization?.name||"Organization"} · {s.employee?.name||s.employee_name||"Unassigned"}</span></div><div className="sp-shift-cell"><span>START</span><strong>{new Date(s.start_time).toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"})}</strong></div><div className="sp-shift-cell"><span>END</span><strong>{new Date(s.end_time).toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"})}</strong></div><div className="sp-shift-cell"><span>HOURS</span><strong>{s.total_hours??"—"}</strong></div><button className="sp-secondary sp-row-action" onClick={()=>openEdit(s)}><Pencil size={13}/> Edit</button></article>)}{!rows.length&&<div className="sp-card"><div className="sp-empty"><Clock3 size={24}/>No shifts found.</div></div>}</div>
 {modal&&orgId&&<AddEditShiftFormModal isOpen onClose={()=>setModal(false)} organizationId={orgId} shift={editing} onSuccess={()=>window.location.reload()}/>}
 </div>;
}