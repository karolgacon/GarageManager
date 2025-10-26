import { jwtDecode } from 'jwt-decode';
import { getAuthToken } from './authServices';
import { CustomJwtPayload } from './CustomJwtPayload';
import {ROLE_ADMIN, ROLE_OWNER, ROLE_MECHANIC, ROLE_CLIENT, ROLE_ROOT} from "../constants.ts";


export function isLoggedIn(): boolean {
    const token = getAuthToken();
    return token !== null;
}

export function isAdmin(): boolean {
    const token = getAuthToken();
    if (token !== null) {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        return decoded.role === ROLE_ADMIN;
    }
    return false;
}

export function isOwner(): boolean {
    const token = getAuthToken();
    if (token !== null) {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        return decoded.role === ROLE_OWNER;
    }
    return false;
}

export function isMechanic(): boolean {
    const token = getAuthToken();
    if (token !== null) {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        return decoded.role === ROLE_MECHANIC;
    }
    return false;
}

export function isClient(): boolean {
    const token = getAuthToken();
    if (token !== null) {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        return decoded.role === ROLE_CLIENT;
    }
    return false;
}

export function isRoot(): boolean {
    const token = getAuthToken();
    if (token !== null) {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        return decoded.role === ROLE_ROOT;
    }
    return false;
}