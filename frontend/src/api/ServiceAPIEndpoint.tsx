import api from "../api";
import { Service } from "../models/ServiceModel";
import { BASE_API_URL } from "../constants";

const BASE_URL = `${BASE_API_URL}/services/`;

export const serviceService = {
	getAllServices: async (): Promise<Service[]> => {
		try {
			const response = await api.get(BASE_URL);
			return response.data.map((service: any) => ({
				...service,
				price:
					typeof service.price === "number"
						? service.price
						: parseFloat(service.price || 0),
				duration:
					typeof service.duration === "number"
						? service.duration
						: parseInt(service.duration || 0, 10),
			}));
		} catch (error) {
			console.error("Error fetching services:", error);
			throw error;
		}
	},

	getServiceById: async (id: number): Promise<Service> => {
		try {
			const response = await api.get(`${BASE_URL}/${id}/`);
			return {
				...response.data,
				price:
					typeof response.data.price === "number"
						? response.data.price
						: parseFloat(response.data.price || 0),
				duration:
					typeof response.data.duration === "number"
						? response.data.duration
						: parseInt(response.data.duration || 0, 10),
			};
		} catch (error) {
			console.error(`Error fetching service with id ${id}:`, error);
			throw error;
		}
	},

	createService: async (service: Omit<Service, "id">): Promise<Service> => {
		try {
			const response = await api.post(`${BASE_URL}/`, service);
			return response.data;
		} catch (error) {
			console.error("Error creating service:", error);
			throw error;
		}
	},

	updateService: async (
		id: number,
		service: Partial<Service>
	): Promise<Service> => {
		try {
			const response = await api.put(`${BASE_URL}/${id}/`, service);
			return response.data;
		} catch (error) {
			console.error(`Error updating service with id ${id}:`, error);
			throw error;
		}
	},

	deleteService: async (id: number): Promise<void> => {
		try {
			await api.delete(`${BASE_URL}/${id}/`);
		} catch (error) {
			console.error(`Error deleting service with id ${id}:`, error);
			throw error;
		}
	},

	toggleServiceStatus: async (
		id: number,
		isActive: boolean
	): Promise<Service> => {
		try {
			const response = await api.patch(`${BASE_URL}/${id}/`, {
				is_active: isActive,
			});
			return response.data;
		} catch (error) {
			console.error(`Error toggling service status with id ${id}:`, error);
			throw error;
		}
	},
};
