/**
 * Service CRUD users (utilise le plugin realtime)
 */

import { getDb } from './db.service.js';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

export async function findAll(): Promise<User[]> {
  const db = getDb();
  const rows = await db.query<User>('SELECT id, name, email, created_at FROM users ORDER BY id');
  return rows;
}

export async function findById(id: number): Promise<User | null> {
  const db = getDb();
  const rows = await db.query<User>('SELECT id, name, email, created_at FROM users WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function create(dto: CreateUserDto): Promise<User> {
  const db = getDb();
  const id = await db.insert('users', { name: dto.name, email: dto.email });
  const user = await findById(Number(id));
  if (!user) throw new Error('User not found after insert');
  return user;
}

export async function update(id: number, dto: UpdateUserDto): Promise<User | null> {
  const db = getDb();
  const updates: Record<string, string> = {};
  if (dto.name !== undefined) updates.name = dto.name;
  if (dto.email !== undefined) updates.email = dto.email;
  if (Object.keys(updates).length === 0) return findById(id);
  await db.update('users', { id }, updates);
  return findById(id);
}

export async function remove(id: number): Promise<boolean> {
  const db = getDb();
  const affected = await db.delete('users', { id });
  return affected > 0;
}
