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
import RenderRegisterView from "./RenderRegisterView";

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
    const {setAuth} = useContext(AuthContext);

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

            // Save token to localStorage
            setAuthHeader(jwtToken);

            // Decode token to get user data
            const decoded = jwtDecode<CustomJwtPayload>(jwtToken);

            // Update authentication context
            setAuth({
                token: jwtToken,
                roles: [decoded.role],
                username: decoded.username
            });

            // Redirect based on account status and role
            if (!decoded.is_active) {
                window.location.href = '/notVerified';
            } else {
                redirectBasedOnRole(decoded.role);
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

    const handleRegistration = async (userData: any, role: string) => {
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post(`${BASE_API_URL}/api/register`, {
                ...userData,
                role
            });

            const data = res.data;
            const jwtToken = data.token;

            // Save token to localStorage
            setAuthHeader(jwtToken);

            // Decode token to get user data
            const decoded = jwtDecode<CustomJwtPayload>(jwtToken);

            // Update authentication context
            setAuth({
                token: jwtToken,
                roles: [decoded.role],
                username: decoded.username
            });

            // Redirect based on user role
            redirectBasedOnRole(decoded.role);

        } catch (err: any) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

// Add this function to handle redirections
    const redirectBasedOnRole = (role: string) => {
        switch (role) {
            case 'admin':
                window.location.href = '/adminDashboard';
                break;
            case 'owner':
                window.location.href = '/ownerDashboard';
                break;
            case 'mechanic':
                window.location.href = '/mechanicDashboard';
                break;
            case 'client':
            default:
                window.location.href = '/clientDashboard';
                break;
        }
    };

    return (
        <div className={classes.container}>
            <div style={{position: "absolute", top: "24px", left: "24px"}}>
                <LeftImage/>
            </div>

            {currentView === "default" && (
                <RenderDefaultView
                    handleSignIn={handleSignIn}
                    setCurrentView={setCurrentView}
                />
            )}

            {currentView === "register" && (
                <RenderRegisterView
                    handleRegistration={handleRegistration}
                    handleBack={() => setCurrentView("default")}
                />
            )}

            {/* Other views... */}

            {loading && (
                <Box sx={{mt: 2, textAlign: 'center'}}>
                    <Typography>Trwa przetwarzanie...</Typography>
                </Box>
            )}

            {error && <div className={classes.errorMessage}>{error}</div>}
        </div>
    );
});

export default LoginWrapper;