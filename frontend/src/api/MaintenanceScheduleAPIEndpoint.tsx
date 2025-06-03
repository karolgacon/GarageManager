import api from "../api";
import { BASE_API_URL } from "../constants";

export const maintenanceScheduleService = {
	getAllSchedules: async () => {
		try {
			const response = await api.get(`${BASE_API_URL}/maintenance-schedules/`);
			return response.data;
		} catch (error) {
			return [];
		}
	},

	getDueSchedules: async (clientId?: number) => {
		try {
			const params = clientId ? { client_id: clientId } : {};
			const response = await api.get(
				`${BASE_API_URL}/maintenance-schedules/due_schedules/`,
				{ params }
			);
			return response.data;
		} catch (error) {
			return [];
		}
	},

	getVehicleSchedules: async (vehicleId: number) => {
		try {
			const response = await api.get(`${BASE_API_URL}/maintenance-schedules/`, {
				params: { vehicle_id: vehicleId },
			});
			return response.data;
		} catch (error) {
			return [];
		}
	},

	getClientSchedules: async (clientId: number) => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/maintenance-schedules/by_client/`,
				{
					params: { client_id: clientId },
				}
			);
			return response.data;
		} catch (error) {
			return [];
		}
	},

	getSchedule: async (id: number) => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/maintenance-schedules/${id}/`
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	createSchedule: async (scheduleData: any) => {
		try {
			const response = await api.post(
				`${BASE_API_URL}/maintenance-schedules/`,
				scheduleData
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	updateSchedule: async (id: number, scheduleData: any) => {
		try {
			const response = await api.put(
				`${BASE_API_URL}/maintenance-schedules/${id}/`,
				scheduleData
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	deleteSchedule: async (id: number) => {
		try {
			const response = await api.delete(
				`${BASE_API_URL}/maintenance-schedules/${id}/`
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},
};
