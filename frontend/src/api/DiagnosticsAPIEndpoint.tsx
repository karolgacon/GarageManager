import api from "../api";
import { BASE_API_URL } from "../constants";
import { DiagnosticIssue } from "../models/DiagnosticIssue";

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

	createDiagnostic: async (diagnosticData: Partial<DiagnosticIssue>) => {
		try {
			const response = await api.post(`${BASE_API_URL}/diagnostics/`, diagnosticData);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	updateDiagnostic: async (id: number, diagnosticData: Partial<DiagnosticIssue>) => {
		try {
			const response = await api.put(`${BASE_API_URL}/diagnostics/${id}/`, diagnosticData);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	deleteDiagnostic: async (id: number) => {
		try {
			const response = await api.delete(`${BASE_API_URL}/diagnostics/${id}/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},
};
