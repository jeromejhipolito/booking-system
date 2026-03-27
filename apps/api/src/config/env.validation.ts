const REQUIRED_VARS = [
  'DATABASE_HOST',
  'DATABASE_NAME',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'JWT_SECRET',
];

export function validateEnv() {
  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 10) {
    console.error('\nJWT_SECRET must be at least 10 characters\n');
    process.exit(1);
  }

  if (missing.length > 0) {
    console.error(`\nMissing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n`);
    process.exit(1);
  }
}
