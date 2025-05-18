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
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [auth, setAuth] = useState<IAuth>(() => {
		const savedToken = window.localStorage.getItem("token");
		const savedRole = window.localStorage.getItem("userRole");
		const savedUsername = window.localStorage.getItem("username");
		if (savedToken && savedRole) {
			return {
				token: savedToken,
				roles: [savedRole],
				username: savedUsername || "",
			};
		}
		return {};
	});
	const navigate = useNavigate();

	useEffect(() => {
		if (auth?.token) {
			window.localStorage.setItem("token", auth.token);
			if (auth.roles?.[0]) {
				window.localStorage.setItem("userRole", auth.roles[0]);
			}
			if (auth.username) {
				window.localStorage.setItem("username", auth.username);
			}
		} else {
			window.localStorage.removeItem("token");
			window.localStorage.removeItem("userRole");
			window.localStorage.removeItem("username");
		}
	}, [auth]);

	const logout = () => {
		setAuth({});
		window.localStorage.clear();
		navigate("/login", { replace: true });
	};

	const isAdmin = () => auth.roles?.includes("admin") || false;
	const isOwner = () => auth.roles?.includes("owner") || false;
	const isMechanic = () => auth.roles?.includes("mechanic") || false;
	const isClient = () => auth.roles?.includes("client") || false;

	return (
		<AuthContext.Provider
			value={{ auth, setAuth, logout, isAdmin, isOwner, isMechanic, isClient }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
