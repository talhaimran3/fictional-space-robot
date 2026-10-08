import bcrypt from "bcryptjs";
import db from "../config/database.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.full_name,
  role: u.role,
  organization_id: u.organization_id,
  organization_name: u.organization_name || null,
  organization_slug: u.organization_slug || null,
  status: u.status || "active",
});

const signToken = (u) =>
  jwt.sign(
    { userId: u.id, email: u.email, role: u.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

export const registerUser = async (req, res) => {
  const { email, password, name, organization_name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success:false, message:"Name, email and password are required." });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const slugBase = (organization_name || `${name.trim()}'s Organization`)
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "organization";
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const hashedPassword = await bcrypt.hash(password, 10);
    const org = await client.query(
      `INSERT INTO organizations(name,slug,created_at)
       VALUES($1,$2,now()) RETURNING id,name,slug`,
      [organization_name?.trim() || `${name.trim()}'s Organization`, slug]
    );
    const result = await client.query(
      `INSERT INTO users(email,password,password_hash,full_name,role,organization_id,status)
       VALUES($1,$2,$2,$3,'staff',$4,'active')
       RETURNING id,email,full_name,role,organization_id,status`,
      [email.trim().toLowerCase(), hashedPassword, name.trim(), org.rows[0].id]
    );
    await client.query("UPDATE organizations SET created_by=$1 WHERE id=$2", [result.rows[0].id, org.rows[0].id]);
    await client.query("COMMIT");

    const user = { ...result.rows[0], organization_name: org.rows[0].name, organization_slug: org.rows[0].slug };
    res.status(201).json({ success:true, message:"User registered successfully", token:signToken(user), user:publicUser(user) });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505") return res.status(409).json({ success:false,message:"Email already exists." });
    console.error("Error registering user:",err);
    res.status(500).json({ success:false,message:"Server error." });
  } finally { client.release(); }
};

export const loginUser = async (req,res) => {
  const {email,password}=req.body;
  if(!email||!password)return res.status(400).json({success:false,message:"Email and password are required."});
  try{
    const {rows}=await db.query(
      `SELECT u.id,u.email,u.password,u.full_name,u.role,u.organization_id,u.status,
              o.name AS organization_name,o.slug AS organization_slug
       FROM users u LEFT JOIN organizations o ON o.id=u.organization_id
       WHERE LOWER(u.email)=LOWER($1)`,
      [email.trim()]
    );
    if(!rows.length)return res.status(401).json({success:false,message:"Invalid credentials."});
    const user=rows[0];
    if(user.status==="inactive")return res.status(403).json({success:false,message:"This account is inactive."});
    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch)return res.status(401).json({success:false,message:"Invalid credentials."});
    res.json({success:true,message:"Login successful",token:signToken(user),user:publicUser(user)});
  }catch(err){console.error("Error logging in user:",err);res.status(500).json({success:false,message:"Server error."});}
};

export const getCurrentUser = async(req,res,next)=>{
 try{
  const {rows}=await db.query(
   `SELECT u.id,u.email,u.full_name,u.role,u.organization_id,u.status,
           o.name AS organization_name,o.slug AS organization_slug
    FROM users u LEFT JOIN organizations o ON o.id=u.organization_id
    WHERE u.id=$1`,[req.user.userId]
  );
  if(!rows.length)return res.status(404).json({success:false,message:"User not found."});
  res.json({success:true,user:publicUser(rows[0])});
 }catch(error){next(error);}
};
