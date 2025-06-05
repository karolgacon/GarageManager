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

			let data;
			if (auth.roles?.[0] === "admin" && !selectedWorkshopId) {
				data = await customerService.getAllCustomers();
			} else if (selectedWorkshopId) {
				data = await customerService.getWorkshopCustomers(selectedWorkshopId);
			} else if (auth.workshop_id) {
				data = await customerService.getWorkshopCustomers(auth.workshop_id);
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
		
		if (
			auth.user_id &&
			(auth.roles?.[0] === "admin" || auth.workshop_id || selectedWorkshopId)
		) {
			fetchCustomers();
		}
	}, [auth.user_id, auth.roles, auth.workshop_id, selectedWorkshopId]);

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
