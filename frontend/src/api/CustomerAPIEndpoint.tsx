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
	getCustomerById: async (id: number): Promise<any> => {
		try {
			console.log(`Fetching customer with ID ${id} from API`);
			// Sprawdź, czy używasz właściwej ścieżki API
			const response = await api.get(`${API_URL}/users/${id}/`);
			console.log(`Customer API response for ID ${id}:`, response.data);
			return response.data;
		} catch (error) {
			console.error(`Error fetching customer ${id}:`, error);
			// Rzuć błąd, aby można go było obsłużyć w komponencie
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
			const response = await api.post(
				`${API_URL}/user/register/`,
				customerData
			);
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
	getCustomerVehicles: async (customerId: number | undefined) => {
		try {
			console.log("Fetching vehicles for customer ID:", customerId);

			// If customerId is undefined, return empty array immediately
			if (!customerId) {
				console.log("Customer ID is undefined, skipping API call");
				return [];
			}

			// Try the first API endpoint pattern
			try {
				const response = await api.get(`${BASE_API_URL}/vehicles/`, {
					params: { owner: customerId },
				});
				console.log("Option 1 (owner) worked:", customerId);
				return response.data;
			} catch (error) {
				console.log("Option 1 (owner) failed:", error);

				// Try the fallback endpoint pattern
				try {
					const response = await api.get(`${BASE_API_URL}/vehicles/`, {
						params: { owner_id: customerId },
					});
					console.log("Option 2 (owner_id) worked:", customerId);
					return response.data;
				} catch (secondError) {
					console.log("Option 2 (owner_id) failed:", secondError);

					// Last attempt - try client_id pattern
					try {
						const response = await api.get(
							`${BASE_API_URL}/vehicles/client/${customerId}/`
						);
						console.log("Option 3 (client endpoint) worked");
						return response.data;
					} catch (thirdError) {
						console.log(
							"All options failed for customer vehicles:",
							thirdError
						);
						return [];
					}
				}
			}
		} catch (error) {
			console.error("Error fetching customer vehicles:", error);
			return [];
		}
	},
};
