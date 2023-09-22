import { factories } from '@strapi/strapi';
const { UnauthorizedError, ValidationError } = require('@strapi/utils').errors;
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {UserStatus} from "../../Enums/UserStatusEnum";

export default factories.createCoreService('api::auth.auth', ({ strapi }) => ({
    async signIn(email, code) {
        if (!email || !code) {
            throw new ValidationError('Заполните все поля');
        }
        const user = await strapi.db
            .query('api::client.client')
            .findOne({ where: { email: { $eqi: email } } });
        if (user?.status === UserStatus.BLOCKED) {
            throw new UnauthorizedError('Вы заблокированы');
        }
        if (!user || !user.hash) {
            throw new UnauthorizedError(`Код неверный`);
        }
        const isValid = await bcrypt.compare(code, user.password);
        if (!isValid) {
            throw new UnauthorizedError(`Код неверный`);
        }
        // get the created_hash time, convert it to minutes and check if it's more than 60 minutes
        const activeHash =
            Math.floor(
                (new Date().getTime() - new Date(user.hash_createdAt).getTime()) / 60000
            ) <= 60;
        if (!activeHash) {
            throw new UnauthorizedError(`Код устарел`);
        }
        await strapi.db.query('api::client.client').update({
            where: { id: user.id },
            data: {
                hash: null,
                hash_createdAt: null,
            },
        });
        const authSession = await strapi.db.query('api::auth.auth').findOne({
            where: {
                client: user.id,
            },
        });

        if (authSession) {
            await strapi.db.query('api::auth.auth').delete({
                where: { id: authSession.id },
            });
        }

        const newSession = await strapi.db.query('api::auth.auth').create({
            data: {
                client: user.id,
                expiresAt: new Date().setFullYear(new Date().getFullYear() + 1), //1 year access
            },
            populate: ['client'],
        });

        return {
            cookie: newSession,
            role: user.role,
        };
    },
    async statusInfo(id: number) {
        const sessionInfo = await strapi.db.query('api::auth.auth').findOne({
            where: {
                id,
            },
            populate: ['client'],
        });
        if (!sessionInfo) {
            throw new UnauthorizedError('Пользователь не авторизован');
        }
        return {
            userId: sessionInfo.client.id,
        };
    },
    async logout(id: number) {
        const sessionInfo = await strapi.db.query('api::auth.auth').findOne({
            where: {
                id,
            },
        });
        if (!sessionInfo) {
            return { success: true };
        }
        await strapi.db.query('api::auth.auth').delete({
            where: {
                id,
            },
        });
        return { success: true };
    },
}));
