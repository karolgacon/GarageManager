import { JwtPayload } from 'jwt-decode'

export interface CustomJwtPayload extends JwtPayload {
    user_id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_superuser: boolean;
    is_staff: boolean;
    is_active: boolean;
    status: string;
    exp: number;
    iat: number;
}