import { t } from 'elysia';

export const DefaultResponse = t.Object({
  success: t.Boolean(),
  message: t.String(),
});
