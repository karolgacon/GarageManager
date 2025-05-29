import { useState, useEffect } from "react";
import { Customer } from "../models/CustomerModel";
import { Workshop } from "../models/WorkshopModel";
import { customerService } from "../api/CustomerAPIEndpoint";
import { workshopService } from "../api/WorkshopAPIEndpoint";

export const useCustomerData = (
	auth: any,
	selectedWorkshopId: number | null
) => {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
	const [workshops, setWorkshops] = useState<Workshop[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch workshops for admin users
	const fetchWorkshops = async () => {
		try {
			const data = await workshopService.getAllWorkshops();
			setWorkshops(data);
		} catch (err) {
			console.error("Error fetching workshops:", err);
			setError("Failed to load workshops. Please try again.");
		}
	};

	// Fetch customers based on user role
	const fetchCustomers = async () => {
		try {
			setLoading(true);
			setError(null);

			let data: Customer[] = [];
			const userRole = auth.roles?.[0];

			console.log("User role:", userRole);
			console.log("Selected workshop ID:", selectedWorkshopId);

			if (userRole === "admin") {
				if (selectedWorkshopId) {
					// Admin z wybranym warsztatem - pobierz klientów tego warsztatu
					data = await customerService.getWorkshopCustomers(selectedWorkshopId);
				} else {
					// Admin bez wybranego warsztatu - nie pokazuj klientów
					setCustomers([]);
					setFilteredCustomers([]);
					setLoading(false);
					return;
				}
			} else if (userRole === "mechanic" || userRole === "owner") {
				// Mechanik i właściciel - pobierz klientów z ich warsztatu
				// Backend automatycznie sprawdzi warsztat użytkownika przez pojazdy
				data = await customerService.getAllCustomers();
			} else {
				// Inne role - brak dostępu
				data = [];
			}

			console.log("Fetched customers:", data);
			setCustomers(data);
			setFilteredCustomers(data);
		} catch (err: any) {
			console.error("Error fetching customers:", err);
			setError("Failed to load customers. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Fetch workshops on mount for admin
	useEffect(() => {
		if (auth.roles?.[0] === "admin") {
			fetchWorkshops();
		}
	}, [auth.roles]);

	// Fetch customers when role changes or workshop selection changes
	useEffect(() => {
		if (auth.roles?.[0] !== "admin" || selectedWorkshopId) {
			fetchCustomers();
		}
	}, [auth.roles, selectedWorkshopId]);

	return {
		customers,
		filteredCustomers,
		workshops,
		loading,
		error,
		setCustomers,
		setFilteredCustomers,
		fetchCustomers,
		fetchWorkshops,
	};
};
