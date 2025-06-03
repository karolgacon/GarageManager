import api from "../api";
import { BASE_API_URL } from "../constants";

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

			// Use the dedicated vehicle diagnostics endpoint
			const response = await api.get(
				`${BASE_API_URL}/diagnostics/vehicle/${vehicleId}/`
			);

			console.log(
				`Received ${response.data.length} diagnostics for vehicle ${vehicleId}:`,
				response.data
			);

			return response.data;
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

	// Get critical diagnostics
	getCriticalDiagnostics: async () => {
		try {
			console.log("Fetching critical diagnostics");
			const response = await api.get(`${BASE_API_URL}/diagnostics/critical/`);
			console.log(
				`Received ${response.data.length} critical diagnostics:`,
				response.data
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching critical diagnostics:", error);
			return []; // Return empty array on error
		}
	},
};
