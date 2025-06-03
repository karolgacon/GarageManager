import api from "../api";
import { BASE_API_URL } from "../constants";

export const serviceService = {
	getAllServices: async () => {
		try {
			const response = await api.get(`${BASE_API_URL}/services/`);
			if (Array.isArray(response.data)) {
				return response.data;
			} else {
				return [];
			}
		} catch (error) {
			return [];
		}
	},

	getService: async (id: number) => {
		try {
			const response = await api.get(`${BASE_API_URL}/services/${id}/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	createService: async (serviceData: any) => {
		try {
			const response = await api.post(`${BASE_API_URL}/services/`, serviceData);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	updateService: async (id: number, serviceData: any) => {
		try {
			const response = await api.put(
				`${BASE_API_URL}/services/${id}/`,
				serviceData
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	partialUpdateService: async (id: number, serviceData: any) => {
		try {
			const response = await api.patch(
				`${BASE_API_URL}/services/${id}/`,
				serviceData
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	deleteService: async (id: number) => {
		try {
			await api.delete(`${BASE_API_URL}/services/${id}/`);
		} catch (error) {
			throw error;
		}
	},

	getVehicleServices: async (vehicleId: number) => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/vehicle-services/by_vehicle/`,
				{
					params: { vehicle_id: vehicleId },
				}
			);
			return response.data;
		} catch (error) {
			return [];
		}
	},

	getClientServices: async (clientId: number) => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/vehicle-services/by_client/`,
				{
					params: { client_id: clientId },
				}
			);
			return response.data;
		} catch (error) {
			return [];
		}
	},
};
