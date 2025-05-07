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

					if (tokenData.role) {
						// Jeśli rola jest w tokenie, zapisz ją w localStorage
						localStorage.setItem("userRole", tokenData.role);
						localStorage.setItem("userID", tokenData.user_id.toString());
						setIsLoading(false);
					} else {
						// Jeśli rola nie jest w tokenie, pobierz dane użytkownika z backendu
						const response = await axios.get(
							`${BASE_API_URL}/user/${tokenData.user_id}`,
							{
								headers: {
									Authorization: `Bearer ${token}`,
								},
							}
						);
						const userDetails = response.data;

						if (userDetails.role) {
							localStorage.setItem("userRole", userDetails.role);
							localStorage.setItem("userID", userDetails.id.toString());
							setIsLoading(false);
						} else {
							throw new Error("Role not found in user details.");
						}
					}
				} catch (e) {
					console.error("Invalid token or user details:", e);
					localStorage.removeItem("userRole");
					localStorage.removeItem("token");
					navigate("/login", { replace: true });
				}
			} else {
				navigate("/login", { replace: true });
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
