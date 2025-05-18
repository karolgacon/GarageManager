import api from "./api";
import { DiagnosisIssue } from "../models/DiagnosisModel";

const BASE_URL = "/vehicles/diagnostics";

export const diagnosisService = {
	getAllIssues: async (): Promise<DiagnosisIssue[]> => {
		try {
			console.log("Fetching all diagnostic issues from:", BASE_URL);
			const response = await api.get(BASE_URL);
			return response.data;
		} catch (error) {
			console.error("Error fetching diagnostic issues:", error);
			throw error;
		}
	},

	getIssueById: async (id: number): Promise<DiagnosisIssue> => {
		try {
			const response = await api.get(`${BASE_URL}/${id}/`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching issue with id ${id}:`, error);
			throw error;
		}
	},

	getIssuesByCategory: async (category: string): Promise<DiagnosisIssue[]> => {
		try {
			const response = await api.get(
				`${BASE_URL}/by-category/?category=${category}`
			);
			return response.data;
		} catch (error) {
			console.error(`Error fetching issues for category ${category}:`, error);
			throw error;
		}
	},
};
