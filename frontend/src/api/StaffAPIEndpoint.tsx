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
	hired_date?: string; // Add this explicitly to match backend field
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
	// Pobierz wszystkich pracowników warsztatu
	getWorkshopStaff: async (workshopId: number): Promise<StaffMember[]> => {
		try {
			// Używaj nowego endpoint staff
			const response = await api.get(
				`${BASE_API_URL}/workshops/${workshopId}/staff/`
			);
			console.log("Staff API response:", response.data);
			return response.data;
		} catch (error) {
			console.error(`Error fetching staff for workshop ${workshopId}:`, error);

			// Fallback - spróbuj przez mechanics endpoint
			try {
				const response = await api.get(
					`${BASE_API_URL}/workshops/${workshopId}/mechanics/`
				);
				return response.data;
			} catch (secondError) {
				console.error("Mechanics endpoint failed:", secondError);

				// Ostatnia próba - przez users endpoint
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
					console.error("Final attempt failed:", thirdError);
					throw error;
				}
			}
		}
	},

	// Pobierz pracownika po ID
	getStaffById: async (id: number): Promise<StaffMember> => {
		try {
			const response = await api.get(`${BASE_URL}/${id}/`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching staff member ${id}:`, error);
			throw error;
		}
	},

	// Stwórz nowego pracownika
	createStaff: async (
		staffData: Partial<StaffMember>
	): Promise<StaffMember> => {
		try {
			const response = await api.post(`${BASE_URL}/`, staffData);
			return response.data;
		} catch (error) {
			console.error("Error creating staff member:", error);
			throw error;
		}
	},

	// Aktualizuj pracownika
	updateStaff: async (
		id: number,
		staffData: Partial<StaffMember>
	): Promise<StaffMember> => {
		try {
			const response = await api.put(`${BASE_URL}/${id}/`, staffData);
			return response.data;
		} catch (error) {
			console.error(`Error updating staff member ${id}:`, error);
			throw error;
		}
	},

	// Usuń pracownika
	deleteStaff: async (id: number): Promise<void> => {
		try {
			await api.delete(`${BASE_URL}/${id}/`);
		} catch (error) {
			console.error(`Error deleting staff member ${id}:`, error);
			throw error;
		}
	},

	// Aktualizuj status pracownika
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
			console.error(`Error updating staff status ${id}:`, error);
			throw error;
		}
	},

	// Metoda pobierania frekwencji
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
