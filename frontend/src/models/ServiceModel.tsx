export interface Service {
	id?: number;
	name: string;
	description: string;
	price: number;
	duration: number; // czas w minutach
	category: string;
	is_active: boolean;
}

export const defaultService: Service = {
	name: "",
	description: "",
	price: 0,
	duration: 60,
	category: "general",
	is_active: true,
};

export const SERVICE_CATEGORY_OPTIONS = [
	{ value: "general", label: "General Maintenance" },
	{ value: "diagnostic", label: "Diagnostics" },
	{ value: "repair", label: "Repair" },
	{ value: "electrical", label: "Electrical" },
	{ value: "engine", label: "Engine" },
	{ value: "transmission", label: "Transmission" },
	{ value: "suspension", label: "Suspension" },
	{ value: "brakes", label: "Brakes" },
	{ value: "body", label: "Body Work" },
	{ value: "other", label: "Other" },
];
