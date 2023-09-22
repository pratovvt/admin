export default {
    routes: [
        {
            method: 'POST',
            path: '/auth/login',
            handler: 'auth.signIn',
        },
        {
            method: 'POST',
            path: '/auth/logout',
            handler: 'auth.logout',
            config: {
                middlewares: ['api::auth.is-logged-in'],
            },
        },
        {
            method: 'GET',
            path: '/auth/status',
            handler: 'auth.status',
            config: {
                middlewares: ['api::auth.is-logged-in'],
            },
        },
    ],
};
