import api from "../api";
import { BASE_API_URL } from "../constants";

const BASE_URL = `${BASE_API_URL}/appointments`;

export const bookingService = {
	// Get all bookings
	getAllBookings: async () => {
		try {
			const response = await api.get(`${BASE_URL}/`);
			return response.data;
		} catch (error) {
			console.error("Error fetching all bookings:", error);
			throw error;
		}
	},

	// Get bookings for a specific client
	getClientBookings: async (
		clientId: number,
		startDate?: string,
		endDate?: string
	) => {
		try {
			let params: any = { client_id: clientId };

			if (startDate && endDate) {
				params.start_date = startDate;
				params.end_date = endDate;
			}

			const response = await api.get(`${BASE_URL}/by_client/`, { params });
			return response.data;
		} catch (error) {
			console.error(`Error fetching client bookings (ID: ${clientId}):`, error);
			throw error;
		}
	},

	// Get bookings for a specific mechanic
	getMechanicBookings: async (
		mechanicId: number,
		startDate?: string,
		endDate?: string
	) => {
		try {
			// Use query parameters for mechanic bookings
			const params: any = { mechanic_id: mechanicId };

			if (startDate && endDate) {
				params.start_date = startDate;
				params.end_date = endDate;
			}

			const response = await api.get(`${BASE_URL}/by_mechanic/`, { params });
			return response.data;
		} catch (error) {
			console.error(
				`Error fetching mechanic bookings (ID: ${mechanicId}):`,
				error
			);
			return []; // Return empty array on error to prevent UI breaking
		}
	},

	// Get bookings for a specific workshop
	getWorkshopBookings: async (
		workshopId: number,
		startDate?: string,
		endDate?: string
	) => {
		try {
			// Use query parameters based on API documentation
			const params: any = { workshop_id: workshopId };

			if (startDate && endDate) {
				params.start_date = startDate;
				params.end_date = endDate;
			}

			const response = await api.get(`${BASE_URL}/by_workshop/`, { params });
			return response.data;
		} catch (error) {
			console.error(
				`Error fetching workshop bookings (ID: ${workshopId}):`,
				error
			);
			return []; // Return empty array on error
		}
	},

	// Get a single booking by ID
	getBooking: async (bookingId: number) => {
		try {
			const response = await api.get(`${BASE_URL}/${bookingId}/`);
			return response.data;
		} catch (error) {
			console.error(
				`Error fetching booking details (ID: ${bookingId}):`,
				error
			);
			throw error;
		}
	},

	// Create a new booking
	createBooking: async (bookingData: any) => {
		try {
			const response = await api.post(`${BASE_URL}/`, bookingData);
			return response.data;
		} catch (error) {
			console.error("Error creating booking:", error);
			throw error;
		}
	},

	// Update an existing booking
	updateBooking: async (bookingId: number, bookingData: any) => {
		try {
			const response = await api.put(`${BASE_URL}/${bookingId}/`, bookingData);
			return response.data;
		} catch (error) {
			console.error(`Error updating booking (ID: ${bookingId}):`, error);
			throw error;
		}
	},

	// Delete a booking
	deleteBooking: async (bookingId: number) => {
		try {
			const response = await api.delete(`${BASE_URL}/${bookingId}/`);
			return response.data;
		} catch (error) {
			console.error(`Error deleting booking (ID: ${bookingId}):`, error);
			throw error;
		}
	},

	// Change booking status
	updateBookingStatus: async (bookingId: number, status: string) => {
		try {
			// Use the PATCH method with the correct endpoint for updating status
			const response = await api.patch(`${BASE_URL}/${bookingId}/`, {
				status,
			});
			return response.data;
		} catch (error) {
			console.error(`Error updating booking status (ID: ${bookingId}):`, error);
			throw error;
		}
	},

	// Pobierz wszystkie dostępne terminy do rezerwacji dla warsztatu
	getAvailableSlots: async (workshopId: number, date: string) => {
		try {
			const params = {
				workshop_id: workshopId,
				date: date,
			};

			const response = await api.get(`${BASE_URL}/available_slots/`, {
				params,
			});
			return response.data;
		} catch (error) {
			console.error("Error fetching available slots:", error);
			return []; // Return empty array on error
		}
	},

	// Pobierz nadchodzące rezerwacje dla zalogowanego użytkownika
	getUpcomingBookings: async () => {
		try {
			const response = await api.get(`${BASE_URL}/upcoming/`);
			return response.data;
		} catch (error) {
			console.error("Error fetching upcoming bookings:", error);
			return []; // Return empty array on error
		}
	},

	// Pobierz historyczne rezerwacje dla zalogowanego użytkownika
	getPastBookings: async () => {
		try {
			const response = await api.get(`${BASE_URL}/past/`);
			return response.data;
		} catch (error) {
			console.error("Error fetching past bookings:", error);
			return []; // Return empty array on error
		}
	},
};
