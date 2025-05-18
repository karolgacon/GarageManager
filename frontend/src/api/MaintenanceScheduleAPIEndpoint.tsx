import api from "../api";
import { MaintenanceSchedule } from "../models/MaintenanceScheduleModel";
import { BASE_API_URL } from "../constants";

const BASE_URL = `${BASE_API_URL}/maintenance-schedules`;

export const maintenanceScheduleService = {
	getAllSchedules: async (): Promise<MaintenanceSchedule[]> => {
		try {
			const response = await api.get(BASE_URL);
			return response.data;
		} catch (error) {
			console.error("Error fetching maintenance schedules:", error);
			throw error;
		}
	},

	getDueSchedules: async (): Promise<MaintenanceSchedule[]> => {
		try {
			const response = await api.get(`${BASE_URL}/due_schedules/`);
			return response.data;
		} catch (error) {
			console.error("Error fetching due maintenance schedules:", error);
			throw error;
		}
	},

	getScheduleById: async (id: number): Promise<MaintenanceSchedule> => {
		try {
			const response = await api.get(`${BASE_URL}/${id}/`);
			return response.data;
		} catch (error) {
			console.error(
				`Error fetching maintenance schedule with id ${id}:`,
				error
			);
			throw error;
		}
	},
};
