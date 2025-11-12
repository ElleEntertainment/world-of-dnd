import { Injectable } from '@angular/core';
import { GameSessionStorageService, LocalGameSessionData } from './game-session-storage.service';
import { GameSessionApiService, Skill, Spell, Talent } from './game-session-api.service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap, catchError, shareReplay } from 'rxjs/operators';
import { SkillRow } from './skills/skills-modal.component';

@Injectable({
  providedIn: 'root'
})
export class GameSessionSharedService {
  // Cache per dati statici
  private skillsCache$: Observable<SkillRow[]> | null = null;
  private spellsCache$: Observable<any[]> | null = null;
  private talentsCache$: Observable<any[]> | null = null;

  // Loading states
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Error handling
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(
    private storage: GameSessionStorageService,
    private api: GameSessionApiService
  ) {}

  // Carica le skills dal backend con caching
  loadSkillsFromServer(): Observable<SkillRow[]> {
    if (this.skillsCache$) {
      return this.skillsCache$;
    }

    this.loadingSubject.next(true);
    this.skillsCache$ = this.api.getAllSkills().pipe(
      map(response => {
        const skills = response.data || response;
        return Array.isArray(skills) ? skills.map(skill => ({
          name: skill.name,
          keyAbility: skill.keyAbility,
          keyAbilityShort: skill.keyAbilityShort,
          checked: false,
          checked2: false,
          ranks: 0,
          miscMod: 0,
          total: 0
        })) : [];
      }),
      tap(() => {
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next('Errore nel caricamento delle skills');
        console.error('Errore caricamento skills:', error);
        return of([]);
      }),
      shareReplay(1)
    );

    return this.skillsCache$;
  }

  // Carica gli spells dal backend con caching
  loadSpellsFromServer(): Observable<any[]> {
    if (this.spellsCache$) {
      return this.spellsCache$;
    }

    this.loadingSubject.next(true);
    this.spellsCache$ = this.api.getAllSpells().pipe(
      map(response => {
        const spells = response.data || response;
        return Array.isArray(spells) ? spells.map(spell => ({
          id: spell.id.toString(),
          name: spell.name,
          description: spell.description,
          icon: ''
        })) : [];
      }),
      tap(() => {
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next('Errore nel caricamento degli spells');
        console.error('Errore caricamento spells:', error);
        return of([]);
      }),
      shareReplay(1)
    );

    return this.spellsCache$;
  }

  // Carica i talents dal backend con caching
  loadTalentsFromServer(): Observable<any[]> {
    if (this.talentsCache$) {
      return this.talentsCache$;
    }

    this.loadingSubject.next(true);
    this.talentsCache$ = this.api.getAllTalents().pipe(
      map(response => {
        const talents = response.data || response;
        return Array.isArray(talents) ? talents.map(talent => ({
          id: talent.id.toString(),
          name: talent.name,
          description: talent.description,
          icon: ''
        })) : [];
      }),
      tap(() => {
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next('Errore nel caricamento dei talents');
        console.error('Errore caricamento talents:', error);
        return of([]);
      }),
      shareReplay(1)
    );

    return this.talentsCache$;
  }

  // Invalida la cache (per refresh manuale)
  clearCache() {
    this.skillsCache$ = null;
    this.spellsCache$ = null;
    this.talentsCache$ = null;
  }

  saveLocalData(campaignId: string, data: LocalGameSessionData) {
    if (!campaignId) return;
    try {
      this.storage.save(campaignId, data);
    } catch (e) {
      console.error('Errore salvataggio localStorage:', e);
    }
  }

  loadLocalData(campaignId: string): LocalGameSessionData | null {
    if (!campaignId) return null;
    try {
      return this.storage.load(campaignId);
    } catch (e) {
      console.error('Errore caricamento localStorage:', e);
      return null;
    }
  }

  clearLocalData(campaignId: string) {
    if (!campaignId) return;
    try {
      this.storage.remove(campaignId);
    } catch (e) {
      console.error('Errore rimozione localStorage:', e);
    }
  }

  hasLocalData(campaignId: string): boolean {
    if (!campaignId) return false;
    try {
      return this.storage.hasLocal(campaignId);
    } catch (e) {
      console.error('Errore verifica localStorage:', e);
      return false;
    }
  }

  persistAll(campaignId: string, data: LocalGameSessionData | null) {
    // If caller didn't provide data, try to load from local storage
    let payload = data;
    if (!payload || (typeof payload === 'object' && Object.keys(payload).length === 0)) {
      const stored = this.loadLocalData(campaignId);
      if (stored) {
        payload = stored;
      }
    }

    if (!payload) {
      console.warn('No session data available to persist for', campaignId);
      return;
    }

    // Always save the resolved payload locally first
    this.saveLocalData(campaignId, payload);

    // Trigger remote sync and subscribe so the HTTP request is actually executed.
    // Keep a minimal subscriber to avoid unhandled errors; errors are also handled inside syncToServer.
    this.syncToServer(campaignId, payload).subscribe({
      next: () => {
        // sync succeeded
      },
      error: () => {
        // sync failed (already logged inside syncToServer)
      }
    });
  }

  // Sincronizza i dati con il server con retry logic
  syncToServer(campaignId: string, data: LocalGameSessionData): Observable<any> {
    const sessionId = parseInt(campaignId, 10);
    this.loadingSubject.next(true);
    
    return this.api.syncSession(sessionId, data).pipe(
      tap(() => {
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
        console.log('Sincronizzazione completata con successo');
        // On successful remote save, clear local cache for this campaign
        try {
          this.clearLocalData(campaignId);
        } catch (e) {
          console.warn('Failed to clear local session data after sync', e);
        }
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next('Errore nella sincronizzazione con il server');
        console.error('Errore sincronizzazione:', error);
        // Mantieni i dati in localStorage in caso di errore
        throw error;
      })
    );
  }
}
