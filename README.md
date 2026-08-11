# Lumière Skin Clinic

Static HTML/CSS/JavaScript frontend with a Vercel Function and Neon PostgreSQL appointment backend.

## Deploy on Vercel

1. Push this directory to GitHub.
2. In Vercel, select **Add New → Project** and import the repository.
3. Use framework preset **Other**. No build or output-directory setting is required.
4. Open the Vercel Marketplace and install the **Neon** integration for this project.
5. In the Neon SQL editor, run the contents of `schema.sql` once.
6. Confirm the project has a `DATABASE_URL` environment variable under **Settings → Environment Variables**.
7. Redeploy the project and submit a test appointment.

## Local Vercel development

Install Node.js 20 or newer, then run:

```powershell
npm install
npm install --global vercel
vercel link
vercel env pull .env.local
npm run dev
```

Visit the local URL printed by `vercel dev`. The legacy `npm start` command still runs the original file-backed local server, but production submissions use `api/appointments.js` and PostgreSQL.

## Production checklist

- Replace the demonstration clinic identity and contact details.
- Add staff authentication before building an appointment dashboard.
- Add rate limiting, database backups, and email/SMS notifications.
- Publish privacy and consent policies appropriate to your jurisdiction.
- Never commit `.env` files or real appointment exports.
