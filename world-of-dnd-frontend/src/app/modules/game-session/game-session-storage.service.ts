import { Injectable } from '@angular/core';
import { SkillRow } from './skills/skills-modal.component';

export interface LocalGameSessionData {
  character: any;
  spellBar: any[];
  bagItems: any[];
  gold: number;
  silver: number;
  copper: number;
  skillsList: SkillRow[];
  annotazioni?: string;
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
