export interface VehicleDetails {
	id: number;
	make: string;
	model: string;
	year: number;
	registration_number: string;
	color: string;
}

export interface VehicleService {
	id: number;
	vehicle: number;
	service: number;
	workshop: number;
	service_date: string;
	completion_date?: string;
	status: string;
	cost: number;
	description: string;
	mechanic_notes?: string;
	vehicle_details?: VehicleDetails;
	service_name?: string;
	workshop_name?: string;
	name?: string; // For frontend compatibility
}

export const VehicleServiceStatus = {
	PENDING: "pending",
	IN_PROGRESS: "in_progress",
	COMPLETED: "completed",
	CANCELLED: "cancelled",
} as const;

export type VehicleServiceStatusType =
	(typeof VehicleServiceStatus)[keyof typeof VehicleServiceStatus];
