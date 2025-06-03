import api from "../api";
import { BASE_API_URL } from "../constants";

export const diagnosticsService = {
	getAllDiagnostics: async () => {
		try {
			const response = await api.get(`${BASE_API_URL}/diagnostics/`);
			return response.data;
		} catch (error) {
			return [];
		}
	},

	getVehicleDiagnostics: async (vehicleId: number) => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/diagnostics/vehicle/${vehicleId}/`
			);
			return response.data;
		} catch (error) {
			return [];
		}
	},

	getDiagnostic: async (id: number) => {
		try {
			const response = await api.get(`${BASE_API_URL}/diagnostics/${id}/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getCriticalDiagnostics: async () => {
		try {
			const response = await api.get(`${BASE_API_URL}/diagnostics/critical/`);
			return response.data;
		} catch (error) {
			return [];
		}
	},
};
