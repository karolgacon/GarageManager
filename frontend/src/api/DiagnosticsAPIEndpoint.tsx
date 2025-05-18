import api from "../api";
import { DiagnosisIssue } from "../models/DiagnosisModel";
import { BASE_API_URL } from "../constants";

const BASE_URL = `${BASE_API_URL}/diagnostics`;

export const diagnosticsService = {
	getAllDiagnostics: async (): Promise<DiagnosisIssue[]> => {
		try {
			console.log("Fetching all diagnostics from:", BASE_URL);
			const response = await api.get(BASE_URL);
			return response.data;
		} catch (error) {
			console.error("Error fetching diagnostics:", error);
			throw error;
		}
	},

	getCriticalDiagnostics: async (): Promise<DiagnosisIssue[]> => {
		try {
			const response = await api.get(`${BASE_URL}/critical/`);
			return response.data;
		} catch (error) {
			console.error("Error fetching critical diagnostics:", error);
			throw error;
		}
	},

	getDiagnosticsByCategory: async (
		category: string
	): Promise<DiagnosisIssue[]> => {
		try {
			const response = await api.get(`${BASE_URL}/?category=${category}`);
			return response.data;
		} catch (error) {
			console.error(
				`Error fetching diagnostics for category ${category}:`,
				error
			);
			throw error;
		}
	},

	getDiagnosticById: async (id: number): Promise<DiagnosisIssue> => {
		try {
			const response = await api.get(`${BASE_URL}/${id}/`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching diagnostic with id ${id}:`, error);
			throw error;
		}
	},
};
