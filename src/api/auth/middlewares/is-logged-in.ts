/**
 * `isLoggedIn` middleware
 */
const { UnauthorizedError } = require('@strapi/utils').errors;
import { Strapi } from '@strapi/strapi';

export default (config, { strapi }: { strapi: Strapi }) => {
  return async (ctx, next) => {
    const cookie = ctx.cookies.get('session_token');
    if (!cookie) {
      throw new UnauthorizedError(`Выполните вход в аккаунт`);
    }
    ctx.cookie_session = cookie;
    await next();
  };
};
