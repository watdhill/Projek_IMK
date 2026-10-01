# Deployment checklist

## Backend

1. Copy `backend/.env.example` to a secret-managed environment. Do not commit `.env`.
2. Set unique values for `ADMIN_USER`, `ADMIN_PASS`, and `SESSION_SECRET`.
3. Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` for the production MySQL instance.
4. Set `CORS_ORIGIN` to the exact HTTPS frontend origin.
5. Back up the database and both `backend/uploads` and `backend/private-uploads` before migration.
6. Run the private document migration once:

```powershell
cd backend
npm run migrate:private-documents
```

7. Start the API with `npm start` behind HTTPS/reverse proxy.

8. Copy `Caddyfile.example` to `Caddyfile`, replace `imk.example.com` with the real domain, and run Caddy with ports 80 and 443 open.

9. Create a database backup from a shell where the DB environment variables are loaded:

```powershell
cd backend
.\backup_mysql.ps1
```

## Frontend

1. Run `npm run build` from `frontend`.
2. Serve `frontend/dist` from the configured HTTPS frontend origin.
3. Proxy `/api` and `/uploads` to the backend, or configure the hosting platform equivalently.

## Final verification

- Login and logout work.
- A non-admin account receives `403` for admin-only endpoints.
- Private loan documents require an authenticated admin request.
- Database restore and upload restore have been tested.
- No production secrets are present in the repository.
