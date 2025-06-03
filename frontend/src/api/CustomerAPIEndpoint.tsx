import api from "../api";
import { BASE_API_URL } from "../constants";
import { Customer } from "../models/CustomerModel";

const API_URL = `${BASE_API_URL}`;

export const customerService = {
	getAllCustomers: async (): Promise<Customer[]> => {
		try {
			const response = await api.get(`${API_URL}/workshops/my-customers/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getCustomerById: async (id: number): Promise<any> => {
		try {
			const response = await api.get(`${API_URL}/users/${id}/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getWorkshopCustomers: async (workshopId: number): Promise<Customer[]> => {
		try {
			const response = await api.get(
				`${API_URL}/workshops/${workshopId}/customers/`
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	createCustomer: async (
		customerData: Partial<Customer>
	): Promise<Customer> => {
		try {
			const response = await api.post(
				`${API_URL}/user/register/`,
				customerData
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	updateCustomer: async (
		id: number,
		customerData: Partial<Customer>
	): Promise<Customer> => {
		try {
			const response = await api.put(`${API_URL}/users/${id}/`, customerData);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	deleteCustomer: async (id: number): Promise<void> => {
		try {
			await api.delete(`${API_URL}/users/${id}/`);
		} catch (error) {
			throw error;
		}
	},

	getCustomerVehicles: async (customerId: number | undefined) => {
		try {
			if (!customerId) {
				return [];
			}

			try {
				const response = await api.get(`${BASE_API_URL}/vehicles/`, {
					params: { owner: customerId },
				});
				return response.data;
			} catch (error) {
				try {
					const response = await api.get(`${BASE_API_URL}/vehicles/`, {
						params: { owner_id: customerId },
					});
					return response.data;
				} catch (secondError) {
					try {
						const response = await api.get(
							`${BASE_API_URL}/vehicles/client/${customerId}/`
						);
						return response.data;
					} catch (thirdError) {
						return [];
					}
				}
			}
		} catch (error) {
			return [];
		}
	},
};
