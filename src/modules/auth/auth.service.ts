import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../config/db";
import { AppError } from "../../utils/AppError";
import { JwtPayload } from "../../types";

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: "contributor" | "maintainer",
) => {
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rows.length > 0) {
    throw new AppError("Email already registered", 400);
  }

  const hashed = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashed, role],
  );

  return result.rows[0];
};

export const loginUser = async (email: string, password: string) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = result.rows[0];

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const payload: JwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });

  const { password: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
};
