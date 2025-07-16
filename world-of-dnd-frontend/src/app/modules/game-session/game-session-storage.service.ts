import { Injectable } from '@angular/core';

export interface LocalGameSessionData {
  character: any;
  abilityBar: any[];
  bagItems: any[];
  gold: number;
  silver: number;
  copper: number;
  // Add more fields as needed
}

@Injectable({ providedIn: 'root' })
export class GameSessionStorageService {
  getKey(sessionId: string | null): string {
    return `dnd-session-${sessionId}`;
  }

  save(sessionId: string | null, data: LocalGameSessionData) {
    if (!sessionId) return;
    localStorage.setItem(this.getKey(sessionId), JSON.stringify(data));
  }

  load(sessionId: string | null): LocalGameSessionData | null {
    if (!sessionId) return null;
    const raw = localStorage.getItem(this.getKey(sessionId));
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  }

  remove(sessionId: string | null) {
    if (!sessionId) return;
    localStorage.removeItem(this.getKey(sessionId));
  }

  hasLocal(sessionId: string | null): boolean {
    if (!sessionId) return false;
    return !!localStorage.getItem(this.getKey(sessionId));
  }
}
