import api from "../api";
import { BASE_API_URL } from "../constants";

export interface StaffMember {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	phone?: string;
	role: string;
	workshop_id: number;
	created_at: string;
	hired_date?: string;
	current_status?: string;
	performance_score?: number;
	days_worked?: number;
	vacation_days_left?: number;
	attendance_records?: AttendanceRecord[];
}

export interface AttendanceRecord {
	id: number;
	staff_id: number;
	date: string;
	check_in?: string;
	check_out?: string;
	status: "present" | "absent" | "sick" | "vacation";
	created_at: string;
}

const BASE_URL = `${BASE_API_URL}/staff`;

export const staffService = {
	getWorkshopStaff: async (workshopId: number): Promise<StaffMember[]> => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/workshops/${workshopId}/staff/`
			);
			return response.data;
		} catch (error) {
			try {
				const response = await api.get(
					`${BASE_API_URL}/workshops/${workshopId}/mechanics/`
				);
				return response.data;
			} catch (secondError) {
				try {
					const response = await api.get(`${BASE_API_URL}/users/`, {
						params: {
							workshop_id: workshopId,
							role: ["mechanic", "owner"].join(","),
						},
					});
					const filteredStaff = response.data.filter(
						(user: any) => user.workshop_id === workshopId
					);
					return filteredStaff;
				} catch (thirdError) {
					throw error;
				}
			}
		}
	},

	getStaffById: async (id: number): Promise<StaffMember> => {
		try {
			const response = await api.get(`${BASE_URL}/${id}/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	createStaff: async (
		staffData: Partial<StaffMember>
	): Promise<StaffMember> => {
		try {
			const response = await api.post(`${BASE_URL}/`, staffData);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	updateStaff: async (
		id: number,
		staffData: Partial<StaffMember>
	): Promise<StaffMember> => {
		try {
			const response = await api.put(`${BASE_URL}/${id}/`, staffData);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	deleteStaff: async (id: number): Promise<void> => {
		try {
			await api.delete(`${BASE_URL}/${id}/`);
		} catch (error) {
			throw error;
		}
	},

	updateStaffStatus: async (
		id: number,
		status: string
	): Promise<StaffMember> => {
		try {
			const response = await api.patch(`${BASE_URL}/${id}/status/`, {
				current_status: status,
			});
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getStaffAttendance: async (
		staffId: number,
		month?: number,
		year?: number
	): Promise<AttendanceRecord[]> => {
		const params = new URLSearchParams();
		if (month !== undefined) params.append("month", month.toString());
		if (year !== undefined) params.append("year", year.toString());

		const response = await api.get(`/staff/${staffId}/attendance?${params}`);
		return response.data;
	},
};

export type { StaffMember };
