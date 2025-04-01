import React, { useState } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";

interface RenderDefaultViewProps {
    handleSignIn: (email: string, password: string) => void;
    setCurrentView: (view: "default" | "owner" | "admin" | "mechanic" | "client") => void;
}

const RenderDefaultView: React.FC<RenderDefaultViewProps> = ({ handleSignIn, setCurrentView }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSignInClick = () => {
        setError(null); // Resetujemy poprzednie błędy

        if (!email || !password) {
            setError("Proszę wprowadzić oba pola.");
            return;
        }

        handleSignIn(email, password);
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
                Zaloguj się:
            </Typography>

            <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
                label="Hasło"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
                <Typography color="error" sx={{ textAlign: "center", fontSize: "14px" }}>
                    {error}
                </Typography>
            )}

            <Button
                onClick={handleSignInClick}
                fullWidth
                sx={{
                    backgroundColor: "#FF2D55", // Red color
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
                Zaloguj się
            </Button>

            <Button
                onClick={() => setCurrentView("owner")}
                fullWidth
                sx={{
                    backgroundColor: "#DC143C", // Darker red color
                    color: "#fff",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    fontSize: "13px",
                    padding: "12px 24px",
                    borderRadius: "32px",
                    boxShadow: "0px 4px 10px rgba(220, 20, 60, 0.3)",
                    "&:hover": {
                        backgroundColor: "#C01030",
                    },
                }}
            >
                Zarejestruj się!
            </Button>
        </Box>
    );
};

export default RenderDefaultView;
