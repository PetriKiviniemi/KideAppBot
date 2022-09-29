import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Login from './Login.js'

export const AuthContext = React.createContext(null);

export const ProtectedRoute = ({children}) => {

    if (!localStorage.getItem("bearerToken")) {
        return <Navigate to="/login" replace/>
    }

    return children;
}

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate()


    const handleLogin = async (newBearerToken) => {
        //Dangerous to set the bearerToken to localstorage
        //but this app will never be hosted on a server
        localStorage.setItem("bearerToken", newBearerToken)
        navigate('/home');
    }

    const handleLogout = () => {
        localStorage.removeItem("bearerToken")
        navigate('/login');
    }

    const getBearerToken = () => {
        return localStorage.getItem("bearerToken");
    }

    const value = {
        onLogin: handleLogin,
        onLogout: handleLogout,
        getToken: getBearerToken,
    };

    return (
        <AuthContext.Provider value={value}>
          {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return React.useContext(AuthContext);
}
