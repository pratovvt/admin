/**
 * A set of functions called "actions" for `auth`
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController(
    'api::auth.auth',
    ({ strapi }) => ({
        async signIn(ctx) {
            const { email, password } = ctx.request.body;
            const response = await strapi
                .service('api::auth.auth')
                .signIn(email, password);
            const cookieConf = {
                maxAge: 24 * 60 * 60 * 1000,
                ...(strapi.config.get('app.isCORSForCookiesAllowed', false)
                    ? {
                        httpOnly: true,
                        renew: false,
                        secure: false,
                        domain: 'localhost',
                    }
                    : {}),
            };
            ctx.cookies.set('session_token', response.cookie.id, cookieConf);
            ctx.status = 200;
            return { success: true, role: response.role };
        },
        async sendCode(ctx) {
            const { email } = ctx.request.body;
            await strapi.service('api::auth.auth').sendCode(email);
            ctx.status = 200;
            return {
                success: true,
            };
        },
        status(ctx) {
            return strapi.service('api::auth.auth').statusInfo(ctx.cookie_session);
        },
        async logout(ctx) {
            const serviceResponse = await strapi
                .service('api::auth.auth')
                .logout(ctx.cookie_session);
            ctx.cookies.set('session_token', null);
            ctx.cookies.set('session_token.sig', null);
            return serviceResponse;
        },
    })
);
