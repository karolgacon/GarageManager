import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface IAuthContext {
	auth: IAuth;
	setAuth: React.Dispatch<React.SetStateAction<IAuth>>;
	logout: () => void;
	isAdmin: () => boolean;
	isOwner: () => boolean;
	isMechanic: () => boolean;
	isClient: () => boolean;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

interface IAuth {
	token?: string;
	roles?: string[];
	username?: string;
	is_active?: boolean;
	user_id?: number;
	isLoading?: boolean;
}

function parseJwt(token: string) {
	try {
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map(function (c) {
					return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
				})
				.join("")
		);
		return JSON.parse(jsonPayload);
	} catch (e) {
		return null;
	}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [auth, setAuth] = useState<IAuth>(() => {
		return { isLoading: true };
	});
	const navigate = useNavigate();

	useEffect(() => {
		const savedToken = window.localStorage.getItem("token");
		const savedRole = window.localStorage.getItem("userRole");
		const savedUsername = window.localStorage.getItem("username");
		const savedUserId = window.localStorage.getItem("userID");

		if (savedToken && savedRole) {
			let userId = savedUserId ? parseInt(savedUserId) : undefined;

			if (!userId && savedToken) {
				try {
					const tokenData = parseJwt(savedToken);
					userId = tokenData?.user_id;
				} catch (e) {
				}
			}

			setAuth({
				token: savedToken,
				roles: [savedRole],
				username: savedUsername || "",
				user_id: userId,
				isLoading: false,
			});
		} else {
			setAuth({ isLoading: false });
		}
	}, []);

	useEffect(() => {
		if (auth?.token) {
			window.localStorage.setItem("token", auth.token);
			if (auth.roles?.[0]) {
				window.localStorage.setItem("userRole", auth.roles[0]);
			}
			if (auth.username) {
				window.localStorage.setItem("username", auth.username);
			}
			if (auth.user_id) {
				window.localStorage.setItem("user_id", auth.user_id.toString());
			}
		} else if (!auth.isLoading) {
			window.localStorage.removeItem("token");
			window.localStorage.removeItem("userRole");
			window.localStorage.removeItem("username");
			window.localStorage.removeItem("user_id");
		}
	}, [auth]);

	const setAuthWithUserId = (newAuth: IAuth | null) => {
		if (newAuth === null) {
			setAuth({ isLoading: false });
			return;
		}

		if (newAuth.token && !newAuth.user_id) {
			try {
				const tokenData = parseJwt(newAuth.token);
				const userId = tokenData?.user_id || tokenData?.sub || tokenData?.id;
				if (userId) {
					newAuth.user_id = userId;
				}
			} catch (e) {
				
			}
		}
		setAuth(newAuth);
	};

	const logout = () => {
		setAuth({ isLoading: false });
		window.localStorage.clear();
		navigate("/login", { replace: true });
	};

	const isAdmin = () => auth.roles?.includes("admin") || false;
	const isOwner = () => auth.roles?.includes("owner") || false;
	const isMechanic = () => auth.roles?.includes("mechanic") || false;
	const isClient = () => auth.roles?.includes("client") || false;

	return (
		<AuthContext.Provider
			value={{
				auth,
				setAuth: setAuthWithUserId,
				logout,
				isAdmin,
				isOwner,
				isMechanic,
				isClient,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
