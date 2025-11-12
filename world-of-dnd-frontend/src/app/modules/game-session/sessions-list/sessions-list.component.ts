import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameSessionApiService, GameSession } from '../game-session-api.service';

@Component({
  selector: 'app-sessions-list',
  templateUrl: './sessions-list.component.html'
})
export class SessionsListComponent implements OnInit {
  sessions: GameSession[] = [];
  loading = false;
  error: string | null = null;

  // Create form model
  newName = '';
  newDescription = '';
  creating = false;

  constructor(private api: GameSessionApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions() {
    this.loading = true;
    this.error = null;
    this.api.getAllSessions().subscribe({
      next: (res) => {
        this.sessions = res || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore caricamento sessioni:', err);
        this.error = 'Errore caricamento sessioni';
        this.loading = false;
      }
    });
  }

  openSession(session: GameSession) {
    // Navigate to the game session page (DM or player will be handled by server/route)
    this.router.navigate(['/game-session', session.id]);
  }

  createSession() {
    if (!this.newName.trim()) return;
    this.creating = true;
    this.api.createSession({
      name: this.newName.trim(),
      description: this.newDescription.trim() || undefined
    }).subscribe({
      next: (created) => {
        // Dungeon Master for newly created session -> navigate directly to it
        this.creating = false;
        this.router.navigate(['/game-session', created.id]);
      },
      error: (err) => {
        console.error('Errore creazione sessione:', err);
        this.error = 'Errore creazione sessione';
        this.creating = false;
      }
    });
  }
}
