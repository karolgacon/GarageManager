export interface StaffMember {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	phone?: string;
	role: string;
	workshop_id: number;
	created_at: string;
	updated_at?: string;
	is_active: boolean;
	days_worked?: number;
	total_work_days?: number;
	current_status?: "working" | "vacation" | "sick_leave" | "offline";
	vacation_days_left?: number;
	last_active?: string;
	performance_score?: number;
}

export interface CreateStaffRequest {
	first_name: string;
	last_name: string;
	email: string;
	phone?: string;
	role: string;
	workshop_id: number;
	password: string;
}

export interface UpdateStaffRequest {
	first_name?: string;
	last_name?: string;
	email?: string;
	phone?: string;
	role?: string;
	is_active?: boolean;
	current_status?: "working" | "vacation" | "sick_leave" | "offline";
	vacation_days_left?: number;
	performance_score?: number;
}
