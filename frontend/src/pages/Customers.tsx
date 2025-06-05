import React, { useState, useEffect, useContext } from "react";
import { Box, Container, Typography } from "@mui/material";
import Mainlayout from "../components/Mainlayout/Mainlayout";
import CustomerHeader from "../components/Customer/CustomerHeader";
import WorkshopSelector from "../components/Common/WorkshopSelector";
import CustomerTabs from "../components/Customer/CustomerTabs";
import CustomerFilters from "../components/Customer/CustomerFilters";
import CustomerList from "../components/Customer/CustomerList";
import CustomerModals from "../components/Customer/CustomerModals";
import CustomSnackbar, {
	SnackbarState,
} from "../components/Mainlayout/Snackbar";
import AuthContext from "../context/AuthProvider";
import { useCustomerData } from "../hooks/useCustomerData";
import { useCustomerActions } from "../hooks/useCustomerActions";

const Customers: React.FC = () => {
	const { auth } = useContext(AuthContext);
	const [activeTab, setActiveTab] = useState<string>("all");
	const [selectedWorkshopId, setSelectedWorkshopId] = useState<number | null>(
		null
	);

	const {
		customers,
		filteredCustomers,
		workshops,
		loading,
		error,
		setFilteredCustomers,
		fetchCustomers,
		fetchWorkshops,
	} = useCustomerData(auth, selectedWorkshopId);

	const {
		snackbar,
		selectedCustomer,
		modalStates,
		handleViewCustomer,
		handleEditCustomer,
		handleDeleteCustomer,
		handleCustomerAdded,
		handleCustomerUpdated,
		confirmDeleteCustomer,
		setModalState,
		handleSnackbarClose,
	} = useCustomerActions(customers, setFilteredCustomers);

	const hasPermission = () => {
		const userRole = auth.roles?.[0];
		return ["admin", "owner", "mechanic"].includes(userRole || "");
	};

	const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
		setActiveTab(newValue);

		if (newValue === "all") {
			setFilteredCustomers(customers);
		} else if (newValue === "active") {
			const activeCustomers = customers.filter(
				(customer) => customer.status === "active"
			);
			setFilteredCustomers(activeCustomers);
		} else if (newValue === "vip") {
			const vipCustomers = customers.filter(
				(customer) => customer.loyalty_points && customer.loyalty_points > 100
			);
			setFilteredCustomers(vipCustomers);
		}
	};

	const handleWorkshopChange = (workshopId: number) => {
		setSelectedWorkshopId(workshopId);
	};

	const handleFilterChange = (filters: any) => {
		const { searchTerm, status, loyaltyLevel } = filters;

		const filtered = customers.filter((customer) => {
			const matchesSearch =
				searchTerm === "" ||
				customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				customer.username.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesStatus = status === "" || customer.status === status;

			const matchesLoyalty =
				loyaltyLevel === "" ||
				(loyaltyLevel === "vip" &&
					customer.loyalty_points &&
					customer.loyalty_points > 100) ||
				(loyaltyLevel === "regular" &&
					(!customer.loyalty_points || customer.loyalty_points <= 100));

			return matchesSearch && matchesStatus && matchesLoyalty;
		});

		setFilteredCustomers(filtered);
	};

	if (!hasPermission()) {
		return (
			<Mainlayout>
				<Container maxWidth="xl">
					<Box sx={{ py: 3, textAlign: "center" }}>
						<Typography variant="h5" color="error">
							Access Denied
						</Typography>
						<Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
							You don't have permission to view this page.
						</Typography>
					</Box>
				</Container>
			</Mainlayout>
		);
	}

	return (
		<Mainlayout>
			<Container maxWidth="xl" sx={{ py: 3 }}>
				<CustomerHeader
					userRole={auth.roles?.[0]}
					selectedWorkshopId={selectedWorkshopId}
					onAddCustomer={() => setModalState("add", true)}
				/>

				{auth.roles?.[0] === "admin" && (
					<WorkshopSelector
						value={selectedWorkshopId}
						onChange={(workshopId) => {
							setSelectedWorkshopId(workshopId);
						}}
						disabled={loading}
					/>
				)}

				{(selectedWorkshopId || auth.roles?.[0] !== "admin") && (
					<>
						<CustomerTabs activeTab={activeTab} onTabChange={handleTabChange} />

						<CustomerFilters onFilterChange={handleFilterChange} />

						<CustomerList
							customers={filteredCustomers}
							loading={loading}
							error={error}
							userRole={auth.roles?.[0] || ""}
							onView={handleViewCustomer} 
							onEdit={handleEditCustomer}
							onDelete={handleDeleteCustomer}
							onRetry={fetchCustomers}
						/>
					</>
				)}
			</Container>

			<CustomerModals
				modalStates={modalStates}
				selectedCustomer={selectedCustomer}
				userRole={auth.roles?.[0] || ""}
				workshopId={selectedWorkshopId || auth.workshopId}
				onClose={(modal) => setModalState(modal, false)}
				onCustomerAdded={handleCustomerAdded}
				onCustomerUpdated={handleCustomerUpdated}
				onConfirmDelete={confirmDeleteCustomer}
			/>

			<CustomSnackbar snackbarState={snackbar} onClose={handleSnackbarClose} />
		</Mainlayout>
	);
};

export default Customers;
