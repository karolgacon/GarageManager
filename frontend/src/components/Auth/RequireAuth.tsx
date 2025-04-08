import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CustomJwtPayload } from "../../authorization/CustomJwtPayload.tsx";
import axios from "axios";
import { BASE_API_URL } from "../../constants";

const RequireAuth = ({ requiredRole }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const verifyUser = async () => {
            if (token) {
                try {
                    const tokenData = jwtDecode<CustomJwtPayload>(token);

                    // Check if role is already in the token
                    if (tokenData.role) {
                        localStorage.setItem("userRole", tokenData.role);
                        localStorage.setItem("userID", tokenData.user_id.toString());
                        setIsLoading(false);
                    } else {
                        // Fetch user role if not in token
                        try {
                            const response = await axios.get(`${BASE_API_URL}/users/${tokenData.user_id}`);
                            const role = response.data.role;
                            localStorage.setItem("userRole", role);
                            localStorage.setItem("userID", tokenData.user_id.toString());
                        } catch (error) {
                            console.error("Error fetching user data:", error);
                            localStorage.removeItem("userRole");
                        } finally {
                            setIsLoading(false);
                        }
                    }
                } catch (e) {
                    console.error("Invalid token:", e);
                    localStorage.removeItem("userRole");
                    localStorage.removeItem("token");
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        verifyUser();
    }, [token]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const userRole = localStorage.getItem("userRole");

    const userHasAccess = () => {
        if (!userRole) return false;

        return Array.isArray(requiredRole)
            ? requiredRole.includes(userRole)
            : userRole === requiredRole;
    };

    return userHasAccess() ? (
        <Outlet />
    ) : (
        <Navigate to="/login" state={{ from: location }} replace />
    );
};

export default RequireAuth;