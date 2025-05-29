export interface Workshop {
	id: number;
	name: string;
	location: string;
	owner_id?: number;
	phone?: string;
	email?: string;
	address?: string;
	city?: string;
	zip_code?: string;
	country?: string;
	is_active?: boolean;
	created_at?: string;
	updated_at?: string;
}
