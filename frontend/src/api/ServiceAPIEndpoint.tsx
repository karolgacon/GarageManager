import api from "../api";
import { BASE_API_URL } from "../constants";

export const serviceService = {
	// Get all services (ADMIN)
	getAllServices: async () => {
		try {
			console.log("Admin: Fetching all services");
			const response = await api.get(`${BASE_API_URL}/services/`);
			console.log("Admin: Services API response:", response.data);
			if (Array.isArray(response.data)) {
				return response.data;
			} else {
				console.error(
					"Unexpected data format from service API:",
					response.data
				);
				return [];
			}
		} catch (error) {
			console.error("Error fetching all services:", error);
			return [];
		}
	},

	// Get service details (ADMIN)
	getService: async (id: number) => {
		try {
			const response = await api.get(`${BASE_API_URL}/services/${id}/`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching service with ID ${id}:`, error);
			throw error;
		}
	},

	// Create a new service (ADMIN)
	createService: async (serviceData: any) => {
		try {
			const response = await api.post(`${BASE_API_URL}/services/`, serviceData);
			return response.data;
		} catch (error) {
			console.error("Error creating service:", error);
			throw error;
		}
	},

	// Update a service (ADMIN)
	updateService: async (id: number, serviceData: any) => {
		try {
			const response = await api.put(
				`${BASE_API_URL}/services/${id}/`,
				serviceData
			);
			return response.data;
		} catch (error) {
			console.error(`Error updating service with ID ${id}:`, error);
			throw error;
		}
	},

	// Partially update a service (ADMIN)
	partialUpdateService: async (id: number, serviceData: any) => {
		try {
			const response = await api.patch(
				`${BASE_API_URL}/services/${id}/`,
				serviceData
			);
			return response.data;
		} catch (error) {
			console.error(`Error partially updating service with ID ${id}:`, error);
			throw error;
		}
	},

	// Delete a service (ADMIN)
	deleteService: async (id: number) => {
		try {
			await api.delete(`${BASE_API_URL}/services/${id}/`);
		} catch (error) {
			console.error(`Error deleting service with ID ${id}:`, error);
			throw error;
		}
	},

	// Get vehicle services (for client/mechanic/owner views)
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

	// Get client's services directly
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
};
