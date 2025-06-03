import axios from "axios";
import { BASE_API_URL } from "../constants";
import { api } from "../api";

export const diagnosticsService = {
	// Get all diagnostics
	getAllDiagnostics: async () => {
		try {
			const response = await api.get(`${BASE_API_URL}/diagnostics/`);
			return response.data;
		} catch (error) {
			console.error("Error fetching all diagnostics:", error);
			return []; // Return empty array instead of throwing
		}
	},

	// Get vehicle diagnostics
	getVehicleDiagnostics: async (vehicleId: number) => {
		try {
			console.log(`Fetching diagnostics for vehicle ID: ${vehicleId}`);

			// Try multiple endpoint patterns
			try {
				const response = await api.get(`${BASE_API_URL}/diagnostics/`, {
					params: { vehicle_id: vehicleId },
				});
				console.log("Vehicle diagnostics fetched successfully:", response.data);
				return response.data;
			} catch (firstError) {
				console.error("First diagnostics endpoint pattern failed:", firstError);

				// Try another endpoint pattern
				try {
					const response = await api.get(
						`${BASE_API_URL}/diagnostics/by_vehicle/`,
						{
							params: { vehicle_id: vehicleId },
						}
					);
					return response.data;
				} catch (secondError) {
					console.error(
						"Second diagnostics endpoint pattern failed:",
						secondError
					);

					// Try a third pattern
					try {
						const response = await api.get(
							`${BASE_API_URL}/vehicles/${vehicleId}/diagnostics/`
						);
						return response.data;
					} catch (thirdError) {
						console.error("All diagnostics endpoint patterns failed");
						return []; // Return empty array rather than throwing
					}
				}
			}
		} catch (error) {
			console.error(
				`Error fetching diagnostics for vehicle ${vehicleId}:`,
				error
			);
			return []; // Return empty array on error
		}
	},

	// Get diagnostic details
	getDiagnostic: async (id: number) => {
		try {
			const response = await api.get(`${BASE_API_URL}/diagnostics/${id}/`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching diagnostic with ID ${id}:`, error);
			throw error;
		}
	},
};
