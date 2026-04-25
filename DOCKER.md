# Docker Setup

This project can run fully in Docker using one command.

## Prerequisites

- Docker Desktop installed
- Port `4200` free (frontend)
- Port `3000` free (backend)
- Port `27017` free (MongoDB)

## Optional environment variables

Create a `.env` file in the project root (same folder as `docker-compose.yml`) if you want to customize runtime values:

```env
NEWS_API_KEY=your_news_api_key
OLLAMA_BASE_URL=http://host.docker.internal:11434
AI_MODEL=qwen2.5:7b
AI_TEMPERATURE=0.2
AI_MAX_TOKENS=1000
AI_REQUEST_TIMEOUT_MS=60000
NEWS_API_URL=https://newsapi.org/v2
NEWS_CACHE_TTL=900
```

## Run

```bash
docker compose up --build
```

## Open app

- Frontend: `http://localhost:4200`
- API: `http://localhost:3000`

## Stop

```bash
docker compose down
```

To also remove MongoDB data volume:

```bash
docker compose down -v
```