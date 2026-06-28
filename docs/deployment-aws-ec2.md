# AWS EC2 Deployment

Simple production deployment for CapRateAlpha using Docker on a single EC2 instance. No CI/CD pipeline required.

## Deployment shape

- EC2 instance runs Docker and Docker Compose
- `app` container runs the Next.js production build
- optional `caddy` container handles HTTPS and reverse proxy
- Supabase remains managed outside AWS

## Why this approach

- simple to reason about
- easy to rebuild or roll back on one server
- modular: app container only for private testing, or app plus Caddy for public traffic
- no EKS, ECS, Terraform, or CI/CD required for MVP

## Files added for deployment

- `Dockerfile`
- `docker-compose.ec2.yml`
- `Caddyfile`
- `.env.production.example`

## Option A: fastest private deploy

Use this when you want the app reachable at `http://EC2_PUBLIC_IP:3000`.

```bash
docker compose -f docker-compose.ec2.yml up -d --build app
```

Open EC2 security group port `3000` to your allowed IPs.

## Option B: simple public deploy with HTTPS

Use this when you have a domain such as `app.capratealpha.com`.

```bash
docker compose --profile public -f docker-compose.ec2.yml up -d --build
```

Caddy will terminate HTTPS automatically after DNS points to the EC2 instance and ports `80` and `443` are open.

## Recommended EC2 baseline

- Amazon Linux 2023
- `t3.small` for initial MVP testing
- 30 GB gp3 volume

## Security group

Minimum inbound rules:

- `22` from your IP only
- `80` from `0.0.0.0/0` if using Caddy
- `443` from `0.0.0.0/0` if using Caddy
- `3000` only if using app-only mode

## Server bootstrap

SSH into the instance and install Docker on Amazon Linux 2023:

```bash
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

## App setup on the instance

```bash
cd <your-existing-repo-directory>
git pull
cp .env.production.example .env.production
```

If you have not pulled the repo onto the instance yet:

```bash
git clone <your-repo-url> capratealpha
cd capratealpha
cp .env.production.example .env.production
```

Fill in `.env.production`:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- optional notification and OpenAI keys
- `APP_DOMAIN` if using Caddy

Important:

- `NEXT_PUBLIC_APP_URL` must be the public URL users will use
- for HTTPS, use `https://...`
- do not commit `.env.production`

## Deploy commands

App only:

```bash
docker compose -f docker-compose.ec2.yml up -d --build app
```

App plus HTTPS:

```bash
docker compose --profile public -f docker-compose.ec2.yml up -d --build
```

## Verify deploy

Check container health:

```bash
docker compose -f docker-compose.ec2.yml ps
docker compose -f docker-compose.ec2.yml logs app --tail=100
```

If using Caddy:

```bash
docker compose -f docker-compose.ec2.yml logs caddy --tail=100
```

Then verify:

- signup works
- login redirect returns to the right domain
- onboarding loads
- publish flow works
- public vacancy page loads
- photo uploads still reach Supabase storage

## Updating the app

Pull latest code and rebuild:

```bash
git pull
docker compose -f docker-compose.ec2.yml up -d --build app
```

If using Caddy too:

```bash
docker compose --profile public -f docker-compose.ec2.yml up -d --build
```

## Rollback

Simplest rollback path for MVP:

1. checkout the previous git commit
2. rebuild the containers

```bash
git checkout <previous-commit>
docker compose -f docker-compose.ec2.yml up -d --build app
```

## Notes for later

Not needed for MVP yet:

- ECS or Kubernetes
- ECR-based image promotion
- GitHub Actions deployment pipeline
- blue/green release workflow
- autoscaling

Those can come later if usage justifies them.
