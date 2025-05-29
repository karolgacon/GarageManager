import api from "../api";
import { BASE_API_URL } from "../constants";
import { Customer } from "../models/CustomerModel";

const API_URL = `${BASE_API_URL}`;

export const customerService = {
	// Get all customers for current user's workshop (mechanic/owner)
	getAllCustomers: async (): Promise<Customer[]> => {
		try {
			const response = await api.get(`${API_URL}/workshops/my-customers/`);
			return response.data;
		} catch (error) {
			console.error("Error fetching customers:", error);
			throw error;
		}
	},

	// Get customer by ID - używamy prostego endpointu users/{id}
	getCustomerById: async (id: number): Promise<Customer> => {
		try {
			const response = await api.get(`${API_URL}/users/${id}/`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching customer ${id}:`, error);
			throw error;
		}
	},

	// Get workshop customers (for admin)
	getWorkshopCustomers: async (workshopId: number): Promise<Customer[]> => {
		try {
			const response = await api.get(
				`${API_URL}/workshops/${workshopId}/customers/`
			);
			return response.data;
		} catch (error) {
			console.error(`Error fetching workshop ${workshopId} customers:`, error);
			throw error;
		}
	},

	// Create customer
	createCustomer: async (
		customerData: Partial<Customer>
	): Promise<Customer> => {
		try {
			const response = await api.post(`${API_URL}/register/`, customerData);
			return response.data;
		} catch (error) {
			console.error("Error creating customer:", error);
			throw error;
		}
	},

	// Update customer
	updateCustomer: async (
		id: number,
		customerData: Partial<Customer>
	): Promise<Customer> => {
		try {
			const response = await api.put(`${API_URL}/users/${id}/`, customerData);
			return response.data;
		} catch (error) {
			console.error(`Error updating customer ${id}:`, error);
			throw error;
		}
	},

	// Delete customer
	deleteCustomer: async (id: number): Promise<void> => {
		try {
			await api.delete(`${API_URL}/users/${id}/`);
		} catch (error) {
			console.error(`Error deleting customer ${id}:`, error);
			throw error;
		}
	},

	// Get customer vehicles
	getCustomerVehicles: async (customerId: number) => {
		try {
			console.log(`Fetching vehicles for customer ID: ${customerId}`);

			// Spróbuj różne warianty
			let response;

			// Opcja 1: owner
			try {
				response = await api.get(`${API_URL}/vehicles/?owner=${customerId}`);
				console.log("Option 1 (owner) worked:", response.data.length);
			} catch (e) {
				console.log("Option 1 (owner) failed:", e);
			}

			// Opcja 2: owner_id
			if (
				!response ||
				response.data.length === 0 ||
				response.data.some(
					(v) => v.owner !== customerId && v.owner_id !== customerId
				)
			) {
				try {
					response = await api.get(
						`${API_URL}/vehicles/?owner_id=${customerId}`
					);
					console.log("Option 2 (owner_id) worked:", response.data.length);
				} catch (e) {
					console.log("Option 2 (owner_id) failed:", e);
				}
			}

			// Opcja 3: client
			if (
				!response ||
				response.data.length === 0 ||
				response.data.some(
					(v) => v.owner !== customerId && v.owner_id !== customerId
				)
			) {
				try {
					response = await api.get(`${API_URL}/vehicles/?client=${customerId}`);
					console.log("Option 3 (client) worked:", response.data.length);
				} catch (e) {
					console.log("Option 3 (client) failed:", e);
				}
			}

			console.log(`Final vehicles for customer ${customerId}:`, response.data);
			return response.data;
		} catch (error) {
			console.error(
				`Error fetching vehicles for customer ${customerId}:`,
				error
			);
			throw error;
		}
	},
};
