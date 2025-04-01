import React, {createContext, useState} from "react";

interface IAuthContext {
    auth: IAuth;
    setAuth: React.Dispatch<React.SetStateAction<IAuth>>;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

interface IAuth {
    token?: string;
    roles?:string[];
    username?:string;
}
export const AuthProvider = ({children}) => {
    const [auth, setAuth] = useState<IAuth>({});

    return (
        <AuthContext.Provider value={{auth, setAuth}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;