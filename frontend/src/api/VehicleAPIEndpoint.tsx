import api from "../api";
import { Vehicle } from "../models/VehicleModel";

const BASE_API_URL = "/vehicles/";

export const vehicleService = {
	getAllVehicles: async (): Promise<Vehicle[]> => {
		try {
			const response = await api.get(BASE_API_URL);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getVehicleById: async (id: number): Promise<any> => {
		try {
			const response = await api.get(`/vehicles/${id}/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	createVehicle: async (vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
		try {
			const response = await api.post(BASE_API_URL, vehicleData);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	updateVehicle: async (
		id: number,
		vehicleData: Partial<Vehicle>
	): Promise<Vehicle> => {
		try {
			const response = await api.patch(`${BASE_API_URL}${id}/`, vehicleData);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	deleteVehicle: async (id: number): Promise<void> => {
		try {
			await api.delete(`${BASE_API_URL}${id}/`);
		} catch (error) {
			throw error;
		}
	},

	getVehiclesByBrand: async (brand: string): Promise<Vehicle[]> => {
		try {
			const response = await api.get(`${BASE_API_URL}by_brand/?brand=${brand}`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getVehiclesDueForMaintenance: async (): Promise<Vehicle[]> => {
		try {
			const response = await api.get(`${BASE_API_URL}due_for_maintenance/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getCurrentUserVehicles: async (): Promise<Vehicle[]> => {
		try {
			const response = await api.get(`${BASE_API_URL}my-vehicles/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getClientVehicles: async (clientId: number): Promise<Vehicle[]> => {
		try {
			const response = await api.get(
				`${BASE_API_URL}by_owner/?owner=${clientId}`
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getWorkshopVehicles: async (workshopId: number): Promise<Vehicle[]> => {
		try {
			const response = await api.get(
				`${BASE_API_URL}workshop_vehicles/?workshop_id=${workshopId}`
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getVehiclesByOwner: async (ownerId: number): Promise<Vehicle[]> => {
		try {
			const response = await api.get(`${BASE_API_URL}?owner=${ownerId}`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},
};
