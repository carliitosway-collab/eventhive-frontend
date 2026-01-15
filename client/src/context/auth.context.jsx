import { createContext, useEffect, useState } from "react";
import authService from "../services/auth.service";

const AuthContext = createContext();

function AuthProviderWrapper({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const storeToken = (token) => localStorage.setItem("authToken", token);
  const removeToken = () => localStorage.removeItem("authToken");

  const authenticateUser = () => {
    setIsLoading(true);

    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) {
      setIsLoggedIn(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    authService
      .verify()
      .then((response) => {
        setIsLoggedIn(true);
        setUser(response.data); // payload del token (tu backend devuelve req.payload)
        setIsLoading(false);
      })
      .catch(() => {
        // token inválido/expirado
        setIsLoggedIn(false);
        setUser(null);
        setIsLoading(false);
      });
  };

  const logOutUser = () => {
    removeToken();
    authenticateUser();
  };

  useEffect(() => {
    authenticateUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        storeToken,
        authenticateUser,
        logOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProviderWrapper, AuthContext };
