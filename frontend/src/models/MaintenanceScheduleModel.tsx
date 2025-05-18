export interface MaintenanceSchedule {
	id: number;
	vehicle_id: number;
	service_type: string;
	due_date: string;
	status: "pending" | "completed" | "overdue";
	notes?: string;
	last_maintenance_date?: string;
	vehicle_details?: {
		make: string;
		model: string;
		year: number;
		registration_number: string;
	};
}
