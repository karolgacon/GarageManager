import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Alert,
    CircularProgress,
} from "@mui/material";
import { customerService } from "../../api/CustomerAPIEndpoint";
import { Customer } from "../../models/CustomerModel";

interface AddCustomerModalProps {
    open: boolean;
    onClose: () => void;
    onCustomerAdded: (customer: Customer) => void;
    userRole?: string;
    currentWorkshopId?: number | null;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
    open,
    onClose,
    onCustomerAdded,
    userRole,
    currentWorkshopId,
}) => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        role: "client",
        phone: "",
        address: "",
        preferred_contact_method: "email",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validate required fields
            if (!formData.username || !formData.email || !formData.first_name || 
                !formData.last_name || !formData.password) {
                setError("Please fill in all required fields");
                return;
            }

            // Prepare customer data
            const customerData = {
                username: formData.username,
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                password: formData.password,
                role: formData.role,
                workshop_id: currentWorkshopId,
                profile: {
                    phone: formData.phone,
                    address: formData.address,
                    preferred_contact_method: formData.preferred_contact_method,
                },
            };

            const newCustomer = await customerService.createCustomer(customerData);
            onCustomerAdded(newCustomer);
            handleClose();
        } catch (err: any) {
            console.error("Error adding customer:", err);
            setError(err.response?.data?.message || "Failed to add customer");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            username: "",
            email: "",
            first_name: "",
            last_name: "",
            password: "",
            role: "client",
            phone: "",
            address: "",
            preferred_contact_method: "email",
        });
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography variant="h5" fontWeight="bold">
                    Add New Customer
                </Typography>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {/* Basic Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Basic Information
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Username *"
                            value={formData.username}
                            onChange={(e) => handleInputChange("username", e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Email *"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="First Name *"
                            value={formData.first_name}
                            onChange={(e) => handleInputChange("first_name", e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Last Name *"
                            value={formData.last_name}
                            onChange={(e) => handleInputChange("last_name", e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Password *"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={formData.role}
                                label="Role"
                                onChange={(e) => handleInputChange("role", e.target.value)}
                            >
                                <MenuItem value="client">Client</MenuItem>
                                {userRole === "admin" && (
                                    <>
                                        <MenuItem value="mechanic">Mechanic</MenuItem>
                                        <MenuItem value="owner">Owner</MenuItem>
                                    </>
                                )}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Contact Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Contact Information
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Preferred Contact Method</InputLabel>
                            <Select
                                value={formData.preferred_contact_method}
                                label="Preferred Contact Method"
                                onChange={(e) => handleInputChange("preferred_contact_method", e.target.value)}
                            >
                                <MenuItem value="email">Email</MenuItem>
                                <MenuItem value="phone">Phone</MenuItem>
                                <MenuItem value="sms">SMS</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Address"
                            multiline
                            rows={2}
                            value={formData.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained"
                    disabled={loading}
                    sx={{ bgcolor: "#ff3c4e", "&:hover": { bgcolor: "#d6303f" } }}
                >
                    {loading ? <CircularProgress size={20} /> : "Add Customer"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddCustomerModal;