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

	getVehicleById: async (id: number): Promise<any> => {
		try {
			console.log(`Fetching vehicle with ID ${id} from API`);
			// Upewnij się, że BASE_API_URL jest poprawne
			const response = await api.get(`/api/v1/vehicles/${id}/`);
			console.log(`Vehicle API response for ID ${id}:`, response.data);
			return response.data;
		} catch (error) {
			console.error(`Error fetching vehicle ${id}:`, error);
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

	// User-specific endpoints
	getCurrentUserVehicles: async (): Promise<Vehicle[]> => {
		try {
			const response = await api.get(`${BASE_API_URL}my-vehicles/`);
			return response.data;
		} catch (error) {
			console.error("Error fetching current user vehicles:", error);
			throw error;
		}
	},

	// Get client vehicles based on client ID - matches the by_owner action on the backend
	getClientVehicles: async (clientId: number): Promise<Vehicle[]> => {
		try {
			const response = await api.get(
				`${BASE_API_URL}by_owner/?owner=${clientId}`
			);
			return response.data;
		} catch (error) {
			console.error(`Error fetching vehicles for client ${clientId}:`, error);
			throw error;
		}
	},

	// Get workshop vehicles - match your backend workshop_vehicles action
	getWorkshopVehicles: async (workshopId: number): Promise<Vehicle[]> => {
		try {
			const response = await api.get(
				`${BASE_API_URL}workshop_vehicles/?workshop_id=${workshopId}`
			);
			return response.data;
		} catch (error) {
			console.error(
				`Error fetching vehicles for workshop ${workshopId}:`,
				error
			);
			throw error;
		}
	},

	// Get vehicles filtered by owner directly from main list endpoint
	getVehiclesByOwner: async (ownerId: number): Promise<Vehicle[]> => {
		try {
			const response = await api.get(`${BASE_API_URL}?owner=${ownerId}`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching vehicles for owner ${ownerId}:`, error);
			throw error;
		}
	},
};
