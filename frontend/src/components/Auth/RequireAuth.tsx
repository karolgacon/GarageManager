import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { CustomJwtPayload } from "../../authorization/CustomJwtPayload.tsx";
import axios from "axios";
import { BASE_API_URL } from "../../constants";

const RequireAuth = ({ requiredRole }) => {
    const location = useLocation();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            try {
                const tokenData = jwtDecode<CustomJwtPayload>(token);
                // Zapisz rolę w localStorage
                if (tokenData.role) {
                    localStorage.setItem("userRole", tokenData.role);
                } else {
                    const fetchUserRole = async () => {
                        try {
                            const response = await axios.get(`${BASE_API_URL}/users/${tokenData.user_id}`);
                            const role = response.data.role;
                            localStorage.setItem("userRole", role);
                        } catch (error) {
                            console.error("Error fetching user data:", error);
                            localStorage.removeItem("userRole"); // Usuń rolę, jeśli wystąpił błąd
                        }
                    };

                    fetchUserRole();
                }
            } catch (e) {
                console.error("Invalid token:", e);
                localStorage.removeItem("userRole"); // Usuń rolę, jeśli token jest niepoprawny
            }
        }
    }, [token]);

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
