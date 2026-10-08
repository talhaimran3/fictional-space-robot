import React,{useMemo,useState} from "react";
import {Building2,Search,Plus,Pencil,ArrowRight} from "lucide-react";
import {Link} from "react-router-dom";
import {useOrganizations} from "../hooks/useOrganizations";
import {AddEditFormModal} from "../components/organizations/AddEditFormModal";
import "./Workspace.css";
const count=o=>Array.isArray(o.employees)?o.employees.length:Number(o.organization_members??o.employeeCount??0);
export default function Organizations(){
 const {organizations=[],loading,error}=useOrganizations(); const [search,setSearch]=useState(""); const [modal,setModal]=useState(false); const [editing,setEditing]=useState(null);
 const filtered=useMemo(()=>organizations.filter(o=>!search||o.name?.toLowerCase().includes(search.toLowerCase())||o.slug?.toLowerCase().includes(search.toLowerCase())),[organizations,search]);
 if(loading)return <div className="sp-page"><div className="sp-state"><span className="sp-spinner"/>Loading organizations...</div></div>;
 if(error)return <div className="sp-page"><div className="sp-error">{error}</div></div>;
 return <div className="sp-page">
  <div className="sp-page-head"><div><span className="sp-eyebrow">TENANTS</span><h1>Organizations</h1><p>Manage the organizations using ShiftPulse.</p></div><button className="sp-primary" onClick={()=>{setEditing(null);setModal(true)}}><Plus size={16}/> Add Organization</button></div>
  <div className="sp-toolbar"><div className="sp-search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search organizations..."/></div><span className="sp-muted">{filtered.length} of {organizations.length} organizations</span></div>
  <div className="sp-card-grid">{filtered.map(org=><article className="sp-org-card" key={org.id}><div className="sp-org-card-head"><span className="sp-avatar sp-avatar--purple"><Building2 size={17}/></span><div><h3>{org.name}</h3><p>{org.slug||"No slug"}</p></div></div><div className="sp-org-meta"><div><span>PEOPLE</span><strong>{count(org)}</strong></div><div><span>SHIFTS</span><strong>{org.shifts?.length??org.shiftCount??0}</strong></div><div><span>STATUS</span><strong>{org.status||"active"}</strong></div></div><div className="sp-org-actions"><Link to={"/admin/organizations/"+org.id}>View <ArrowRight size={13}/></Link><button onClick={()=>{setEditing(org);setModal(true)}} aria-label={"Edit "+org.name}><Pencil size={14}/></button></div></article>)}{!filtered.length&&<div className="sp-card"><div className="sp-empty">No organizations found.</div></div>}</div>
  <AddEditFormModal isOpen={modal} onClose={()=>setModal(false)} organization={editing} onSuccess={()=>window.location.reload()}/>
 </div>;
}