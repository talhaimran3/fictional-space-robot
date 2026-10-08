import { useCallback, useEffect, useState } from "react";
import apiClient from "../api/client";
import { useOrganization } from "../context/organizationContext";

export function useOrganizationWorkspace() {
  const { id } = useOrganization();
  const [dashboard,setDashboard]=useState(null),[users,setUsers]=useState([]),[projects,setProjects]=useState([]),[shifts,setShifts]=useState([]),[timesheet,setTimesheet]=useState(null);
  const [loading,setLoading]=useState(true),[error,setError]=useState("");
  const base=`/orgs/${id}`;
  const load=useCallback(async()=>{if(!id)return;setLoading(true);setError("");try{const [d,u,p,s]=await Promise.all([apiClient.get(`${base}/dashboard`),apiClient.get(`${base}/users`),apiClient.get(`${base}/projects`),apiClient.get(`${base}/shifts`)]);setDashboard(d.data.data);setUsers(u.data.data||[]);setProjects(p.data.data||[]);setShifts(s.data.data||[]);}catch(e){setError(e.response?.data?.message||"Unable to load organization data.");}finally{setLoading(false);}},[id]);
  useEffect(()=>{load();},[load]);
  const createUser=async p=>{const r=await apiClient.post(`${base}/users`,p);await load();return r.data.data};
  const updateUser=async(i,p)=>{const r=await apiClient.put(`${base}/users/${i}`,p);await load();return r.data.data};
  const createProject=async p=>{const r=await apiClient.post(`${base}/projects`,p);await load();return r.data.data};
  const updateProject=async(i,p)=>{const r=await apiClient.put(`${base}/projects/${i}`,p);await load();return r.data.data};
  const createShift=async p=>{const r=await apiClient.post(`${base}/shifts`,p);await load();return r.data.data};
  const updateShift=async(i,p)=>{const r=await apiClient.put(`${base}/shifts/${i}`,p);await load();return r.data.data};
  const deleteShift=async i=>{await apiClient.delete(`${base}/shifts/${i}`);await load()};
  const loadTimesheet=async params=>{const r=await apiClient.get(`${base}/timesheets/monthly`,{params});setTimesheet(r.data);return r.data};
  return {dashboard,users,projects,shifts,timesheet,loading,error,refresh:load,createUser,updateUser,createProject,updateProject,createShift,updateShift,deleteShift,loadTimesheet};
}
