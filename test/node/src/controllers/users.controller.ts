
import type { Request, Response } from 'express';
import * as usersService from '../services/users.service.js';

export async function list(_req: Request, res: Response): Promise<void> {
  try {
    const users = await usersService.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur serveur' });
  }
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'id invalide' });
    return;
  }
  try {
    const user = await usersService.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User non trouvé' });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur serveur' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  const { name, email } = req.body ?? {};
  if (!name || !email || typeof name !== 'string' || typeof email !== 'string') {
    res.status(400).json({ error: 'name et email requis (chaînes)' });
    return;
  }
  try {
    const user = await usersService.create({ name: name.trim(), email: email.trim() });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur serveur' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'id invalide' });
    return;
  }
  const { name, email } = req.body ?? {};
  const dto: { name?: string; email?: string } = {};
  if (name !== undefined) dto.name = String(name).trim();
  if (email !== undefined) dto.email = String(email).trim();
  if (Object.keys(dto).length === 0) {
    res.status(400).json({ error: 'aucun champ à mettre à jour' });
    return;
  }
  try {
    const user = await usersService.update(id, dto);
    if (!user) {
      res.status(404).json({ error: 'User non trouvé' });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur serveur' });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'id invalide' });
    return;
  }
  try {
    const deleted = await usersService.remove(id);
    if (!deleted) {
      res.status(404).json({ error: 'User non trouvé' });
      return;
    }
    res.json({ deleted: id });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur serveur' });
  }
}
