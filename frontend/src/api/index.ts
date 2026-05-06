import { Api } from './Api';

export const api = new Api({
    baseUrl: '/api',
    baseApiParams: {
        credentials: 'include',
    },
});