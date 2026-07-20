# AGENTS.md — AlgoGambit Frontend

These instructions apply to the entire frontend repository. Human instructions in the active task take precedence.

## Repository identity

- Repository: `https://github.com/youssefemadhassan66/LMS_FrontEnd.git`
- Default branch: `main`
- Local workspace: `F:\Study_OLD\Web-Development-projects\27-LMS\FrontEnd`
- Production site: `https://www.algogambit.online`
- Runtime/build contract: Node.js `>=22.12.0 <23`
- Framework: React 19 with Vite 8
- Package manager: npm with `package-lock.json`

The backend is a separate repository at `../Backend` / `LMS.git`. Do not mix backend changes into this repository.

## Production topology

The frontend is a Vite static build served by Nginx on an Oracle Cloud Always Free Ubuntu ARM VM:

```text
Browser
    -> https://www.algogambit.online
    -> Nginx static files from dist/
    -> HTTPS API and Socket.IO origin
    -> Nginx reverse proxy
    -> Node.js backend on private port 3000
```

- Never configure a production browser build to use `127.0.0.1`, `localhost`, or the private Node.js port.
- The intended backend origin is `https://api.algogambit.online`; confirm the live Nginx configuration before assuming it because the API may instead be proxied under the `www` host.
- Nginx must provide SPA history fallback, typically `try_files $uri $uri/ /index.html;`, so React Router routes survive direct navigation and refresh.
- Nginx must proxy Socket.IO/WebSocket upgrade headers on the backend route/host.

Production access and deployment are separate from normal code work. Do not SSH, deploy, modify Nginx, alter DNS, or replace public files unless the user explicitly requests it.

## Work already completed

Production preparation was merged into `main` in commit `521437f` (`Prepare frontend for production deployment`). The associated frontend CI run passed at the time.

That work established or reinforced:

- A Node 22 engine contract.
- Production build-time validation for public API and Socket.IO origins.
- Centralized API-origin normalization.
- Separation of local development proxy behavior from production URLs.
- Deployment-oriented environment documentation.

Do not bypass production origin validation by hardcoding IPs or local URLs in application components.

## Important files

- `package.json`: scripts and Node engine requirement.
- `vite.config.js`: Vite behavior and production environment validation.
- `.env.example`: documented public build variables.
- `src/utils/apiUrl.js`: normalized REST and Socket.IO origins.
- `src/utils/errorTracker.js`: optional remote frontend error endpoint.
- `src/utils/__tests__/apiUrl.test.js`: origin-contract tests.

Search for and reuse the centralized URL helpers instead of constructing backend URLs inside components.

## Required local verification

Install the locked dependencies:

```powershell
npm ci
```

Run the complete frontend verification set:

```powershell
npm test
npm run lint
npm run build
```

Run focused tests while developing, but run all three commands before publishing a release. If a task changes user flows, also test those flows in a browser.

## Environment variables

For local development, copy `.env.example` to `.env.local`. Files ending in `.local` are ignored by Git.

```powershell
Copy-Item .env.example .env.local
```

Relevant variables:

```env
VITE_API_BASE=
VITE_SOCKET_URL=
VITE_API_BASE_URL=
VITE_ERROR_ENDPOINT=
```

Contracts:

- `VITE_API_BASE` is required for production builds.
- `VITE_SOCKET_URL` is required for production builds.
- They must be non-local HTTPS origins only: no `/api` path and no trailing slash.
- `VITE_API_BASE_URL` is a deprecated local-development alias; do not use it for new production work.
- `VITE_ERROR_ENDPOINT` is optional and may contain a complete HTTPS endpoint path.
- All `VITE_*` values are public because Vite embeds them in browser JavaScript. Never place a private token or secret in a `VITE_*` variable.

Typical production-local configuration on Oracle:

```env
VITE_API_BASE=https://api.algogambit.online
VITE_SOCKET_URL=https://api.algogambit.online
VITE_ERROR_ENDPOINT=
```

The server file should be `.env.production.local`, which remains outside Git. Confirm the actual public backend hostname before building.

Vite reads these values at build time. Changing them requires a new `npm run build` and redeployment of `dist/`; restarting Nginx alone does not change an existing build.

## Local development

Start the frontend development server:

```powershell
npm run dev
```

When production origins are empty in local development, Vite may proxy API calls to the locally running backend according to `vite.config.js`. Do not weaken production validation to accommodate local development; use `.env.local` or the existing proxy.

## Git workflow

Before committing:

```powershell
git status
git diff
npm test
npm run lint
npm run build
```

Commit only intentional files:

```powershell
git add .
git commit -m "Describe the frontend update"
git push origin main
```

Do not commit `dist/`, `node_modules/`, `.env.local`, or `.env.production.local`.

## Manual frontend deployment

The normal release path is:

```text
edit/test on Windows -> push main -> pull main on Oracle -> build -> publish dist
```

The exact production repository directory and Nginx web root must be confirmed on the server. Useful discovery commands are:

```bash
find "$HOME" -maxdepth 3 -type d -name .git -print
sudo nginx -T 2>/dev/null | grep -nE "server_name|root "
```

Assuming the repository is `/home/ubuntu/LMS_FrontEnd` and the web root is `/var/www/algogambit`, an explicitly authorized deployment is:

```bash
cd ~/LMS_FrontEnd
git status
git branch --show-current
git pull --ff-only origin main
npm ci
npm test
npm run lint
npm run build
sudo rsync -a --delete dist/ /var/www/algogambit/
curl -I https://www.algogambit.online
```

Replace example paths with the actual Nginx configuration. The trailing slash after `dist/` is intentional.

Static file changes normally do not require an Nginx reload. If the Nginx configuration itself changes:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

- Stop if `git status` reports unexpected server edits.
- Use `git pull --ff-only` and do not create production-only merge commits.
- Do not use `git reset --hard` to resolve deployment drift.
- For a bad release, revert the bad commit in the development repository, push the revert, and redeploy.

## Release verification

After publishing:

1. Load `https://www.algogambit.online`.
2. Hard-refresh with `Ctrl+F5` if an older cached build appears.
3. Test signup/login and authenticated requests.
4. Test a data-loading page for each role affected by the change.
5. Test uploads if relevant.
6. Test Socket.IO messaging/notifications if relevant.
7. Test direct navigation and refresh on nested React Router routes.
8. Check the browser console and Network panel for CORS, mixed-content, or WebSocket failures.

When a release changes both repositories, deploy a backward-compatible backend first, verify its health, and then deploy the frontend.

## Compatibility and security expectations

- Do not hardcode the Oracle IP or `127.0.0.1` in frontend source.
- Do not put access tokens, SMTP credentials, database strings, or private API keys in frontend variables or source.
- Preserve credentialed CORS behavior and send credentials only where the established authentication design requires them.
- Keep API endpoint construction centralized.
- Preserve role-based navigation and protect sensitive UI, while remembering that backend authorization remains authoritative.
- Maintain accessible interactions, responsive layout, and meaningful loading/error/empty states.
- Avoid breaking currently deployed backend contracts unless both releases are deliberately coordinated.

## Related documentation

The parent workspace currently contains:

- `PROJECT_EXPLANATION.md`
- `DEPLOYMENT_PLAN.md`
- `SERVER_UPDATE_GUIDE.md`
- `specs/001-production-deployment/`

The parent directory is not a Git repository, so those files are local workspace documentation unless deliberately copied into a versioned repository.
