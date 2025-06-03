import api from "../api";
import { Part } from "../models/PartModel";

const BASE_URL = "/parts/";

export const inventoryService = {
	getAllParts: async (): Promise<Part[]> => {
		try {
			const response = await api.get(BASE_URL);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getPartById: async (id: number): Promise<Part> => {
		try {
			const response = await api.get(`${BASE_URL}${id}/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	createPart: async (partData: Partial<Part>): Promise<Part> => {
		try {
			const response = await api.post(BASE_URL, partData);
			return response.data;
		} catch (error) {
			if (error.response) {
			}
			throw error;
		}
	},

	updatePart: async (id: number, partData: Partial<Part>): Promise<Part> => {
		try {
			const response = await api.put(`${BASE_URL}${id}/`, partData);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	deletePart: async (id: number): Promise<void> => {
		try {
			await api.delete(`${BASE_URL}${id}/`);
		} catch (error) {
			throw error;
		}
	},

	getLowStockParts: async (): Promise<Part[]> => {
		try {
			const parts = await inventoryService.getAllParts();
			return parts.filter(
				(part) => part.stock_quantity <= part.minimum_stock_level
			);
		} catch (error) {
			throw error;
		}
	},

	getPartsByWorkshop: async (workshopId: number): Promise<Part[]> => {
		try {
			const response = await api.get(`${BASE_URL}`, {
				params: { workshop_id: workshopId },
			});
			return response.data;
		} catch (error) {
			throw error;
		}
	},
};
