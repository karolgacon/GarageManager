import React, { useEffect } from "react";
import CustomerDetailDialog from "./CustomerDetailDialog";
import AddCustomerModal from "./AddCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import DeleteCustomerDialog from "./DeleteCustomerDialog";
import { Customer } from "../../models/CustomerModel";

interface ModalStates {
	detail: boolean;
	add: boolean;
	edit: boolean;
	delete: boolean;
}

interface CustomerModalsProps {
	modalStates: ModalStates;
	selectedCustomer: Customer | null;
	userRole: string;
	workshopId?: number | null;
	onClose: (modal: keyof ModalStates) => void;
	onCustomerAdded: (customer: Customer) => void;
	onCustomerUpdated: (customer: Customer) => void;
	onConfirmDelete: () => void;
}

const CustomerModals: React.FC<CustomerModalsProps> = ({
	modalStates,
	selectedCustomer,
	userRole,
	workshopId,
	onClose,
	onCustomerAdded,
	onCustomerUpdated,
	onConfirmDelete,
}) => {
	useEffect(() => {
		if (modalStates.edit && modalStates.detail) {
			onClose("detail");
		}
	}, [modalStates.edit, modalStates.detail, onClose]);

	return (
		<>
			<CustomerDetailDialog
				open={modalStates.detail}
				onClose={() => onClose("detail")}
				customer={selectedCustomer}
				userRole={userRole}
			/>

			<AddCustomerModal
				open={modalStates.add}
				onClose={() => onClose("add")}
				onCustomerAdded={onCustomerAdded}
				userRole={userRole}
				currentWorkshopId={workshopId}
			/>

			<EditCustomerModal
				open={modalStates.edit}
				onClose={() => onClose("edit")}
				customer={selectedCustomer}
				onCustomerUpdated={onCustomerUpdated}
				userRole={userRole}
				currentWorkshopId={workshopId}
			/>

			<DeleteCustomerDialog
				open={modalStates.delete}
				onClose={() => onClose("delete")}
				customer={selectedCustomer}
				onConfirm={onConfirmDelete}
			/>
		</>
	);
};

export default CustomerModals;
