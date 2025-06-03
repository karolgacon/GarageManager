import axios from "axios";
import { BASE_API_URL } from "../constants";
import { api } from "../api";

export const serviceService = {
	// Get all services
	getAllServices: async () => {
		try {
			const response = await api.get(`${BASE_API_URL}/services/`);
			return response.data;
		} catch (error) {
			console.error("Error fetching all services:", error);
			return []; // Return empty array instead of throwing
		}
	},

	// Get vehicle services - matching the function name used in ClientDashboard
	getVehicleServices: async (vehicleId: number) => {
		try {
			console.log(`Fetching services for vehicle ID: ${vehicleId}`);

			// Try the endpoint with vehicle_id as a query parameter
			try {
				const response = await api.get(`${BASE_API_URL}/services/`, {
					params: { vehicle_id: vehicleId },
				});
				console.log("Vehicle services fetched successfully:", response.data);
				return response.data;
			} catch (firstError) {
				console.error("First endpoint pattern failed:", firstError);

				// Try another common pattern with by_vehicle endpoint
				try {
					const response = await api.get(
						`${BASE_API_URL}/services/by_vehicle/`,
						{
							params: { vehicle_id: vehicleId },
						}
					);
					console.log(
						"Vehicle services fetched with second pattern:",
						response.data
					);
					return response.data;
				} catch (secondError) {
					console.error("Second endpoint pattern failed:", secondError);

					// Try a third pattern with vehicleId in the URL path
					try {
						const response = await api.get(
							`${BASE_API_URL}/vehicles/${vehicleId}/services/`
						);
						console.log(
							"Vehicle services fetched with third pattern:",
							response.data
						);
						return response.data;
					} catch (thirdError) {
						console.error("All endpoint patterns failed");
						return []; // Return empty array rather than throwing
					}
				}
			}
		} catch (error) {
			console.error(`Error fetching services for vehicle ${vehicleId}:`, error);
			return []; // Return empty array on error
		}
	},

	// Get service details
	getService: async (id: number) => {
		try {
			const response = await api.get(`${BASE_API_URL}/services/${id}/`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching service with ID ${id}:`, error);
			throw error;
		}
	},
};
