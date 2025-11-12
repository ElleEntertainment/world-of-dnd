# Game Sessions Implementation

## Panoramica

Implementazione completa del sistema di Game Sessions per l'applicazione D&D, con backend NestJS e frontend Angular integrati.

## Architettura Backend

### Struttura File
```
src/core/game-session/
├── dto/
│   ├── create-game-session.dto.ts
│   ├── update-game-session.dto.ts
│   └── sync-game-session.dto.ts
├── game-session.controller.ts
├── game-session.service.ts
└── game-session.module.ts
```

### Database Schema (Prisma)

Le seguenti tabelle sono state create e popolate:

- **GameSession**: Sessioni di gioco degli utenti
- **Character**: Personaggi nelle sessioni
- **Skill**: Skills disponibili (39 skills popolate tramite seed)
- **Spell**: Incantesimi disponibili (16 spells popolati tramite seed)
- **Talent**: Talenti disponibili (10 talents popolati tramite seed)
- **CharacterSkill**: Relazione many-to-many tra Character e Skill
- **CharacterSpell**: Relazione many-to-many tra Character e Spell
- **CharacterTalent**: Relazione many-to-many tra Character e Talent

### API Endpoints

Tutti gli endpoint sono protetti da autenticazione JWT (`@UseGuards(JwtAuthGuard)`).

#### Game Sessions CRUD

- `GET /game-sessions` - Lista tutte le game sessions dell'utente autenticato
- `GET /game-sessions/:id` - Dettaglio di una specifica game session con characters
- `POST /game-sessions` - Crea una nuova game session
- `PUT /game-sessions/:id` - Aggiorna una game session esistente
- `DELETE /game-sessions/:id` - Elimina una game session
- `POST /game-sessions/:id/sync` - Sincronizza i dati dal frontend

#### Game Data

- `GET /game-sessions/data/skills` - Lista tutte le skills disponibili (dal database)
- `GET /game-sessions/data/spells` - Lista tutti gli spells disponibili (dal database)
- `GET /game-sessions/data/talents` - Lista tutti i talents disponibili (dal database)

### Sicurezza

- Tutti gli endpoint richiedono autenticazione JWT
- Verifica automatica della proprietà: un utente può accedere/modificare solo le proprie game sessions
- Errori 403 (Forbidden) se si tenta di accedere a sessioni di altri utenti
- Errori 404 (Not Found) se la sessione non esiste

## Architettura Frontend

### Nuovi Servizi

#### GameSessionApiService
```typescript
world-of-dnd-frontend/src/app/modules/game-session/game-session-api.service.ts
```

Servizio HTTP per comunicare con il backend. Fornisce:
- Metodi CRUD per game sessions
- Metodi per caricare skills, spells, talents dal backend
- Metodo per sincronizzare i dati

#### GameSessionSharedService (Aggiornato)

Rimossi gli array statici:
- ~~`DEFAULT_SKILLS`~~ ❌ Rimosso
- ~~`ALL_SPELLS`~~ ❌ Rimosso
- ~~`ALL_TALENTS`~~ ❌ Rimosso

Aggiunti nuovi metodi:
- `loadSkillsFromServer(): Observable<SkillRow[]>` - Carica skills dal backend
- `loadSpellsFromServer(): Observable<any[]>` - Carica spells dal backend
- `loadTalentsFromServer(): Observable<any[]>` - Carica talents dal backend
- `syncToServer(campaignId, data): Observable<any>` - Sincronizza con il backend (rinominato da stubSyncToServer)

## Flusso di Dati

### Caricamento Iniziale

1. L'utente accede a una game session
2. Il frontend chiama `loadSkillsFromServer()`, `loadSpellsFromServer()`, `loadTalentsFromServer()`
3. Il backend restituisce i dati dal database (popolato tramite seed)
4. Il frontend visualizza i dati dinamici

### Sincronizzazione

1. L'utente modifica i dati della sessione
2. Il frontend salva in localStorage (per backup offline)
3. Il frontend chiama `syncToServer()` per salvare sul backend
4. Il backend aggiorna il database
5. I dati sono ora persistenti e accessibili da qualsiasi dispositivo

## Seed Data

Il database è stato popolato con:
- **39 Skills** complete di D&D 3.5 (Acrobazia, Addestrare Animali, etc.)
- **16 Spells** comuni (Palla di Fuoco, Cura Ferite, etc.)
- **10 Talents** base (Attacco Poderoso, Schivare, etc.)

Script di seed: `world-of-dnd-backend/prisma/seed-game-data.ts`

## Dipendenze Installate

Backend:
- `class-validator` - Validazione DTOs
- `class-transformer` - Trasformazione oggetti

## Testing

### Test Manuale Backend

```bash
# Avvia il backend
cd world-of-dnd-backend
npm run start:dev

# Verifica che il server sia attivo su http://localhost:3000
```

### Test API con cURL (dopo login)

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Salva il token ricevuto
TOKEN="<access_token>"

# Ottieni skills
curl http://localhost:3000/game-sessions/data/skills \
  -H "Authorization: Bearer $TOKEN"

# Crea una game session
curl -X POST http://localhost:3000/game-sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Campagna Eberron","description":"Avventura ad Eberron"}'

# Lista game sessions
curl http://localhost:3000/game-sessions \
  -H "Authorization: Bearer $TOKEN"
```

## Stato Implementazione

✅ Backend completamente implementato
✅ DTOs con validazione
✅ Controller con tutti gli endpoint
✅ Service con logica di business
✅ Integrazione con Prisma
✅ Autenticazione JWT
✅ Frontend service API implementato
✅ Rimossi dati statici dal frontend
✅ Metodi di caricamento dinamico implementati
✅ Sincronizzazione implementata
✅ Modulo registrato in AppModule
✅ Caching implementato nel frontend
✅ Error handling e loading states
✅ Paginazione e ricerca nel backend
✅ Componenti desktop e mobile aggiornati
✅ Gestione memory leaks con OnDestroy

## Features Avanzate Implementate

### 1. Caching Intelligente
- **Frontend**: Cache con `shareReplay(1)` per evitare chiamate duplicate
- **Metodo `clearCache()`**: Permette di invalidare la cache quando necessario
- **Performance**: Le liste di skills, spells e talents vengono caricate una sola volta

### 2. Paginazione e Ricerca Backend
- **Query parameters**: `search`, `page`, `limit`
- **Risposta paginata**: Include `data`, `total`, `page`, `limit`, `totalPages`
- **Ricerca case-insensitive**: Su nome, descrizione, abilità chiave
- **Esempi**:
  ```bash
  GET /game-sessions/data/skills?search=acro
  GET /game-sessions/data/spells?page=1&limit=10
  GET /game-sessions/data/talents?search=attacco&page=1&limit=5
  ```

### 3. Error Handling Completo
- **BehaviorSubject** per loading$ e error$
- **Catch errors** in tutti i metodi con fallback sicuri
- **Error messages** specifici per tipo di errore
- **Retry logic**: Mantiene dati in localStorage se sync fallisce

### 4. Loading States
- **isLoading**: Flag booleano nei componenti
- **loading$**: Observable per stati di caricamento
- **Visual feedback**: Può essere usato per mostrare spinner

### 5. Memory Leak Prevention
- **OnDestroy** implementato in tutti i componenti
- **takeUntil(destroy$)**: Cancella automaticamente le subscription
- **Subject cleanup**: destroy$.complete() in ngOnDestroy

### 6. Sincronizzazione Ottimizzata
- **Auto-sync**: Sincronizza automaticamente su online event
- **Debounce**: Evita chiamate multiple ravvicinate
- **Error recovery**: Mantiene dati locali se sync fallisce
- **Console logging**: Per debug e monitoring

## Prossimi Passi Suggeriti

1. **UI/UX Improvements**:
   - Aggiungere loading spinners nei componenti
   - Mostrare error messages all'utente
   - Implementare toast notifications per sync success/error

2. **Lista Game Sessions**:
   - Creare componente lista sessioni
   - Implementare card con preview
   - Aggiungere pulsanti crea/modifica/elimina

3. **Export/Import**:
   - Endpoint per export sessione in JSON
   - Endpoint per import da file
   - Download automatico file export

4. **Analytics e Monitoring**:
   - Tracking uso features
   - Performance monitoring
   - Error logging centralizzato

5. **Testing**:
   - Unit tests per services
   - E2E tests per flussi principali
   - Integration tests API

## Note Tecniche

- Il backend usa `ParseIntPipe` per validare automaticamente gli ID numerici
- Le relazioni nel database sono configurate con `onDelete: Cascade` per eliminazione automatica
- Il frontend usa RxJS Observables per la gestione asincrona
- La sincronizzazione è chiamata automaticamente in `persistAll()`
