import api from "../api";
import { BASE_API_URL } from "../constants";
import { Customer } from "../models/CustomerModel";

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

interface Mechanic {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	phone?: string;
	is_active: boolean;
	role: string;
}

const BASE_URL = `${BASE_API_URL}/workshops`;

export const workshopService = {
	getAllWorkshops: async (): Promise<Workshop[]> => {
		try {
			const response = await api.get(`${BASE_URL}/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getWorkshopById: async (id: number): Promise<Workshop> => {
		try {
			const response = await api.get(`${BASE_URL}/${id}/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getCurrentUserWorkshop: async (): Promise<Workshop> => {
		try {
			const response = await api.get(`${BASE_URL}/my-workshop/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	createWorkshop: async (workshop: Omit<Workshop, "id">): Promise<Workshop> => {
		try {
			const response = await api.post(`${BASE_URL}/`, workshop);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	updateWorkshop: async (
		id: number,
		workshop: Partial<Workshop>
	): Promise<Workshop> => {
		try {
			const response = await api.put(`${BASE_URL}/${id}/`, workshop);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	deleteWorkshop: async (id: number): Promise<void> => {
		try {
			await api.delete(`${BASE_URL}/${id}/`);
		} catch (error) {
			throw error;
		}
	},

	getWorkshopMechanics: async (workshopId: number): Promise<Mechanic[]> => {
		try {
			const response = await api.get(`${BASE_API_URL}/users/`, {
				params: {
					role: "mechanic",
					workshop_id: workshopId,
				},
			});

			return response.data.filter(
				(user: any) =>
					user.role === "mechanic" &&
					(user.workshop_id === workshopId || user.workshop?.id === workshopId)
			);
		} catch (error) {
			return [];
		}
	},

	getWorkshopCustomers: async (workshopId: number): Promise<Customer[]> => {
		try {
			const response = await api.get(`${BASE_URL}/${workshopId}/customers/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getCurrentWorkshopCustomers: async (): Promise<Customer[]> => {
		try {
			const response = await api.get(`${BASE_URL}/my-workshop/customers/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	assignCustomerToWorkshop: async (
		workshopId: number,
		customerId: number
	): Promise<void> => {
		try {
			await api.post(`${BASE_URL}/${workshopId}/customers/`, {
				customer_id: customerId,
			});
		} catch (error) {
			throw error;
		}
	},

	removeCustomerFromWorkshop: async (
		workshopId: number,
		customerId: number
	): Promise<void> => {
		try {
			await api.delete(`${BASE_URL}/${workshopId}/customers/${customerId}/`);
		} catch (error) {
			throw error;
		}
	},

	searchWorkshops: async (params: {
		query?: string;
		latitude?: number;
		longitude?: number;
		sort_by?: string;
		specialization?: string;
		has_location?: boolean;
	}): Promise<Workshop[]> => {
		try {
			const response = await api.get(`${BASE_URL}/search/`, { params });
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getSpecializations: async (): Promise<
		Array<{ value: string; label: string }>
	> => {
		try {
			const response = await api.get(`${BASE_URL}/specializations/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	checkAvailability: async (
		workshopId: number,
		date: string
	): Promise<{
		available: boolean;
		message: string;
		slots: string[];
		working_hours?: {
			start: string;
			end: string;
			slot_duration: number;
		};
	}> => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/availability/check_availability/`,
				{
					params: { workshop_id: workshopId, date },
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getAvailableDates: async (
		workshopId: number,
		startDate: string,
		endDate: string
	): Promise<{
		available_dates: string[];
	}> => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/availability/available_dates/`,
				{
					params: {
						workshop_id: workshopId,
						start_date: startDate,
						end_date: endDate,
					},
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	checkSlot: async (
		workshopId: number,
		datetime: string
	): Promise<{
		available: boolean;
		workshop_id: number;
		datetime: string;
	}> => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/availability/check_slot/`,
				{
					params: { workshop_id: workshopId, datetime },
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Nowe metody dla mechaników
	getWorkshopMechanics: async (workshopId: number) => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/availability/get-workshop-mechanics/`,
				{
					params: { workshop_id: workshopId },
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	checkMechanicAvailability: async (
		workshopId: number,
		date: string,
		time?: string,
		duration?: number
	) => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/availability/get-mechanic-availability/`,
				{
					params: {
						workshop_id: workshopId,
						date,
						...(time && { time }),
						...(duration && { duration }),
					},
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},
};

export type { Workshop, Mechanic };
