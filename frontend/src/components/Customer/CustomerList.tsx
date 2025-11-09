import React from "react";
import {
	Grid,
	Typography,
	CircularProgress,
	Alert,
	Button,
	Box,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CustomerCard from "./CustomerCard";
import { Customer } from "../../models/CustomerModel";
import {
	COLOR_PRIMARY,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
} from "../../constants";

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
				<CircularProgress sx={{ color: COLOR_PRIMARY }} />
			</Box>
		);
	}

	if (error) {
		return (
			<Alert
				severity="error"
				sx={{
					mb: 2,
					backgroundColor: COLOR_SURFACE,
					color: COLOR_TEXT_PRIMARY,
					"& .MuiAlert-icon": {
						color: "#ef4444",
					},
				}}
				action={
					<Button
						color="inherit"
						size="small"
						onClick={onRetry}
						sx={{ color: COLOR_TEXT_PRIMARY }}
					>
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
			<Box
				sx={{
					p: 4,
					textAlign: "center",
					borderRadius: 2,
					backgroundColor: COLOR_SURFACE,
				}}
			>
				<PersonIcon sx={{ fontSize: 48, color: COLOR_TEXT_SECONDARY, mb: 2 }} />
				<Typography variant="h6" sx={{ color: COLOR_TEXT_PRIMARY }}>
					No customers found
				</Typography>
				<Typography variant="body2" sx={{ color: COLOR_TEXT_SECONDARY }}>
					No customers match your current criteria.
				</Typography>
			</Box>
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
