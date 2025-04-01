import {jwtDecode} from "jwt-decode";
import {Navigate, Outlet, useLocation} from "react-router-dom";
import {CustomJwtPayload} from "../../authorization/CustomJwtPayload.tsx";

const RequireAuth = ({ requiredRole }) => {
    const location = useLocation();
    const token = localStorage.getItem("token");

    const userHasAccess = () => {
        if (!token) return false;

        const tokenData = jwtDecode<CustomJwtPayload>(token);

        return Array.isArray(requiredRole)
            ? requiredRole.includes(tokenData.role)
            : tokenData.role === requiredRole
    };

    return (
        userHasAccess() ? (
            <Outlet />
        ) : (
            <Navigate to="/login" state={{ from: location }} replace />
        )
    );
};

export default RequireAuth;