import bcrypt from "bcryptjs";
import db from "../config/database.js";

const userId = (req) => req.user?.userId || req.user?.id;

export const getOrganization = async (req, res) => {
  const { organizationId } = req;
  const { rows } = await db.query(
    `SELECT id, name, slug, created_at
     FROM organizations
     WHERE id = $1`,
    [organizationId]
  );
  if (!rows.length) return res.status(404).json({ success: false, message: "Organization not found." });
  res.json({ success: true, data: rows[0] });
};

export const getDashboard = async (req, res, next) => {
  try {
    const { organizationId } = req;
    const result = await db.query(
      `SELECT
        (SELECT COUNT(*) FROM users WHERE organization_id = $1 AND role <> 'developer')::int AS employees,
        (SELECT COUNT(*) FROM projects WHERE organization_id = $1)::int AS projects,
        (SELECT COUNT(*) FROM shifts WHERE organization_id = $1 AND start_time::date = CURRENT_DATE)::int AS todays_shifts,
        (SELECT COUNT(*) FROM shifts WHERE organization_id = $1 AND status = 'completed')::int AS completed_shifts,
        COALESCE((SELECT SUM(EXTRACT(EPOCH FROM (end_time-start_time))/3600)
          FROM shifts WHERE organization_id = $1
          AND status = 'completed'
          AND date_trunc('month', start_time) = date_trunc('month', CURRENT_DATE)),0)::numeric(10,2) AS current_month_worked_hours,
        COALESCE((SELECT SUM(EXTRACT(EPOCH FROM (end_time-start_time))/3600)
          FROM shifts WHERE organization_id = $1
          AND status = 'scheduled'
          AND start_time > now()
          AND date_trunc('month', start_time) = date_trunc('month', CURRENT_DATE)),0)::numeric(10,2) AS upcoming_scheduled_hours`,
      [organizationId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

export const getUsers = async (req, res, next) => {
  try {
    const { organizationId } = req;
    const { search = "", status = "", role = "", project_id = "" } = req.query;
    const values = [organizationId];
    const where = ["u.organization_id = $1", "u.role <> 'developer'"];

    if (search) {
      values.push(`%${search.trim()}%`);
      where.push(`(u.full_name ILIKE $${values.length} OR u.email ILIKE $${values.length})`);
    }
    if (status) { values.push(status); where.push(`u.status = $${values.length}`); }
    if (role) { values.push(role); where.push(`u.role = $${values.length}`); }
    if (project_id) {
      values.push(project_id);
      where.push(`EXISTS (SELECT 1 FROM user_projects up WHERE up.user_id = u.id AND up.project_id = $${values.length})`);
    }

    const { rows } = await db.query(
      `SELECT u.id, u.email, u.full_name, u.role, u.organization_id, u.status,
              u.hourly_rate, u.created_at, u.updated_at,
              COALESCE(
                jsonb_build_object('id', p.id, 'name', p.name, 'code', p.code, 'status', p.status),
                NULL
              ) AS project,
              (SELECT COUNT(*)::int FROM shifts s WHERE s.organization_id = u.organization_id AND s.employee_id = u.id) AS total_shifts
       FROM users u
       LEFT JOIN user_projects up ON up.user_id = u.id
       LEFT JOIN projects p ON p.id = up.project_id
       WHERE ${where.join(" AND ")}
       ORDER BY u.full_name ASC`,
      values
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

export const createUser = async (req, res, next) => {
  const client = await db.connect();
  try {
    const { organizationId } = req;
    const { name, email, password, role = "staff", status = "active", hourly_rate = null, project_id = null } = req.body;
    if (!name?.trim() || !email?.trim()) return res.status(400).json({ success:false, message:"Name and email are required." });

    await client.query("BEGIN");
    const existing = await client.query("SELECT id FROM users WHERE LOWER(email)=LOWER($1)", [email.trim()]);
    if (existing.rows.length) return res.status(409).json({ success:false, message:"A user with this email already exists." });

    const hash = password ? await bcrypt.hash(password, 10) : null;
    const inserted = await client.query(
      `INSERT INTO users (email, password, password_hash, full_name, role, organization_id, status, hourly_rate)
       VALUES ($1,$2,$2,$3,$4,$5,$6,$7)
       RETURNING id,email,full_name,role,organization_id,status,hourly_rate,created_at`,
      [email.trim().toLowerCase(), hash, name.trim(), role, organizationId, status, hourly_rate]
    );
    if (project_id) {
      await client.query("INSERT INTO user_projects (user_id, project_id) VALUES ($1,$2)", [inserted.rows[0].id, project_id]);
    }
    await client.query("COMMIT");
    res.status(201).json({ success:true, data:inserted.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally { client.release(); }
};

export const updateUser = async (req, res, next) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;
    const { name, email, role, status, hourly_rate, project_id } = req.body;
    const result = await db.query(
      `UPDATE users SET
        full_name=COALESCE($1,full_name),
        email=COALESCE($2,email),
        role=COALESCE($3,role),
        status=COALESCE($4,status),
        hourly_rate=COALESCE($5,hourly_rate),
        updated_at=now()
       WHERE id=$6 AND organization_id=$7
       RETURNING id,email,full_name,role,organization_id,status,hourly_rate,updated_at`,
      [name?.trim() || null, email?.trim().toLowerCase() || null, role || null, status || null, hourly_rate ?? null, id, organizationId]
    );
    if (!result.rows.length) return res.status(404).json({ success:false,message:"Employee not found." });

    if (project_id !== undefined) {
      await db.query("DELETE FROM user_projects WHERE user_id=$1", [id]);
      if (project_id) await db.query(
        `INSERT INTO user_projects(user_id,project_id)
         SELECT $1,id FROM projects WHERE id=$2 AND organization_id=$3`,
        [id, project_id, organizationId]
      );
    }
    res.json({ success:true,data:result.rows[0] });
  } catch (error) { next(error); }
};

export const getProjects = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT p.id,p.name,p.code,p.description,p.status,p.created_at,
              COUNT(up.user_id)::int AS employee_count
       FROM projects p
       LEFT JOIN user_projects up ON up.project_id=p.id
       WHERE p.organization_id=$1
       GROUP BY p.id
       ORDER BY p.name`,
      [req.organizationId]
    );
    res.json({ success:true,data:rows });
  } catch (error) { next(error); }
};

export const createProject = async (req,res,next) => {
  try {
    const { name, code, description, status="active" } = req.body;
    if (!name?.trim()) return res.status(400).json({success:false,message:"Project name is required."});
    const { rows } = await db.query(
      `INSERT INTO projects(organization_id,name,code,description,status)
       VALUES($1,$2,$3,$4,$5)
       RETURNING id,name,code,description,status,created_at`,
      [req.organizationId,name.trim(),code||null,description||null,status]
    );
    res.status(201).json({success:true,data:rows[0]});
  } catch(error){ next(error); }
};

export const updateProject = async (req,res,next) => {
  try {
    const { id }=req.params;
    const { name,code,description,status }=req.body;
    const { rows }=await db.query(
      `UPDATE projects SET name=COALESCE($1,name),code=COALESCE($2,code),
       description=COALESCE($3,description),status=COALESCE($4,status)
       WHERE id=$5 AND organization_id=$6
       RETURNING id,name,code,description,status,created_at`,
      [name?.trim()||null,code??null,description??null,status||null,id,req.organizationId]
    );
    if(!rows.length)return res.status(404).json({success:false,message:"Project not found."});
    res.json({success:true,data:rows[0]});
  }catch(error){next(error);}
};

export const getShifts = async (req,res,next)=>{
  try{
    const {employee_id,project_id,status,from,to}=req.query;
    const values=[req.organizationId]; const where=["s.organization_id=$1"];
    const add=(v,sql)=>{values.push(v);where.push(sql.replace("?",String(values.length)));};
    if(employee_id)add(employee_id,"s.employee_id=$?");
    if(project_id)add(project_id,"s.project_id=$?");
    if(status)add(status,"s.status=$?");
    if(from)add(from,"s.start_time >= $?");
    if(to)add(to,"s.start_time < $?");
    const {rows}=await db.query(
      `SELECT s.id,s.organization_id,s.employee_id,s.project_id,s.name AS title,
              s.start_time,s.end_time,s.status,s.notes,
              ROUND(EXTRACT(EPOCH FROM(s.end_time-s.start_time))/3600.0,2) AS total_hours,
              u.full_name AS employee_name,
              p.name AS project_name
       FROM shifts s
       JOIN users u ON u.id=s.employee_id
       LEFT JOIN projects p ON p.id=s.project_id
       WHERE ${where.join(" AND ")}
       ORDER BY s.start_time ASC`,values);
    res.json({success:true,data:rows});
  }catch(error){next(error);}
};

export const createShift = async(req,res,next)=>{
 try{
  const {employee_id,project_id,start_time,end_time,status="scheduled",notes,title="Regular Shift"}=req.body;
  if(!employee_id||!start_time||!end_time)return res.status(400).json({success:false,message:"Employee, start time and end time are required."});
  if(new Date(start_time)>=new Date(end_time))return res.status(400).json({success:false,message:"End time must be after start time."});
  const check=await db.query(`SELECT id FROM users WHERE id=$1 AND organization_id=$2 AND role<>'developer'`,[employee_id,req.organizationId]);
  if(!check.rows.length)return res.status(400).json({success:false,message:"Employee does not belong to this organization."});
  if(project_id){
   const p=await db.query("SELECT id FROM projects WHERE id=$1 AND organization_id=$2",[project_id,req.organizationId]);
   if(!p.rows.length)return res.status(400).json({success:false,message:"Project does not belong to this organization."});
  }
  const {rows}=await db.query(
   `INSERT INTO shifts(organization_id,employee_id,project_id,start_time,end_time,status,notes,name,created_by)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING id,organization_id,employee_id,project_id,name AS title,start_time,end_time,status,notes`,
   [req.organizationId,employee_id,project_id||null,start_time,end_time,status,notes||null,title||"Regular Shift",userId(req)]
  );
  res.status(201).json({success:true,data:rows[0]});
 }catch(error){next(error);}
};

export const updateShift = async(req,res,next)=>{
 try{
  const {id}=req.params; const {employee_id,project_id,start_time,end_time,status,notes,title}=req.body;
  const {rows}=await db.query(
   `UPDATE shifts SET employee_id=COALESCE($1,employee_id),project_id=$2,start_time=COALESCE($3,start_time),
    end_time=COALESCE($4,end_time),status=COALESCE($5,status),notes=$6,name=COALESCE($7,name),updated_at=now()
    WHERE id=$8 AND organization_id=$9 AND COALESCE($3,start_time)<COALESCE($4,end_time)
    RETURNING id,organization_id,employee_id,project_id,name AS title,start_time,end_time,status,notes`,
   [employee_id||null,project_id??null,start_time||null,end_time||null,status||null,notes??null,title||null,id,req.organizationId]
  );
  if(!rows.length)return res.status(404).json({success:false,message:"Shift not found or invalid times."});
  res.json({success:true,data:rows[0]});
 }catch(error){next(error);}
};

export const deleteShift = async(req,res,next)=>{
 try{
  const {rows}=await db.query("DELETE FROM shifts WHERE id=$1 AND organization_id=$2 RETURNING id",[req.params.id,req.organizationId]);
  if(!rows.length)return res.status(404).json({success:false,message:"Shift not found."});
  res.json({success:true,data:rows[0]});
 }catch(error){next(error);}
};

export const getTimesheet = async(req,res,next)=>{
 try{
  const month=/^\d{4}-\d{2}$/.test(req.query.month||"")?req.query.month:new Date().toISOString().slice(0,7);
  const start=`${month}-01`;
  const {employee_id,project_id}=req.query;
  const values=[req.organizationId,start]; const where=["s.organization_id=$1","s.start_time >= $2","s.start_time < ($2::date + interval '1 month')"];
  if(employee_id){values.push(employee_id);where.push(`s.employee_id=$${values.length}`);}
  if(project_id){values.push(project_id);where.push(`s.project_id=$${values.length}`);}
  const {rows}=await db.query(
   `SELECT s.id AS shift_id,s.employee_id,u.full_name AS employee_name,p.name AS project_name,
    s.start_time,s.end_time,s.status,s.name AS title,
    ROUND(EXTRACT(EPOCH FROM(s.end_time-s.start_time))/3600.0,2) AS hours,
    u.hourly_rate
    FROM shifts s JOIN users u ON u.id=s.employee_id
    LEFT JOIN projects p ON p.id=s.project_id
    WHERE ${where.join(" AND ")} ORDER BY s.start_time ASC`,values);
  const summary=rows.reduce((a,r)=>{
    const h=Number(r.hours)||0;
    if(r.status==="completed")a.worked_hours+=h;
    if(r.status==="scheduled" && new Date(r.start_time)>new Date())a.scheduled_hours+=h;
    return a;
  },{worked_hours:0,scheduled_hours:0});
  summary.projected_hours=summary.worked_hours+summary.scheduled_hours;
  const employees={};
  for(const r of rows){
    const id=r.employee_id;
    if(!employees[id])employees[id]={employee_id:id,employee_name:r.employee_name,project_name:r.project_name,worked_hours:0,scheduled_hours:0,projected_hours:0,hourly_rate:r.hourly_rate};
    const h=Number(r.hours)||0;
    if(r.status==="completed")employees[id].worked_hours+=h;
    if(r.status==="scheduled" && new Date(r.start_time)>new Date())employees[id].scheduled_hours+=h;
  }
  Object.values(employees).forEach(e=>{e.projected_hours=e.worked_hours+e.scheduled_hours;e.worked_amount=e.hourly_rate?Number((e.worked_hours*Number(e.hourly_rate)).toFixed(2)):null;e.scheduled_amount=e.hourly_rate?Number((e.scheduled_hours*Number(e.hourly_rate)).toFixed(2)):null;e.projected_amount=e.hourly_rate?Number((e.projected_hours*Number(e.hourly_rate)).toFixed(2)):null;});
  res.json({success:true,month,summary,employees:Object.values(employees),shifts:rows});
 }catch(error){next(error);}
};

export const getDeveloperDashboard = async(req,res,next)=>{
 try{
  const {rows}=await db.query(`SELECT
   (SELECT COUNT(*) FROM organizations)::int organizations,
   (SELECT COUNT(*) FROM users WHERE role<>'developer')::int employees,
   (SELECT COUNT(*) FROM projects)::int projects,
   (SELECT COUNT(*) FROM shifts)::int shifts,
   COALESCE((SELECT SUM(EXTRACT(EPOCH FROM(end_time-start_time))/3600) FROM shifts WHERE status='completed' AND date_trunc('month',start_time)=date_trunc('month',CURRENT_DATE)),0)::numeric(10,2) current_month_hours`);
  res.json({success:true,data:rows[0]});
 }catch(error){next(error);}
};
