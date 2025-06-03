import api from "../api";
import { BASE_API_URL } from "../constants";

// Update service object to use appointments instead of bookings
export const bookingService = {
	// Get all bookings
	getAllBookings: async () => {
		try {
			const response = await api.get(`${BASE_API_URL}/appointments/`);
			return response.data;
		} catch (error) {
			console.error("Error fetching all bookings:", error);
			throw error;
		}
	},

	// Get client bookings - updated to use correct endpoint
	getClientBookings: async (
		clientId?: number,
		startDate?: string,
		endDate?: string
	) => {
		try {
			if (!clientId) {
				console.error("Client ID is undefined in getClientBookings");
				return []; // Return empty array instead of making a bad API call
			}

			const params: Record<string, any> = {};
			if (startDate) params.start_date = startDate;
			if (endDate) params.end_date = endDate;

			console.log(`Fetching bookings for client ID: ${clientId}`);

			// Try with the by_client endpoint from the API documentation
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
				console.log("Client bookings fetched successfully:", response.data);
				return response.data;
			} catch (firstError) {
				console.error("First endpoint pattern failed:", firstError);

				// Try another common pattern
				try {
					const response = await api.get(`${BASE_API_URL}/appointments/`, {
						params: {
							client_id: clientId,
							...params,
						},
					});
					console.log(
						"Client bookings fetched with second pattern:",
						response.data
					);
					return response.data;
				} catch (secondError) {
					console.error("Second endpoint pattern failed:", secondError);
					throw new Error("Could not fetch client bookings");
				}
			}
		} catch (error) {
			console.error("Error in getClientBookings:", error);
			return []; // Return empty array on error
		}
	},

	// Get single booking
	getBooking: async (id: number) => {
		try {
			const response = await api.get(`${BASE_API_URL}/appointments/${id}/`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching booking with ID ${id}:`, error);
			throw error;
		}
	},

	// Get upcoming bookings
	getUpcomingBookings: async () => {
		try {
			const response = await api.get(
				`${BASE_API_URL}/appointments/by_status/`,
				{
					params: { status: "scheduled" },
				}
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching upcoming bookings:", error);
			throw error;
		}
	},

	// Get past bookings
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
			console.error("Error fetching past bookings:", error);
			throw error;
		}
	},

	// Get workshop bookings
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
			console.error(
				`Error fetching bookings for workshop ${workshopId}:`,
				error
			);
			throw error;
		}
	},

	// Get mechanic bookings
	getMechanicBookings: async (
		mechanicId: number,
		startDate?: string,
		endDate?: string
	) => {
		try {
			const params: Record<string, any> = {};
			if (startDate) params.start_date = startDate;
			if (endDate) params.end_date = endDate;

			// Use the correct endpoint pattern based on your API docs
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
			console.error(
				`Error fetching bookings for mechanic ${mechanicId}:`,
				error
			);
			throw error;
		}
	},

	// Create booking
	createBooking: async (bookingData: any) => {
		try {
			const response = await api.post(
				`${BASE_API_URL}/appointments/`,
				bookingData
			);
			return response.data;
		} catch (error) {
			console.error("Error creating booking:", error);
			throw error;
		}
	},

	// Update booking
	updateBooking: async (id: number, bookingData: any) => {
		try {
			const response = await api.put(
				`${BASE_API_URL}/appointments/${id}/`,
				bookingData
			);
			return response.data;
		} catch (error) {
			console.error(`Error updating booking with ID ${id}:`, error);
			throw error;
		}
	},

	// Delete booking
	deleteBooking: async (id: number) => {
		try {
			const response = await api.delete(`${BASE_API_URL}/appointments/${id}/`);
			return response.data;
		} catch (error) {
			console.error(`Error deleting booking with ID ${id}:`, error);
			throw error;
		}
	},

	// Get booking details with related data
	getBookingDetails: async (id: number) => {
		try {
			// Pobierz podstawowe dane rezerwacji
			const response = await api.get(`${BASE_API_URL}/appointments/${id}/`);
			const bookingData = response.data;

			// Pobierz dane powiązane
			let enrichedData = { ...bookingData };

			// Pobierz dane klienta jeśli dostępne
			if (typeof bookingData.client === "number") {
				try {
					const clientResponse = await api.get(
						`${BASE_API_URL}/users/${bookingData.client}/`
					);
					enrichedData.client = clientResponse.data;
				} catch (clientError) {
					console.error("Error fetching client details:", clientError);
				}
			}

			// Pobierz dane pojazdu jeśli dostępne
			if (typeof bookingData.vehicle === "number") {
				try {
					const vehicleResponse = await api.get(
						`${BASE_API_URL}/vehicles/${bookingData.vehicle}/`
					);
					enrichedData.vehicle = vehicleResponse.data;
				} catch (vehicleError) {
					console.error("Error fetching vehicle details:", vehicleError);
				}
			}

			// Pobierz dane warsztatu jeśli dostępne
			if (typeof bookingData.workshop === "number") {
				try {
					const workshopResponse = await api.get(
						`${BASE_API_URL}/workshops/${bookingData.workshop}/`
					);
					enrichedData.workshop = workshopResponse.data;
				} catch (workshopError) {
					console.error("Error fetching workshop details:", workshopError);
				}
			}

			console.log("Enriched booking data:", enrichedData);
			return enrichedData;
		} catch (error) {
			console.error(`Error fetching detailed booking with ID ${id}:`, error);
			throw error;
		}
	},
};
