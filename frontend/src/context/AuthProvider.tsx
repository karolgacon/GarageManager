import React, {createContext, useState, useEffect} from "react";

interface IAuthContext {
    auth: IAuth;
    setAuth: React.Dispatch<React.SetStateAction<IAuth>>;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

interface IAuth {
    token?: string;
    roles?:string[];
    username?:string;
    is_active?:boolean;
}
export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState<IAuth>(() => {
        // 🔥 Sprawdzamy, czy jest token w localStorage na starcie aplikacji
        const savedToken = window.localStorage.getItem("token");
        if (savedToken) {
            return { token: savedToken };
        }
        return {};
    });

    useEffect(() => {
        if (auth?.token) {
            window.localStorage.setItem("token", auth.token);
        } else {
            window.localStorage.removeItem("token");
        }
    }, [auth]);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;