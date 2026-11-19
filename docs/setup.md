# Local Setup

## 1. Install

- Visual Studio Code
- Node.js LTS
- Git
- Docker Desktop with WSL 2

Verify:

```powershell
node --version
npm --version
git --version
```

## 2. Supabase

1. Create a Supabase project.
2. Open the SQL Editor.
3. Apply `database/migrations/001_initial_schema.sql`.
4. Copy the project URL and keys.
5. Copy `backend/.env.example` to `backend/.env` and fill server values.
6. Copy `frontend/.env.local.example` to `frontend/.env.local` and fill public values.

Never put `SUPABASE_SERVICE_ROLE_KEY` in Next.js or browser code.

## 3. Run Locally

Terminal 1:

```powershell
cd backend
npm install
npm run dev
```

Terminal 2:

```powershell
cd frontend
npm install
npm run dev
```

Open:

- Frontend: http://localhost:3000
- API health: http://localhost:4000/api/health

## 4. Docker

Docker is optional for the initial development phase.

```powershell
docker compose up --build
```

Stop:

```powershell
docker compose down
```

## 5. Live External Services

Before live data processing:

- Configure Supabase Auth and profile trigger
- Configure PayMongo sandbox credentials and webhook
- Configure Resend sender and API key
- Verify free-tier limits and legal requirements
