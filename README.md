# GAT PPODAI Placement Portal

## Local development

**Prerequisites:** Node.js and access to the project's Neon PostgreSQL database.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to the Neon pooled connection string. Keep `.env` local; do not commit it.
3. Configure the other required environment variables in `.env` using the placeholders in `.env.example`.
4. Start the application with `npm run dev`.

The application and database seed script use `DATABASE_URL`. The application uses a PostgreSQL connection pool with SSL enabled. No local PostgreSQL server or pgAdmin setup is required.

## Render deployment

Set the application's environment variables in the Render service settings. Set `DATABASE_URL` to the Neon pooled connection string; do not place database credentials in source files or commit them.
