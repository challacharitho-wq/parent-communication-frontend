console.log({
  DATABASE_URL: process.env.DATABASE_URL ? 'PRESENT' : 'MISSING',
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? 'PRESENT' : 'MISSING',
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
  VITE_API_URL: process.env.VITE_API_URL,
  NODE_ENV: process.env.NODE_ENV,
});
