import api from "../api";
import { Part } from "../models/PartModel";

const BASE_URL = "/parts";

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
			const response = await api.get(`${BASE_URL}/${id}`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching part with id ${id}:`, error);
			throw error;
		}
	},

	createPart: async (part: Omit<Part, "id">): Promise<Part> => {
		try {
			const response = await api.post(BASE_URL, part);
			return response.data;
		} catch (error) {
			console.error("Error creating part:", error);
			throw error;
		}
	},

	updatePart: async (id: number, part: Partial<Part>): Promise<Part> => {
		try {
			const response = await api.put(`${BASE_URL}/${id}`, part);
			return response.data;
		} catch (error) {
			console.error(`Error updating part with id ${id}:`, error);
			throw error;
		}
	},

	deletePart: async (id: number): Promise<void> => {
		try {
			await api.delete(`${BASE_URL}/${id}`);
		} catch (error) {
			console.error(`Error deleting part with id ${id}:`, error);
			throw error;
		}
	},
};
