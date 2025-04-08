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
import { useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();

    const handleSignIn = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post(`${BASE_API_URL}/user/login/`, {
                email,
                password
            });

            const data = res.data;
            const jwtToken = data.token;

            // Decode token to get user data
            const decoded = jwtDecode<CustomJwtPayload>(jwtToken);

            try {
                // Get user details first
                const userDetailsRes = await axios.get(`${BASE_API_URL}/users/${decoded.user_id}/`);
                const userDetails = userDetailsRes.data;

                // Set token only after we confirm user details are valid
                setAuthHeader(jwtToken);

                // Store role in localStorage
                localStorage.setItem("userRole", userDetails.role);
                localStorage.setItem("userID", decoded.user_id.toString());

                // Update authentication context
                setAuth({
                    token: jwtToken,
                    roles: [userDetails.role],
                    username: userDetails.username,
                    is_active: userDetails.is_active
                });

                // Redirect based on account status and role
                if (!userDetails.is_active) {
                    setError("Twoje konto nie zostało jeszcze aktywowane.");
                } else {
                    redirectBasedOnRole(userDetails.role);
                }
            } catch (fetchErr) {
                console.error("Error fetching user details:", fetchErr);
                setError("Nie można pobrać danych użytkownika.");
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

            // Decode token to get user data
            const decoded = jwtDecode<CustomJwtPayload>(jwtToken);

            // Set token in localStorage
            setAuthHeader(jwtToken);

            // Store role in localStorage
            localStorage.setItem("userRole", role);
            localStorage.setItem("userID", decoded.user_id.toString());

            // Update authentication context
            setAuth({
                token: jwtToken,
                roles: [role],
                username: decoded.username,
                is_active: true
            });

            // Redirect based on user role
            redirectBasedOnRole(role);

        } catch (err: any) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    // Modified to use React Router's navigate instead of window.location
    const redirectBasedOnRole = (role: string) => {
        switch (role) {
            case 'admin':
                navigate('/home');
                break;
            case 'owner':
                navigate('/ownerDashboard');
                break;
            case 'mechanic':
                navigate('/mechanicDashboard');
                break;
            case 'client':
            default:
                navigate('/home');
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