import React, { useState, useEffect } from "react";
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
    Typography,
    Alert,
    CircularProgress,
} from "@mui/material";
import { customerService } from "../../api/CustomerAPIEndpoint";
import { Customer } from "../../models/CustomerModel";

interface EditCustomerModalProps {
    open: boolean;
    onClose: () => void;
    customer: Customer | null;
    onCustomerUpdated: (customer: Customer) => void;
    userRole?: string;
    currentWorkshopId?: number | null;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
    open,
    onClose,
    customer,
    onCustomerUpdated,
    userRole,
    currentWorkshopId,
}) => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        role: "client",
        status: "active",
        phone: "",
        address: "",
        preferred_contact_method: "email",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update form data when customer changes
    useEffect(() => {
        if (customer) {
            setFormData({
                username: customer.username || "",
                email: customer.email || "",
                first_name: customer.first_name || "",
                last_name: customer.last_name || "",
                role: customer.role || "client",
                status: customer.status || "active",
                phone: customer.profile?.phone || "",
                address: customer.profile?.address || "",
                preferred_contact_method: customer.profile?.preferred_contact_method || "email",
            });
        }
    }, [customer]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async () => {
        if (!customer) return;

        try {
            setLoading(true);
            setError(null);

            // Validate required fields
            if (!formData.username || !formData.email || !formData.first_name || !formData.last_name) {
                setError("Please fill in all required fields");
                return;
            }

            // Prepare update data
            const updateData = {
                username: formData.username,
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                role: formData.role,
                status: formData.status,
                profile: {
                    ...customer.profile,
                    phone: formData.phone,
                    address: formData.address,
                    preferred_contact_method: formData.preferred_contact_method,
                },
            };

            const updatedCustomer = await customerService.updateCustomer(customer.id, updateData);
            onCustomerUpdated(updatedCustomer);
            handleClose();
        } catch (err: any) {
            console.error("Error updating customer:", err);
            setError(err.response?.data?.message || "Failed to update customer");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError(null);
        onClose();
    };

    if (!customer) return null;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography variant="h5" fontWeight="bold">
                    Edit Customer
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
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={formData.role}
                                label="Role"
                                onChange={(e) => handleInputChange("role", e.target.value)}
                                disabled={userRole !== "admin"}
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

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                label="Status"
                                onChange={(e) => handleInputChange("status", e.target.value)}
                                disabled={userRole === "mechanic"}
                            >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="blocked">Blocked</MenuItem>
                                <MenuItem value="suspended">Suspended</MenuItem>
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
                    {loading ? <CircularProgress size={20} /> : "Update Customer"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditCustomerModal;