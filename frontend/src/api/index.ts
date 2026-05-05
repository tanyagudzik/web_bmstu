import { Api } from './Api';

export const api = new Api({
    baseURL: '/api',
    withCredentials: true,
});