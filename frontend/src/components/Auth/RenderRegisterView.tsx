import React, { useState } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";

interface RenderRegisterViewProps {
    handleRegistration: (userData: any, role: string) => void;
    handleBack: () => void;
}

const RenderRegisterView: React.FC<RenderRegisterViewProps> = ({
                                                                   handleRegistration,
                                                                   handleBack
                                                               }) => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        phoneNumber: ""
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        // Basic validation
        if (Object.values(formData).some(value => value === "")) {
            setError("Wszystkie pola są wymagane.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Hasła nie są identyczne.");
            return;
        }

        // Remove confirmPassword before sending to backend
        const { confirmPassword, ...userData } = formData;

        // Register with client role
        handleRegistration(userData, "client");
    };

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: "400px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "24px",
                gap: "16px",
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 500, color: "#000000", textAlign: "center" }}>
                Rejestracja nowego konta
            </Typography>

            <TextField
                label="Imię"
                name="firstName"
                variant="outlined"
                fullWidth
                value={formData.firstName}
                onChange={handleChange}
            />

            <TextField
                label="Nazwisko"
                name="lastName"
                variant="outlined"
                fullWidth
                value={formData.lastName}
                onChange={handleChange}
            />

            <TextField
                label="Email"
                name="email"
                type="email"
                variant="outlined"
                fullWidth
                value={formData.email}
                onChange={handleChange}
            />

            <TextField
                label="Numer telefonu"
                name="phoneNumber"
                variant="outlined"
                fullWidth
                value={formData.phoneNumber}
                onChange={handleChange}
            />

            <TextField
                label="Hasło"
                name="password"
                type="password"
                variant="outlined"
                fullWidth
                value={formData.password}
                onChange={handleChange}
            />

            <TextField
                label="Potwierdź hasło"
                name="confirmPassword"
                type="password"
                variant="outlined"
                fullWidth
                value={formData.confirmPassword}
                onChange={handleChange}
            />

            {error && (
                <Typography color="error" sx={{ textAlign: "center", fontSize: "14px" }}>
                    {error}
                </Typography>
            )}

            <Button
                onClick={handleSubmit}
                fullWidth
                sx={{
                    backgroundColor: "#FF2D55",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: "600",
                    height: "48px",
                    textTransform: "uppercase",
                    padding: "12px 24px",
                    borderRadius: "32px",
                    boxShadow: "0px 4px 10px rgba(255, 45, 85, 0.3)",
                    whiteSpace: "nowrap",
                    "&:hover": {
                        backgroundColor: "#E02D4D",
                    },
                }}
            >
                Zarejestruj się
            </Button>

            <Button
                onClick={handleBack}
                fullWidth
                sx={{
                    color: "#666",
                    fontSize: "13px",
                    textTransform: "none",
                }}
            >
                Powrót do logowania
            </Button>
        </Box>
    );
};

export default RenderRegisterView;