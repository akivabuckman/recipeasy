# 🍳 Recipeasy

Turn any recipe into a clean, interactive cooking experience — paste a URL or drop in raw recipe text and get a neatly structured ingredient list and step-by-step instructions you can scale, convert units, and check off as you cook.

## What it does

- **Scrape from a URL** — paste any recipe link and Recipeasy fetches the page, extracts the recipe content, and parses it into structured data
- **Convert pasted text** — paste raw recipe text directly if the site doesn't scrape well
- **Scale ingredients** — change any ingredient quantity and all others scale proportionally
- **Unit conversion** — switch between cups, tablespoons, grams, ounces, and more on the fly
- **Check-off mode** — tick off ingredients and steps as you go
- **Light/dark mode** — persisted to localStorage

## Architecture

```
Browser → React frontend (EC2)
              ↓
        AWS API Gateway
              ↓
         AWS Lambda (Python)
              ↓
    ┌─────────────────────┐
    │  BeautifulSoup       │  scrape + parse HTML
    │  JSON-LD extraction  │  structured recipe schema
    │  Claude Sonnet API   │  AI extraction fallback
    └─────────────────────┘
```

### Frontend

React 19 + TypeScript + Tailwind CSS v4, built with Vite. Served as a static bundle via [`serve`](https://github.com/vercel/serve) on EC2 inside Docker.

### Backend (Lambda)

A single Python Lambda function (`lambda/lambda_function.py`) exposed via AWS API Gateway (HTTP API). It handles two modes:

- **`scrape`** — fetches the URL, attempts JSON-LD structured data extraction first (most reliable), then falls back to BeautifulSoup HTML parsing with recipe-specific CSS selectors
- **`convert`** — skips scraping, takes raw text directly

In both modes the extracted text is passed to **Claude Sonnet** (`claude-sonnet-4-20250514`) via the Anthropic API, which returns a strict JSON object with normalized ingredients (`{ unit, count }`) and instructions.

## CI/CD

GitHub Actions deploys on every PR merged to `main`:

1. `npm audit` — fails the pipeline on high-severity vulnerabilities
2. Docker multi-stage build — injects `VITE_GIT_SHA` as a build arg for version tracking
3. Image pushed to **Amazon ECR**
4. SSH into EC2, pull the new image, restart the container on the `web` Docker network

Workflow file: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

### Required GitHub secrets/vars

| Name | Type | Description |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | Secret | IAM credentials for ECR push |
| `AWS_SECRET_ACCESS_KEY` | Secret | IAM credentials for ECR push |
| `EC2_HOST` | Secret | EC2 public IP or hostname |
| `EC2_SSH_KEY` | Secret | Private SSH key for EC2 access |
| `ECR_REGISTRY` | Variable | ECR registry URL (e.g. `123456789.dkr.ecr.ap-southeast-1.amazonaws.com`) |

## Local development

```bash
# Frontend
npm install
npm run dev

# Build for production
npm run build

# Run via Docker Compose
docker compose up --build
```

The Docker container serves the built frontend on port **5179**.
