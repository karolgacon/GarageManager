export interface Customer {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    status: "active" | "blocked" | "suspended";
    is_active: boolean;
    date_joined: string;
    last_login?: string;
    loyalty_points?: number;
    profile?: {
        id: number;
        address: string;
        phone: string;
        photo: string;
        preferred_contact_method: string;
    };
    workshop_id?: number;
    workshop_name?: string;
}