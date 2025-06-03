import api from "../api";
import { BASE_API_URL } from "../constants";

export const maintenanceScheduleService = {
	// Get all maintenance schedules - admin only functionality
	getAllSchedules: async () => {
		try {
			const response = await api.get(`${BASE_API_URL}/maintenance-schedules/`);
			return response.data;
		} catch (error) {
			console.error("Error fetching all maintenance schedules:", error);
			return [];
		}
	},

	// Get due maintenance schedules - use client filtering parameter
	getDueSchedules: async (clientId?: number) => {
		try {
			// Add the client_id as a parameter if provided
			const params = clientId ? { client_id: clientId } : {};

			console.log(
				`Fetching due maintenance schedules${
					clientId ? ` for client ${clientId}` : ""
				}`
			);
			const response = await api.get(
				`${BASE_API_URL}/maintenance-schedules/due_schedules/`,
				{ params }
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching due maintenance schedules:", error);
			return [];
		}
	},

	// Get vehicle maintenance schedules
	getVehicleSchedules: async (vehicleId: number) => {
		try {
			console.log(
				`Fetching maintenance schedules for vehicle ID: ${vehicleId}`
			);
			const response = await api.get(`${BASE_API_URL}/maintenance-schedules/`, {
				params: { vehicle_id: vehicleId },
			});
			console.log(
				"Vehicle maintenance schedules fetched successfully:",
				response.data
			);
			return response.data;
		} catch (error) {
			console.error(
				`Error fetching maintenance schedules for vehicle ${vehicleId}:`,
				error
			);
			return [];
		}
	},

	// Get client's maintenance schedules directly
	getClientSchedules: async (clientId: number) => {
		try {
			console.log(`Fetching maintenance schedules for client ID: ${clientId}`);
			const response = await api.get(
				`${BASE_API_URL}/maintenance-schedules/by_client/`,
				{
					params: { client_id: clientId },
				}
			);
			return response.data;
		} catch (error) {
			console.error(
				`Error fetching maintenance schedules for client ${clientId}:`,
				error
			);
			return [];
		}
	},

	// Get maintenance schedule details
	getSchedule: async (id: number) => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/maintenance-schedules/${id}/`
			);
			return response.data;
		} catch (error) {
			console.error(
				`Error fetching maintenance schedule with ID ${id}:`,
				error
			);
			throw error;
		}
	},

	// Create maintenance schedule
	createSchedule: async (scheduleData: any) => {
		try {
			const response = await api.post(
				`${BASE_API_URL}/maintenance-schedules/`,
				scheduleData
			);
			return response.data;
		} catch (error) {
			console.error("Error creating maintenance schedule:", error);
			throw error;
		}
	},

	// Update maintenance schedule
	updateSchedule: async (id: number, scheduleData: any) => {
		try {
			const response = await api.put(
				`${BASE_API_URL}/maintenance-schedules/${id}/`,
				scheduleData
			);
			return response.data;
		} catch (error) {
			console.error(
				`Error updating maintenance schedule with ID ${id}:`,
				error
			);
			throw error;
		}
	},

	// Delete maintenance schedule
	deleteSchedule: async (id: number) => {
		try {
			const response = await api.delete(
				`${BASE_API_URL}/maintenance-schedules/${id}/`
			);
			return response.data;
		} catch (error) {
			console.error(
				`Error deleting maintenance schedule with ID ${id}:`,
				error
			);
			throw error;
		}
	},
};
