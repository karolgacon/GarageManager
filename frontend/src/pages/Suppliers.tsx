import React, { useState } from "react";
import { Box, Container } from "@mui/material";
import SupplierList from "../components/Suppliers/SupplierList";
import SupplierForm from "../components/Suppliers/SupplierForm";

interface Supplier {
	id: number;
	name: string;
	contact_person: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	postal_code: string;
	country: string;
	website?: string;
	tax_id?: string;
	rating: number;
	delivery_time_days: number;
	minimum_order_value: number;
	payment_terms: string;
	is_active: boolean;
	created_at: string;
}

const SuppliersPage: React.FC = () => {
	const [formOpen, setFormOpen] = useState(false);
	const [selectedSupplier, setSelectedSupplier] = useState<
		Supplier | undefined
	>();
	const [formMode, setFormMode] = useState<"add" | "edit">("add");
	const [refreshKey, setRefreshKey] = useState(0);

	const handleAddSupplier = () => {
		setSelectedSupplier(undefined);
		setFormMode("add");
		setFormOpen(true);
	};

	const handleEditSupplier = (supplier: Supplier) => {
		setSelectedSupplier(supplier);
		setFormMode("edit");
		setFormOpen(true);
	};

	const handleFormSubmit = () => {
		setFormOpen(false);
		setRefreshKey((prev) => prev + 1); // Trigger refresh of supplier list
	};

	const handleFormClose = () => {
		setFormOpen(false);
		setSelectedSupplier(undefined);
	};

	return (
		<Container maxWidth="xl" sx={{ py: 3 }}>
			<Box>
				<SupplierList
					key={refreshKey}
					onAddSupplier={handleAddSupplier}
					onEditSupplier={handleEditSupplier}
				/>

				<SupplierForm
					open={formOpen}
					onClose={handleFormClose}
					onSubmit={handleFormSubmit}
					supplier={selectedSupplier}
					mode={formMode}
				/>
			</Box>
		</Container>
	);
};

export default SuppliersPage;
