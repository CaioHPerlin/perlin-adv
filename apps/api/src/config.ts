import { getSchemaValidator, t, TSchema } from 'elysia';

function getSchemaDefaults<T extends TSchema>(schema: T): T['static'] {
  return Object.fromEntries(
    Object.entries(schema.properties).map(([key, sch]: [string, any]) => [key, sch.default]),
  );
}

const EnvSchema = t.Object(
  {
    PORT: t.Numeric({ default: 7777 }),
  },
  { additionalProperties: true },
);

const validator = getSchemaValidator(EnvSchema);
const envDefaults = getSchemaDefaults(EnvSchema);

function validateEnv(env: Record<string, any>): typeof EnvSchema.static {
  const result = validator.safeParse(env);

  if (!result.success) {
    console.error('❌ Invalid environment variables');
    console.error('--------------------------------');

    const errorsDict = result.errors.reduce(
      (acc, error) => {
        if (!error) return acc;
        const path = error.path.substring(1);
        (acc[path] ??= []).push(error.message);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    for (const [key, messages] of Object.entries(errorsDict)) {
      console.error(`🔴 ${key}: ${messages.join(', ')}`);
    }

    process.exit(1);
  }

  return result.data;
}

export const config = validateEnv({ ...envDefaults, ...Bun.env });
