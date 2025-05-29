import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Avatar,
    CircularProgress,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import WarningIcon from "@mui/icons-material/Warning";
import { Customer } from "../../models/CustomerModel";

interface DeleteCustomerDialogProps {
    open: boolean;
    onClose: () => void;
    customer: Customer | null;
    onConfirm: () => void;
    loading?: boolean;
}

const DeleteCustomerDialog: React.FC<DeleteCustomerDialogProps> = ({
    open,
    onClose,
    customer,
    onConfirm,
    loading = false,
}) => {
    if (!customer) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <WarningIcon color="error" />
                    <Typography variant="h6" fontWeight="bold">
                        Delete Customer
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ textAlign: "center", py: 2 }}>
                    <Avatar
                        src={customer.profile?.photo}
                        sx={{ 
                            width: 80, 
                            height: 80, 
                            bgcolor: "#ff3c4e", 
                            margin: "0 auto",
                            mb: 2 
                        }}
                    >
                        {!customer.profile?.photo && <PersonIcon sx={{ color: "white", fontSize: 40 }} />}
                    </Avatar>

                    <Typography variant="h6" gutterBottom>
                        {customer.first_name} {customer.last_name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        @{customer.username} • {customer.email}
                    </Typography>

                    <Typography variant="body1" sx={{ mt: 3, mb: 2 }}>
                        Are you sure you want to delete this customer?
                    </Typography>

                    <Typography variant="body2" color="error">
                        <strong>Warning:</strong> This action cannot be undone. All customer data, 
                        including their vehicles, appointments, and history will be permanently deleted.
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button 
                    onClick={onConfirm} 
                    variant="contained"
                    color="error"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    {loading ? "Deleting..." : "Delete Customer"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteCustomerDialog;