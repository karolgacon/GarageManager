export interface Profile {
    id?: number;
    user: number; // Może nie być zwracane w API
    address?: string;
    phone?: string;
    photo?: string;
    preferred_contact_method?: string;
}
