import api from "../api";
import { BASE_API_URL } from "../constants";

export interface LoyaltyPoints {
	id?: number;
	user: number; 
	total_points: number;
	membership_level: string;
	points_earned_this_year?: number;
	last_updated?: string;
}

export const LoyaltyService = {
	getUserLoyaltyStatus: async (): Promise<LoyaltyPoints> => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/loyalty-program/my-loyalty-status/`
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getAllLoyaltyPoints: async (): Promise<LoyaltyPoints[]> => {
		try {
			const response = await api.get(`${BASE_API_URL}/loyalty-program/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getClientLoyaltyPoints: async (clientId: number): Promise<LoyaltyPoints> => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/loyalty-program/?user=${clientId}` // Zmienione z 'client'
			);
			return response.data.length > 0 ? response.data[0] : null;
		} catch (error) {
			throw error;
		}
	},

	updateLoyaltyPoints: async (
		id: number,
		data: Partial<LoyaltyPoints>
	): Promise<LoyaltyPoints> => {
		const transformedData = {
			user_id: data.user, 
			total_points: data.total_points,
			membership_level: data.membership_level,
			points_earned_this_year: data.points_earned_this_year || 0,
		};

		try {
			const response = await api.patch(
				`${BASE_API_URL}/loyalty-program/${id}/`,
				transformedData
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	createLoyaltyPoints: async (data: LoyaltyPoints): Promise<LoyaltyPoints> => {
		const transformedData = {
			user_id: data.user,
			total_points: data.total_points || 0,
			membership_level: data.membership_level || "bronze",
			points_earned_this_year: data.points_earned_this_year || 0,
		};

		try {
			const response = await api.post(
				`${BASE_API_URL}/loyalty-program/`,
				transformedData
			);
			return response.data;
		} catch (error) {
			if (error.response) {
			}
			throw error;
		}
	},
};
