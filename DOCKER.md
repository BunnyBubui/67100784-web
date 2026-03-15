# Docker Setup

This document provides instructions for running the AI Companion Suite in Docker containers.

## Prerequisites

- Docker installed on your system
- Docker Compose installed
- Existing Docker network named `netsiwapan02`

## Docker Network

This application connects to the `netsiwapan02` Docker network where the FastAPI backend service (`fastapi-backend`) is running.

### Verify the network exists

```bash
docker network ls | grep netsiwapan02
```

If the network doesn't exist, create it:

```bash
docker network create netsiwapan02
```

## Quick Start

### 1. Build and start the containers

```bash
docker-compose up -d --build
```

This will:
- Build the frontend React application
- Start both frontend and backend services on the `netsiwapan02` network
- Expose the frontend on port 3000
- Expose the backend API on port 8001

### 2. Access the application

Open your browser and navigate to:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001

### 3. View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ai-companion-frontend
docker-compose logs -f fastapi-backend
```

### 4. Stop the containers

```bash
docker-compose down
```

## Environment Configuration

The application uses environment variables to configure the API URL. Copy the example environment file and configure as needed:

```bash
cp .env.example .env
```

### Environment Variables

- `VITE_API_URL`: The base URL for the FastAPI backend API
  - In Docker: `http://fastapi-backend:8001` (uses Docker service name)
  - Locally: `http://localhost:8001`

## Docker Compose Services

### ai-companion-frontend

- **Image**: Built from Dockerfile
- **Container Name**: `ai-companion-frontend`
- **Ports**: `3000:80`
- **Network**: `netsiwapan02`
- **Dependencies**: `fastapi-backend`

### fastapi-backend

- **Image**: `fastapi-lm-api-siwapan-02:latest` (update this to match your actual image)
- **Container Name**: `fastapi-backend`
- **Ports**: `8001:8001`
- **Network**: `netsiwapan02`

## Building the Docker Image Manually

If you want to build the frontend image manually:

```bash
docker build -t ai-companion-frontend .
```

## Running with Custom Configuration

### Custom port mapping

Edit `docker-compose.yml` to change the port mapping:

```yaml
services:
  ai-companion-frontend:
    ports:
      - "8080:80"  # Use port 8080 instead of 3000
```

### Using a different backend image

Update the `fastapi-backend` service in `docker-compose.yml`:

```yaml
services:
  fastapi-backend:
    image: your-custom-image:latest
```

## Troubleshooting

### Container won't start

Check the logs:
```bash
docker-compose logs ai-companion-frontend
```

### Can't connect to backend

1. Verify both containers are on the same network:
```bash
docker network inspect netsiwapan02
```

2. Verify the backend container is running:
```bash
docker ps | grep fastapi-backend
```

3. Test backend connectivity from the frontend container:
```bash
docker exec -it ai-companion-frontend wget -O- http://fastapi-backend:8001/docs
```

### Network not found

If you get an error about the network not existing:
```bash
docker network create netsiwapan02
```

Then restart the containers:
```bash
docker-compose up -d
```

## Development Mode

For local development without Docker, use the standard npm commands:

```bash
npm install
npm run dev
```

The application will be available at http://localhost:8080

## Production Deployment

For production deployment:

1. Update the backend image name in `docker-compose.yml`
2. Set proper environment variables
3. Consider using a reverse proxy (nginx/traefik)
4. Enable HTTPS
5. Set up proper volume mounts for persistent data

## Architecture

```
┌─────────────────┐
│  Browser:3000   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ ai-companion-frontend   │
│ (nginx + React build)   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  netsiwapan02 network   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  fastapi-backend:8001   │
│  (FastAPI service)      │
└─────────────────────────┘
```

## Maintenance

### Update the application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Clean up

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Remove images
docker rmi ai-companion-frontend
```
