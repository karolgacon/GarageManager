import React from "react";
import {
	Grid,
	Paper,
	Typography,
	CircularProgress,
	Alert,
	Button,
	Box,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CustomerCard from "./CustomerCard";
import { Customer } from "../../models/CustomerModel";

interface CustomerListProps {
	customers: Customer[];
	loading: boolean;
	error: string | null;
	userRole: string;
	onView: (customer: Customer) => void;
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
	onRetry: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
	customers,
	loading,
	error,
	userRole,
	onView,
	onEdit,
	onDelete,
	onRetry,
}) => {
	if (loading) {
		return (
			<Box sx={{ textAlign: "center", py: 5 }}>
				<CircularProgress color="error" />
			</Box>
		);
	}

	if (error) {
		return (
			<Alert
				severity="error"
				sx={{ mb: 2 }}
				action={
					<Button color="inherit" size="small" onClick={onRetry}>
						Retry
					</Button>
				}
			>
				{error}
			</Alert>
		);
	}

	if (customers.length === 0) {
		return (
			<Paper sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
				<PersonIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
				<Typography variant="h6" color="text.secondary">
					No customers found
				</Typography>
				<Typography variant="body2" color="text.secondary">
					No customers match your current criteria.
				</Typography>
			</Paper>
		);
	}

	return (
		<Grid container spacing={3} sx={{ width: "100%", m: 0 }}>
			{customers.map((customer) => (
				<Grid
					item
					key={customer.id}
					xs={12}
					sm={6}
					md={4}
					lg={3}
					sx={{ px: { xs: 1, md: 2 } }}
				>
					<CustomerCard
						customer={customer}
						onView={onView} 
						onEdit={onEdit}
						onDelete={onDelete}
						userRole={userRole}
					/>
				</Grid>
			))}
		</Grid>
	);
};

export default CustomerList;
