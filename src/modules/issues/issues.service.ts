import pool from "../../config/db";
import { AppError } from "../../utils/AppError";

const attachReporter = async (issues: any[]) => {
  if (issues.length === 0) return [];

  const ids = issues.map((i) => i.reporter_id);
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
  const users = await pool.query(
    `SELECT id, name, role FROM users WHERE id IN (${placeholders})`,
    ids,
  );

  const userMap = new Map(users.rows.map((u) => [u.id, u]));

  return issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: userMap.get(issue.reporter_id) ?? null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));
};

export const createIssue = async (
  title: string,
  description: string,
  type: "bug" | "feature_request",
  reporter_id: number,
) => {
  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, reporter_id],
  );
  return result.rows[0];
};

export const getAllIssues = async (
  sort: string = "newest",
  type?: string,
  status?: string,
) => {
  const conditions: string[] = [];
  const values: string[] = [];
  let idx = 1;

  if (type) {
    conditions.push(`type = $${idx++}`);
    values.push(type);
  }
  if (status) {
    conditions.push(`status = $${idx++}`);
    values.push(status);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const order = sort === "oldest" ? "ASC" : "DESC";

  const result = await pool.query(
    `SELECT * FROM issues ${where} ORDER BY created_at ${order}`,
    values,
  );

  return attachReporter(result.rows);
};

export const getIssueById = async (id: number) => {
  const result = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    throw new AppError("Issue not found", 404);
  }
  const [issue] = await attachReporter(result.rows);
  return issue;
};

export const updateIssue = async (
  id: number,
  updates: { title?: string; description?: string; type?: string },
  requesterId: number,
  requesterRole: string,
) => {
  const existing = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);
  if (existing.rows.length === 0) {
    throw new AppError("Issue not found", 404);
  }
  const issue = existing.rows[0];

  const isMaintainer = requesterRole === "maintainer";
  const isOwner = issue.reporter_id === requesterId;
  const isOpen = issue.status === "open";

  if (!isMaintainer && !(isOwner && isOpen)) {
    throw new AppError("You can only edit your own open issues", 403);
  }

  if (!isMaintainer && issue.status === "resolved") {
    throw new AppError("Cannot edit a resolved issue", 409);
  }

  const result = await pool.query(
    `UPDATE issues
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         type = COALESCE($3, type),
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [updates.title, updates.description, updates.type, id],
  );

  return result.rows[0];
};

export const deleteIssue = async (id: number) => {
  const result = await pool.query(
    "DELETE FROM issues WHERE id = $1 RETURNING id",
    [id],
  );
  if (result.rows.length === 0) {
    throw new AppError("Issue not found", 404);
  }
};
