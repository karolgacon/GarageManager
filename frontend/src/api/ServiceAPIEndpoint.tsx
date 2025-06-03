import api from "../api"; // Make sure this is a default import, not named
import { BASE_API_URL } from "../constants";

export const serviceService = {
	// Get all services
	getAllServices: async () => {
		try {
			const response = await api.get(`${BASE_API_URL}/vehicle-services/`);
			return response.data;
		} catch (error) {
			console.error("Error fetching all services:", error);
			return [];
		}
	},

	// Get vehicle services
	getVehicleServices: async (vehicleId: number) => {
		try {
			console.log(`Fetching services for vehicle ID: ${vehicleId}`);
			const response = await api.get(
				`${BASE_API_URL}/vehicle-services/by_vehicle/`,
				{
					params: { vehicle_id: vehicleId },
				}
			);
			console.log("Vehicle services fetched successfully:", response.data);
			return response.data;
		} catch (error) {
			console.error(`Error fetching services for vehicle ${vehicleId}:`, error);
			return [];
		}
	},

	// Get client's services directly - UPDATED to use the correct endpoint
	getClientServices: async (clientId: number) => {
		try {
			console.log(`Fetching services for client ID: ${clientId}`);
			const response = await api.get(
				`${BASE_API_URL}/vehicle-services/by_client/`,
				{
					params: { client_id: clientId },
				}
			);
			return response.data;
		} catch (error) {
			console.error(`Error fetching services for client ${clientId}:`, error);
			return [];
		}
	},

	// Get service details
	getService: async (id: number) => {
		try {
			const response = await api.get(`${BASE_API_URL}/vehicle-services/${id}/`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching service with ID ${id}:`, error);
			throw error;
		}
	},
};
