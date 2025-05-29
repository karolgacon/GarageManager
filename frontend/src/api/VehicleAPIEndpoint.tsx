import api from "../api";
import { Vehicle } from "../models/VehicleModel";

const BASE_API_URL = "/vehicles/";

export const vehicleService = {
	// Basic CRUD operations
	getAllVehicles: async (): Promise<Vehicle[]> => {
		try {
			const response = await api.get(BASE_API_URL);
			return response.data;
		} catch (error) {
			console.error("Error fetching all vehicles:", error);
			throw error;
		}
	},

	getVehicleById: async (id: number): Promise<Vehicle> => {
		try {
			const response = await api.get(`${BASE_API_URL}${id}/`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching vehicle with ID ${id}:`, error);
			throw error;
		}
	},

	createVehicle: async (vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
		try {
			const response = await api.post(BASE_API_URL, vehicleData);
			return response.data;
		} catch (error) {
			console.error("Error creating vehicle:", error);
			throw error;
		}
	},

	updateVehicle: async (
		id: number,
		vehicleData: Partial<Vehicle>
	): Promise<Vehicle> => {
		try {
			// Zmiana z put na patch
			const response = await api.patch(`${BASE_API_URL}${id}/`, vehicleData);
			return response.data;
		} catch (error) {
			console.error(`Error updating vehicle with ID ${id}:`, error);
			throw error;
		}
	},

	deleteVehicle: async (id: number): Promise<void> => {
		try {
			await api.delete(`${BASE_API_URL}${id}/`);
		} catch (error) {
			console.error(`Error deleting vehicle with ID ${id}:`, error);
			throw error;
		}
	},

	// Specialized endpoints from the schema
	getVehiclesByBrand: async (brand: string): Promise<Vehicle[]> => {
		try {
			const response = await api.get(`${BASE_API_URL}by_brand/?brand=${brand}`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching vehicles with brand ${brand}:`, error);
			throw error;
		}
	},

	getVehiclesDueForMaintenance: async (): Promise<Vehicle[]> => {
		try {
			const response = await api.get(`${BASE_API_URL}due_for_maintenance/`);
			return response.data;
		} catch (error) {
			console.error("Error fetching vehicles due for maintenance:", error);
			throw error;
		}
	},

	// User-specific endpoints (these may require custom backend implementation)
	getCurrentUserVehicles: async (): Promise<Vehicle[]> => {
		try {
			const token = localStorage.getItem("token");
			const response = await api.get(`${BASE_API_URL}my-vehicles/`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return response.data;
		} catch (error) {
			console.error("Error fetching current user vehicles:", error);
			throw error;
		}
	},

	getWorkshopVehicles: async (workshopId: number): Promise<Vehicle[]> => {
		try {
			// This might need to be implemented on the backend, or you can filter locally
			// Assuming the backend has an endpoint or filtering mechanism
			const response = await api.get(`${BASE_API_URL}?workshop=${workshopId}`);
			return response.data;
		} catch (error) {
			console.error(
				`Error fetching vehicles for workshop ${workshopId}:`,
				error
			);
			throw error;
		}
	},
};
