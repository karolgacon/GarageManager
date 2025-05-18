export interface Vehicle {
	id: number;
	brand: string; // Changed from make to brand
	model: string;
	year: number;
	registration_number: string;
	vin: string;
	color?: string;
	engine_type?: string;
	mileage?: number;
	fuel_type?: string;
	transmission?: string;
	owner_id: number;
	workshop_id?: number;
	status: "active" | "inactive" | "maintenance";
	last_service_date?: string;
	next_service_due?: string;
	image_url?: string;
	owner_name?: string;
	workshop_name?: string;
}

export const VEHICLE_FUEL_TYPES = [
	{ value: "petrol", label: "Petrol" },
	{ value: "diesel", label: "Diesel" },
	{ value: "electric", label: "Electric" },
	{ value: "hybrid", label: "Hybrid" },
	{ value: "lpg", label: "LPG" },
	{ value: "cng", label: "CNG" },
];

export const VEHICLE_TRANSMISSION_TYPES = [
	{ value: "manual", label: "Manual" },
	{ value: "automatic", label: "Automatic" },
	{ value: "semi-automatic", label: "Semi-Automatic" },
];

export const VEHICLE_STATUS_TYPES = [
	{ value: "active", label: "Active" },
	{ value: "inactive", label: "Inactive" },
	{ value: "maintenance", label: "In Maintenance" },
];

export const defaultVehicle: Vehicle = {
	id: 0,
	brand: "", // Changed from make to brand
	model: "",
	year: new Date().getFullYear(),
	registration_number: "",
	vin: "",
	owner_id: 0,
	status: "active",
};
