import api from "../api";
import { DiagnosticIssue } from "../models/DiagnosticIssue";

const BASE_API_URL = "/diagnostics/";

const getAllDiagnostics = async (): Promise<DiagnosticIssue[]> => {
	try {
		const response = await api.get(BASE_API_URL);
		return response.data;
	} catch (error) {
		console.error("Error fetching all diagnostics:", error);
		throw error;
	}
};

const getVehicleDiagnostics = async (
	vehicleId: number
): Promise<DiagnosticIssue[]> => {
	try {
		const response = await api.get(`${BASE_API_URL}vehicle/${vehicleId}/`);
		return response.data;
	} catch (error) {
		console.error(
			`Error fetching diagnostics for vehicle ${vehicleId}:`,
			error
		);
		throw error;
	}
};

const getCriticalDiagnostics = async (): Promise<DiagnosticIssue[]> => {
	try {
		const response = await api.get(`${BASE_API_URL}critical/`);
		return response.data;
	} catch (error) {
		console.error("Error fetching critical diagnostics:", error);
		throw error;
	}
};

const getDiagnosticsByCategory = async (
	category: string
): Promise<DiagnosticIssue[]> => {
	try {
		const response = await api.get(`${BASE_API_URL}category/${category}/`);
		return response.data;
	} catch (error) {
		console.error(
			`Error fetching diagnostics for category ${category}:`,
			error
		);
		throw error;
	}
};

const getDiagnosticById = async (id: number): Promise<DiagnosticIssue> => {
	try {
		const response = await api.get(`${BASE_API_URL}${id}/`);
		return response.data;
	} catch (error) {
		console.error(`Error fetching diagnostic with ID ${id}:`, error);
		throw error;
	}
};

export const diagnosticsService = {
	getAllDiagnostics,
	getVehicleDiagnostics,
	getCriticalDiagnostics,
	getDiagnosticsByCategory,
	getDiagnosticById,
};
