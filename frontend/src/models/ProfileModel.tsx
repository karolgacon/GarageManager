export interface Profile {
	id?: number;
	user: number;
	address?: string;
	phone?: string;
	photo?: string;
	preferred_contact_method?: string;
}

export interface UserProfile {
	// User data
	user_id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	// Profile data
	id?: number;
	address?: string;
	phone?: string;
	photo?: string;
	preferred_contact_method?: string;
}
