# Deployment Guide

This guide explains how to deploy the `hyperliquid_service` to a remote Linux server (Ubuntu/Debian assumed).

## Prerequisites
1.  **Remote Server**: A VPS (AWS EC2, DigitalOcean, Hetzner, etc.) running Linux.
2.  **Docker & Docker Compose**: Installed on the remote server.
3.  **SSH Access**: You should be able to SSH into your server.

## Method 1: The "Copy & Run" (Simplest)
This method involves copying your project files directly to the server.

### 1. Prepare your local Environment
Ensure your `.env` file is ready with production values.

### 2. Copy Files to Server
Run this command from your local terminal (replace `user@your-server-ip` with your actual details):

```bash
# Create directory on server
ssh user@your-server-ip "mkdir -p ~/hyperliquid_service"

# Copy essential files
scp -r src package.json package-lock.json tsconfig.json Dockerfile docker-compose.yml .dockerignore .env user@your-server-ip:~/hyperliquid_service/
```

### 3. Deploy on Server
SSH into your server and run:

```bash
ssh user@your-server-ip
cd ~/hyperliquid_service

# Build and start containers
docker-compose up --build -d
```

---

## Method 2: Git (Recommended)
This method connects your server to your Git repository.

### 1. Push Code
Push your latest changes to GitHub/GitLab.

### 2. Clone on Server
SSH into your server and run:

```bash
git clone <your-repo-url> hyperliquid_service
cd hyperliquid_service
```

### 3. Setup Environment
Create the `.env` file on the server (never commit `.env` to Git!):

```bash
nano .env
# Paste your environment variables here (BITQUERY_API_KEY, PUSHOVER credentials, etc.)
# Save and exit (Ctrl+X, Y, Enter)
```

### 4. Deploy
```bash
docker-compose up --build -d
```

---

## Post-Deployment

### Check Status
Verify services are running:
```bash
docker-compose ps
```

### View Logs
Watch logs in real-time (useful to see if the monitor is working):
```bash
docker-compose logs -f
```

### Health Check
Run this on the server (or from your browser if firewall allows port 3005):
```bash
curl http://localhost:3005/health
```

### Updates
To deploy new code later:

**Method 1**: Repeat the `scp` command and run `docker-compose up --build -d` again.

**Method 2**:
```bash
git pull
docker-compose up --build -d
```
