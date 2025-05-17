import api from "../api";
import { Part } from "../models/PartModel";

const BASE_URL = "/parts/";

export const inventoryService = {
	getAllParts: async (): Promise<Part[]> => {
		try {
			const response = await api.get(BASE_URL);
			console.log("API response data:", response.data); // Dodaj logowanie

			// Ensure all numeric fields are properly typed
			return response.data.map((part: any) => ({
				...part,
				id: part.id,
				name: part.name,
				manufacturer: part.manufacturer,
				price:
					typeof part.price === "number"
						? part.price
						: parseFloat(part.price || 0),
				stock_quantity:
					typeof part.stock_quantity === "number"
						? part.stock_quantity
						: parseInt(part.stock_quantity || 0, 10),
				minimum_stock_level:
					typeof part.minimum_stock_level === "number"
						? part.minimum_stock_level
						: parseInt(part.minimum_stock_level || 0, 10),
				category: part.category,
				supplier: part.supplier,
			}));
		} catch (error) {
			console.error("Error fetching parts:", error);
			throw error;
		}
	},

	getPartById: async (id: number): Promise<Part> => {
		try {
			const response = await api.get(`${BASE_URL}${id}`);
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
			console.log("Updating part with data:", part);
			const response = await api.put(`${BASE_URL}${id}/`, part);
			return response.data;
		} catch (error) {
			console.error(`Error updating part with id ${id}:`, error);
			if (error.response) {
				console.error("Server response data:", error.response.data);
			}
			throw error;
		}
	},

	deletePart: async (id: number): Promise<void> => {
		try {
			await api.delete(`${BASE_URL}${id}/`);
		} catch (error) {
			console.error(`Error deleting part with id ${id}:`, error);
			throw error;
		}
	},
};
