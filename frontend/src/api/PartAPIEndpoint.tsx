import api from "../api";
import { Part } from "../models/PartModel";

// Based on the schema, the correct endpoint is /api/v1/parts/
const BASE_URL = "/parts/";

export const inventoryService = {
	getAllParts: async (): Promise<Part[]> => {
		try {
			const response = await api.get(BASE_URL);
			return response.data;
		} catch (error) {
			console.error("Error fetching parts:", error);
			throw error;
		}
	},

	getPartById: async (id: number): Promise<Part> => {
		try {
			const response = await api.get(`${BASE_URL}${id}/`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching part with ID ${id}:`, error);
			throw error;
		}
	},

	createPart: async (partData: Partial<Part>): Promise<Part> => {
		try {
			const response = await api.post(BASE_URL, partData);
			return response.data;
		} catch (error) {
			console.error("Error creating part:", error);
			throw error;
		}
	},

	updatePart: async (id: number, partData: Partial<Part>): Promise<Part> => {
		try {
			const response = await api.put(`${BASE_URL}${id}/`, partData);
			return response.data;
		} catch (error) {
			console.error(`Error updating part with ID ${id}:`, error);
			throw error;
		}
	},

	deletePart: async (id: number): Promise<void> => {
		try {
			await api.delete(`${BASE_URL}${id}/`);
		} catch (error) {
			console.error(`Error deleting part with ID ${id}:`, error);
			throw error;
		}
	},

	// Get low stock parts
	getLowStockParts: async (): Promise<Part[]> => {
		try {
			const parts = await inventoryService.getAllParts();
			return parts.filter(
				(part) => part.stock_quantity <= part.minimum_stock_level
			);
		} catch (error) {
			console.error("Error fetching low stock parts:", error);
			throw error;
		}
	},
};
