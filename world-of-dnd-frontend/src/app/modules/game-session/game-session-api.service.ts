import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GameSession {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}

export interface Skill {
  id: number;
  name: string;
  keyAbility: string;
  keyAbilityShort: string;
  description?: string;
}

export interface Spell {
  id: number;
  name: string;
  description: string;
  level?: number;
  school?: string;
}

export interface Talent {
  id: number;
  name: string;
  description: string;
  prerequisites?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameSessionApiService {
  private readonly apiUrl = 'http://localhost:3000/game-sessions';

  constructor(private http: HttpClient) {}

  // Game Sessions CRUD
  getAllSessions(): Observable<GameSession[]> {
    return this.http.get<GameSession[]>(this.apiUrl);
  }

  getSession(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createSession(data: { name: string; description?: string }): Observable<GameSession> {
    return this.http.post<GameSession>(this.apiUrl, data);
  }

  updateSession(id: number, data: { name?: string; description?: string }): Observable<GameSession> {
    return this.http.put<GameSession>(`${this.apiUrl}/${id}`, data);
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  syncSession(id: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/sync`, { data });
  }

  // Game Data (skills, spells, talents)
  getAllSkills(search?: string, page?: number, limit?: number): Observable<PaginatedResponse<Skill>> {
    let params: any = {};
    if (search) params.search = search;
    if (page) params.page = page.toString();
    if (limit) params.limit = limit.toString();
    
    return this.http.get<PaginatedResponse<Skill>>(`${this.apiUrl}/data/skills`, { params });
  }

  getAllSpells(search?: string, page?: number, limit?: number): Observable<PaginatedResponse<Spell>> {
    let params: any = {};
    if (search) params.search = search;
    if (page) params.page = page.toString();
    if (limit) params.limit = limit.toString();
    
    return this.http.get<PaginatedResponse<Spell>>(`${this.apiUrl}/data/spells`, { params });
  }

  getAllTalents(search?: string, page?: number, limit?: number): Observable<PaginatedResponse<Talent>> {
    let params: any = {};
    if (search) params.search = search;
    if (page) params.page = page.toString();
    if (limit) params.limit = limit.toString();
    
    return this.http.get<PaginatedResponse<Talent>>(`${this.apiUrl}/data/talents`, { params });
  }
}
