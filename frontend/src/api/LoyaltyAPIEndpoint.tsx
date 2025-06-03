import api from "../api";
import { BASE_API_URL } from "../constants";

export interface LoyaltyPoints {
	id?: number;
	user: number; // Zmienione z 'client'
	total_points: number; // Zmienione z 'points'
	membership_level: string; // Zmienione z 'level'
	points_earned_this_year?: number; // Nowe pole
	last_updated?: string; // To pole może być niepotrzebne, jeśli nie ma go w backendzie
}

export const LoyaltyService = {
	// Pobieranie statusu punktów zalogowanego użytkownika
	getUserLoyaltyStatus: async (): Promise<LoyaltyPoints> => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/loyalty-program/my-loyalty-status/`
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching loyalty points:", error);
			throw error;
		}
	},

	// Pobieranie wszystkich punktów (tylko dla admina)
	getAllLoyaltyPoints: async (): Promise<LoyaltyPoints[]> => {
		try {
			const response = await api.get(`${BASE_API_URL}/loyalty-program/`);
			return response.data;
		} catch (error) {
			console.error("Error fetching all loyalty points:", error);
			throw error;
		}
	},

	// Pobieranie punktów dla konkretnego klienta
	getClientLoyaltyPoints: async (clientId: number): Promise<LoyaltyPoints> => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/loyalty-program/?user=${clientId}` // Zmienione z 'client'
			);
			return response.data.length > 0 ? response.data[0] : null;
		} catch (error) {
			console.error(
				`Error fetching loyalty points for user ${clientId}:`,
				error
			);
			throw error;
		}
	},

	// Aktualizacja punktów (tylko dla admina)
	updateLoyaltyPoints: async (
		id: number,
		data: Partial<LoyaltyPoints>
	): Promise<LoyaltyPoints> => {
		const transformedData = {
			user_id: data.user, // Zmiana nazwy pola na user_id
			total_points: data.total_points,
			membership_level: data.membership_level,
			points_earned_this_year: data.points_earned_this_year || 0,
		};

		try {
			console.log("Updating loyalty data:", transformedData);
			const response = await api.patch(
				`${BASE_API_URL}/loyalty-program/${id}/`,
				transformedData
			);
			return response.data;
		} catch (error) {
			console.error(`Error updating loyalty points ${id}:`, error);
			throw error;
		}
	},

	// Tworzenie nowych punktów (tylko dla admina)
	createLoyaltyPoints: async (data: LoyaltyPoints): Promise<LoyaltyPoints> => {
		// Zamiast wysyłać ID użytkownika, wyślij obiekt zawierający relację
		const transformedData = {
			user_id: data.user, // Zmiana nazwy pola na user_id, które będzie rozpoznane przez serializator
			total_points: data.total_points || 0,
			membership_level: data.membership_level || "bronze",
			points_earned_this_year: data.points_earned_this_year || 0,
		};

		try {
			console.log("Sending loyalty data to API:", transformedData);
			const response = await api.post(
				`${BASE_API_URL}/loyalty-program/`,
				transformedData
			);
			return response.data;
		} catch (error) {
			console.error("Error creating loyalty points:", error);
			// Dodaj więcej szczegółów o błędzie
			if (error.response) {
				console.error("Response status:", error.response.status);
				console.error("Response data:", error.response.data);
			}
			throw error;
		}
	},
};
