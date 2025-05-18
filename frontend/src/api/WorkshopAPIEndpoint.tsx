import api from "../api";
import { BASE_API_URL } from "../constants";

interface Workshop {
	id: number;
	name: string;
	location: string;
	owner_id?: number;
	phone?: string;
	email?: string;
	address?: string;
	city?: string;
	zip_code?: string;
	country?: string;
	is_active?: boolean;
	created_at?: string;
	updated_at?: string;
}

const BASE_URL = `${BASE_API_URL}/workshops`;

export const workshopService = {
	// Pobierz wszystkie warsztaty
	getAllWorkshops: async (): Promise<Workshop[]> => {
		try {
			const response = await api.get(`${BASE_URL}/`);
			return response.data;
		} catch (error) {
			console.error("Error fetching all workshops:", error);
			throw error;
		}
	},

	// Pobierz szczegóły warsztatu po ID
	getWorkshopById: async (id: number): Promise<Workshop> => {
		try {
			const response = await api.get(`${BASE_URL}/${id}/`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching workshop details (ID: ${id}):`, error);
			throw error;
		}
	},

	// Pobierz warsztat dla zalogowanego użytkownika (owner/mechanic)
	getCurrentUserWorkshop: async (): Promise<Workshop> => {
		try {
			const response = await api.get(`${BASE_URL}/my-workshop/`);
			return response.data;
		} catch (error) {
			console.error("Error fetching current user workshop:", error);
			throw error;
		}
	},

	// Utwórz nowy warsztat (tylko dla admina)
	createWorkshop: async (workshop: Omit<Workshop, "id">): Promise<Workshop> => {
		try {
			const response = await api.post(`${BASE_URL}/`, workshop);
			return response.data;
		} catch (error) {
			console.error("Error creating workshop:", error);
			throw error;
		}
	},

	// Zaktualizuj warsztat
	updateWorkshop: async (
		id: number,
		workshop: Partial<Workshop>
	): Promise<Workshop> => {
		try {
			const response = await api.put(`${BASE_URL}/${id}/`, workshop);
			return response.data;
		} catch (error) {
			console.error(`Error updating workshop (ID: ${id}):`, error);
			throw error;
		}
	},

	// Usuń warsztat (tylko dla admina)
	deleteWorkshop: async (id: number): Promise<void> => {
		try {
			await api.delete(`${BASE_URL}/${id}/`);
		} catch (error) {
			console.error(`Error deleting workshop (ID: ${id}):`, error);
			throw error;
		}
	},

	// Pobierz mechaników przypisanych do warsztatu
	getWorkshopMechanics: async (workshopId: number): Promise<any[]> => {
		try {
			const response = await api.get(`${BASE_URL}/${workshopId}/mechanics/`);
			return response.data;
		} catch (error) {
			console.error(
				`Error fetching mechanics for workshop (ID: ${workshopId}):`,
				error
			);
			throw error;
		}
	},
};
