# Implementazione Autenticazione

## Panoramica
Il sistema di autenticazione è stato implementato utilizzando **Prisma ORM** con **PostgreSQL** (Supabase) e **JWT** per la gestione dei token.

## Stack Tecnologico
- **NestJS**: Framework backend
- **Prisma**: ORM per database
- **PostgreSQL**: Database (Supabase)
- **JWT**: Token di autenticazione
- **bcrypt**: Hashing password

## Struttura Database

### Tabella User
```prisma
model User {
  id                 Int      @id @default(autoincrement())
  email              String   @unique
  password           String
  name               String?
  isVerified         Boolean  @default(false)
  verificationToken  String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@map("users")
}
```

## Endpoints API

### POST /auth/register
Registra un nuovo utente.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Registrazione completata. Controlla la mail per confermare."
}
```

### POST /auth/login
Effettua il login e restituisce JWT access token e refresh token.

**Body:**
```json
{
  "email": "admin@admin.it",
  "password": "admin"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@admin.it",
    "name": "Administrator"
  }
}
```

### POST /auth/refresh
Rigenera un nuovo access token usando il refresh token.

**Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/logout
Effettua il logout invalidando il refresh token. **Richiede autenticazione**.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logout effettuato con successo"
}
```

### POST /auth/request-password-reset
Richiede il reset della password inviando un'email con il token.

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Se l'email esiste, riceverai le istruzioni per il reset della password"
}
```

### POST /auth/reset-password
Resetta la password usando il token ricevuto via email.

**Body:**
```json
{
  "token": "abc123...",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password resettata con successo"
}
```

### GET /auth/confirm-email?token=xxx
Conferma l'email dell'utente tramite token.

**Response:**
```json
{
  "message": "Email confermata"
}
```

### POST /auth/change-password
Cambia la password dell'utente. **Richiede autenticazione**.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "email": "user@example.com",
  "oldPassword": "oldpass",
  "newPassword": "newpass"
}
```

**Response:**
```json
{
  "message": "Password aggiornata con successo"
}
```

## Utente Admin di Default

Un utente amministratore è stato creato tramite seed:

- **Email**: `admin@admin.it`
- **Password**: `admin`
- **Stato**: Verificato (isVerified: true)

## Setup e Configurazione

### 1. Variabili d'Ambiente
Assicurati che il file `.env` contenga:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
SUPABASE_JWT_SECRET="your-secret-key"
```

### 2. Eseguire le Migrazioni
```bash
npm run prisma:createmigrations
```

### 3. Eseguire il Seed
```bash
npm run prisma:seed
```

### 4. Avviare il Server
```bash
npm run start:dev
```

## Sicurezza

- **Password Hashing**: Tutte le password sono hashate con bcrypt (10 salt rounds)
- **JWT Token**: I token hanno una durata di 1 giorno
- **Email Verification**: Gli utenti devono verificare l'email prima del login (eccetto admin)
- **Validazione**: Controlli su email duplicate e credenziali errate

## Struttura File

```
src/
├── prisma/
│   ├── prisma.service.ts    # Servizio Prisma
│   └── prisma.module.ts      # Modulo Prisma (Global)
├── core/
│   └── auth/
│       ├── auth.controller.ts  # Controller autenticazione
│       ├── auth.service.ts     # Logica autenticazione
│       ├── auth.module.ts      # Modulo autenticazione
│       ├── jwt.strategy.ts     # Strategia JWT Passport
│       └── jwt-auth.guard.ts   # Guard per proteggere route
prisma/
├── schema.prisma            # Schema database
├── seed.ts                  # Script seed admin user
└── migrations/              # Migrazioni database
```

## Note per il Frontend

Il frontend può chiamare gli endpoint auth con:

```typescript
// Login
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { access_token, user } = await response.json();

// Usare il token nelle richieste successive
const protectedResponse = await fetch('http://localhost:3000/protected-route', {
  headers: { 
    'Authorization': `Bearer ${access_token}`
  }
});
```

## Prossimi Passi

- [ ] Implementare refresh token
- [ ] Aggiungere rate limiting
- [ ] Implementare invio email reale per verifica
- [ ] Aggiungere password reset
- [ ] Implementare 2FA (opzionale)
