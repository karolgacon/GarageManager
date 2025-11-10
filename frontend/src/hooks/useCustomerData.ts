import { useState, useEffect } from "react";
import { customerService } from "../api/CustomerAPIEndpoint";
import { workshopService } from "../api/WorkshopAPIEndpoint";

export const useCustomerData = (
	auth: any,
	selectedWorkshopId: number | null
) => {
	const [customers, setCustomers] = useState<any[]>([]);
	const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
	const [workshops, setWorkshops] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchCustomers = async () => {
		try {
			setLoading(true);
			setError(null);

			let data: any[] = [];
			const userRole = auth.roles?.[0];

			if (userRole === "admin" && !selectedWorkshopId) {
				data = await customerService.getAllCustomers();
			} else if (selectedWorkshopId) {
				data = await customerService.getWorkshopCustomers(selectedWorkshopId);
			} else if (userRole === "owner") {
				// Owner should see customers from their workshop
				try {
					const workshop = await workshopService.getCurrentUserWorkshop();
					if (workshop?.id) {
						data = await customerService.getWorkshopCustomers(workshop.id);
					} else {
						data = [];
						setError("Workshop information not available");
					}
				} catch {
					data = [];
					setError("Failed to load workshop information");
				}
			} else if (userRole === "mechanic") {
				// For mechanic, try to get workshop info (if available)
				try {
					const workshop = await workshopService.getCurrentUserWorkshop();
					if (workshop?.id) {
						data = await customerService.getWorkshopCustomers(workshop.id);
					} else {
						data = [];
					}
				} catch {
					data = [];
				}
			} else {
				setCustomers([]);
				setFilteredCustomers([]);
				return;
			}

			setCustomers(data);
			setFilteredCustomers(data);
		} catch (err) {
			setError("Failed to load customers");
		} finally {
			setLoading(false);
		}
	};

	const fetchWorkshops = async () => {
		try {
			if (auth.roles?.[0] !== "admin") {
				return;
			}

			const data = await workshopService.getAllWorkshops();
			setWorkshops(data || []);
		} catch (err) {
			setWorkshops([]);
		}
	};

	useEffect(() => {
		// Fetch customers when auth is available or workshop selection changes
		if (auth.user_id && auth.roles?.[0]) {
			const userRole = auth.roles[0];
			if (
				userRole === "admin" ||
				userRole === "owner" ||
				userRole === "mechanic" ||
				selectedWorkshopId
			) {
				fetchCustomers();
			}
		}
	}, [auth.user_id, auth.roles, selectedWorkshopId]);

	useEffect(() => {
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
