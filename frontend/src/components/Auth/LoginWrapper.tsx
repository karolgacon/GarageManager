import { useState, forwardRef, useImperativeHandle, useContext } from "react";
import axios from "axios";
import { BASE_API_URL } from "../../constants";
import { Box, Typography } from "@mui/material";
import useStyles from "./LoginWrapper.styles.ts";
import LeftImage from './LeftImage';
import AuthContext from "../../context/AuthProvider";
import { setAuthHeader } from "../../authorization/authServices";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "../../authorization/CustomJwtPayload";

import RenderDefaultView from "./RenderDefaultView";
export interface LoginWrapperHandle {
    triggerPendingAction: () => void;
}

interface LoginWrapperProps {}

const LoginWrapper = forwardRef<LoginWrapperHandle, LoginWrapperProps>((props, ref) => {
    const classes = useStyles();
    const [currentView, setCurrentView] = useState("default");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { setAuth } = useContext(AuthContext);

    const handleSignIn = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post(`${BASE_API_URL}/api/login`, {
                email,
                password
            });

            const data = res.data;
            const jwtToken = data.token;

            // Zapisz token w localStorage
            setAuthHeader(jwtToken);

            // Dekoduj token, aby pobrać dane użytkownika
            const decoded = jwtDecode<CustomJwtPayload>(jwtToken);

            // Aktualizuj kontekst autentykacji
            setAuth({
                token: jwtToken,
                roles: [decoded.role],
                username: decoded.username
            });

            // Przekieruj użytkownika na odpowiednią stronę
            if (!decoded.is_active) {
                window.location.href = '/notVerified';
            } else if (decoded.role === 'admin') {
                window.location.href = '/adminPanel';
            } else {
                window.location.href = '/';
            }
        } catch (err: any) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleError = (err: any) => {
        if (axios.isAxiosError(err) && err.response) {
            const backendError = err.response.data?.error || err.response.data?.message;
            setError(backendError || 'Wystąpił błąd podczas logowania.');
        } else {
            setError('Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.');
        }
    };

    useImperativeHandle(ref, () => ({
        triggerPendingAction: () => {
            // Można zaimplementować ponowną próbę logowania, jeśli jest taka potrzeba
        }
    }));

    return (
        <div className={classes.container}>
            <div style={{ position: "absolute", top: "24px", left: "24px" }}>
                <LeftImage />
            </div>

            {currentView === "default" && (
                <RenderDefaultView
                    handleSignIn={handleSignIn}
                    setCurrentView={setCurrentView}
                />
            )}

            {/*{currentView === "owner" && (*/}
            {/*    <RenderOwnerView handleBack={() => setCurrentView("default")} />*/}
            {/*)}*/}

            {/*{currentView === "member" && (*/}
            {/*    <RenderMemberView handleBack={() => setCurrentView("default")} />*/}
            {/*)}*/}

            {loading && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography>Trwa logowanie...</Typography>
                </Box>
            )}

            {error && <div className={classes.errorMessage}>{error}</div>}
        </div>
    );
});

export default LoginWrapper;