import api from "../api";
import { BASE_API_URL } from "../constants";

export const bookingService = {
	getAllBookings: async () => {
		try {
			const response = await api.get(`${BASE_API_URL}/appointments/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getClientBookings: async (
		clientId?: number,
		startDate?: string,
		endDate?: string
	) => {
		try {
			if (!clientId) {
				return [];
			}

			const params: Record<string, any> = {};
			if (startDate) params.start_date = startDate;
			if (endDate) params.end_date = endDate;

			try {
				const response = await api.get(
					`${BASE_API_URL}/appointments/by_client/`,
					{
						params: {
							client_id: clientId,
							...params,
						},
					}
				);
				return response.data;
			} catch (firstError) {
				try {
					const response = await api.get(`${BASE_API_URL}/appointments/`, {
						params: {
							client_id: clientId,
							...params,
						},
					});
					return response.data;
				} catch (secondError) {
					throw new Error("Could not fetch client bookings");
				}
			}
		} catch (error) {
			return [];
		}
	},

	getBooking: async (id: number) => {
		try {
			const response = await api.get(`${BASE_API_URL}/appointments/${id}/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getUpcomingBookings: async () => {
		try {
			// Pobierz tylko zaplanowane appointments jako upcoming
			const response = await api.get(
				`${BASE_API_URL}/appointments/by_status/`,
				{
					params: { status: "scheduled" },
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getPastBookings: async () => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/appointments/by_status/`,
				{
					params: { status: "completed" },
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getWorkshopBookings: async (
		workshopId: number,
		startDate?: string,
		endDate?: string
	) => {
		try {
			const params: Record<string, any> = {};
			if (startDate) params.start_date = startDate;
			if (endDate) params.end_date = endDate;

			const response = await api.get(
				`${BASE_API_URL}/appointments/by_workshop/`,
				{
					params: {
						workshop_id: workshopId,
						...params,
					},
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getMechanicBookings: async (
		mechanicId: number,
		startDate?: string,
		endDate?: string
	) => {
		try {
			const params: Record<string, any> = {};
			if (startDate) params.start_date = startDate;
			if (endDate) params.end_date = endDate;

			const response = await api.get(
				`${BASE_API_URL}/appointments/by_priority/`,
				{
					params: {
						mechanic_id: mechanicId,
						...params,
					},
				}
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	createBooking: async (bookingData: any) => {
		try {
			const response = await api.post(
				`${BASE_API_URL}/appointments/`,
				bookingData
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	updateBooking: async (id: number, bookingData: any) => {
		try {
			const response = await api.put(
				`${BASE_API_URL}/appointments/${id}/`,
				bookingData
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	// Funkcja do zmiany statusu appointment przez mechanika
	updateBookingStatus: async (
		id: number,
		status: "scheduled" | "in_progress" | "completed"
	) => {
		try {
			const response = await api.patch(`${BASE_API_URL}/appointments/${id}/`, {
				status,
			});
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	deleteBooking: async (id: number) => {
		try {
			const response = await api.delete(`${BASE_API_URL}/appointments/${id}/`);
			return response.data;
		} catch (error) {
			throw error;
		}
	},

	getBookingDetails: async (id: number) => {
		try {
			const response = await api.get(`${BASE_API_URL}/appointments/${id}/`);
			const bookingData = response.data;
			let enrichedData = { ...bookingData };

			if (typeof bookingData.client === "number") {
				try {
					const clientResponse = await api.get(
						`${BASE_API_URL}/users/${bookingData.client}/`
					);
					enrichedData.client = clientResponse.data;
				} catch (clientError) {}
			}

			if (typeof bookingData.vehicle === "number") {
				try {
					const vehicleResponse = await api.get(
						`${BASE_API_URL}/vehicles/${bookingData.vehicle}/`
					);
					enrichedData.vehicle = vehicleResponse.data;
				} catch (vehicleError) {}
			}

			if (typeof bookingData.workshop === "number") {
				try {
					const workshopResponse = await api.get(
						`${BASE_API_URL}/workshops/${bookingData.workshop}/`
					);
					enrichedData.workshop = workshopResponse.data;
				} catch (workshopError) {}
			}

			return enrichedData;
		} catch (error) {
			throw error;
		}
	},
};
