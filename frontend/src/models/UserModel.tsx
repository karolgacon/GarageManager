
import { Profile } from './ProfileModel';
export interface User {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    username: string;
    role: string;  // Możesz użyć enum dla ról
    is_active?: boolean;
    status: string;
    profile?: Profile; // Dodajemy zagnieżdżony profil
}
