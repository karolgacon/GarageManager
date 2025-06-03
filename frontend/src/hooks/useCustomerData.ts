import { useState, useEffect } from "react";
import { customerService } from "../api/CustomerAPIEndpoint";
import { workshopService } from "../api/WorkshopAPIEndpoint";

export const useCustomerData = (
	auth: any,
	selectedWorkshopId: number | null
) => {
	const [customers, setCustomers] = useState<any[]>([]);
	const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
	const [workshops, setWorkshops] = useState<any[]>([]); // Initialize as empty array, not undefined
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchCustomers = async () => {
		try {
			setLoading(true);
			setError(null);

			let data;
			if (auth.roles?.[0] === "admin" && !selectedWorkshopId) {
				data = await customerService.getAllCustomers();
			} else if (selectedWorkshopId) {
				data = await customerService.getWorkshopCustomers(selectedWorkshopId);
			} else if (auth.workshop_id) {
				data = await customerService.getWorkshopCustomers(auth.workshop_id);
			} else {
				console.error("No workshop ID available to fetch customers");
				setCustomers([]);
				setFilteredCustomers([]);
				return;
			}

			setCustomers(data);
			setFilteredCustomers(data);
		} catch (err) {
			console.error("Error fetching customers:", err);
			setError("Failed to load customers");
		} finally {
			setLoading(false);
		}
	};

	const fetchWorkshops = async () => {
		try {
			console.log("Fetching workshops...");
			if (auth.roles?.[0] !== "admin") {
				console.log("Non-admin user, not fetching workshops");
				return; // Non-admin doesn't need workshop list
			}

			const data = await workshopService.getAllWorkshops();
			console.log("Workshops fetched:", data);
			setWorkshops(data || []); // Ensure we set an empty array if data is null/undefined
		} catch (err) {
			console.error("Error fetching workshops:", err);
			// Don't set error state here, as workshops are optional
			setWorkshops([]); // Set empty array on error
		}
	};

	useEffect(() => {
		// Only fetch customers if we have the necessary info
		if (
			auth.user_id &&
			(auth.roles?.[0] === "admin" || auth.workshop_id || selectedWorkshopId)
		) {
			fetchCustomers();
		}
	}, [auth.user_id, auth.roles, auth.workshop_id, selectedWorkshopId]);

	useEffect(() => {
		// Always try to fetch workshops for admin users
		if (auth.user_id && auth.roles?.[0] === "admin") {
			fetchWorkshops();
		}
	}, [auth.user_id, auth.roles]);

	return {
		customers,
		filteredCustomers,
		workshops,
		loading,
		error,
		setFilteredCustomers,
		fetchCustomers,
		fetchWorkshops,
	};
};
