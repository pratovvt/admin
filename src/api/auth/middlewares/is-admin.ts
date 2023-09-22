import {UserRole} from "../../Enums/UserRoleEnum";

const { UnauthorizedError, ForbiddenError } = require('@strapi/utils').errors;
import { Strapi } from '@strapi/strapi';

export default (config, { strapi }: { strapi: Strapi }) => {
  return async (ctx, next) => {
    const sessionId = ctx.cookies.get('session_token');
    if (!sessionId) {
      throw new UnauthorizedError(`Выполните вход в аккаунт`);
    }
    const sessionInfo = await strapi.db.query('api::auth.auth').findOne({
      where: {
        id: sessionId,
      },
      populate: ['client'],
    });
    if (!sessionInfo) {
      throw new UnauthorizedError(`Выполните вход в аккаунт`);
    }
    const userInfo = await strapi.db.query('api::client.client').findOne({
      where: { id: sessionInfo.client.id },
    });
    if (userInfo.role !== UserRole.ADMIN) {
      throw new ForbiddenError('У вас нет прав!');
    }
    ctx.editorId = userInfo.id;
    await next();
  };
};
