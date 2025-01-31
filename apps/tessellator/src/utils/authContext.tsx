import React, {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loginUser, updateToken } from "core";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

import { AnalyserProvider } from "./analyserContext";
import { PlayerProvider } from "./playerContext";
import { useLoader } from "./loaderContext";

type AuthProviderProps = {
  isLoading?: boolean;
  accessToken?: string;
  refreshToken?: string;
  handleRefreshToken?: (refreshPage?: boolean) => Promise<void>;
  children: ReactNode;
};

const AuthContext = createContext({
  isLoading: false,
  accessToken: "",
  refreshToken: "",
  handleRefreshToken: async (refreshPage?: boolean) => {
    return;
  },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: FC<AuthProviderProps> = ({
  children,
}: {
  children: ReactNode;
}) => {
  const router = useRouter();
  const { isLoading, setIsLoading } = useLoader();
  const [tokens, setTokens] = useState({ accessToken: "", refreshToken: "" });

  const logoutUser = useCallback(() => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    setTokens({ accessToken: "", refreshToken: "" });
    router.push("/");
  }, [router]);

  const handleRefreshToken = useCallback(
    async (refreshPage = false) => {
      try {
        const { accessToken } = await updateToken(tokens.refreshToken);
        setTokens((prev) => ({ ...prev, accessToken }));
        Cookies.set("accessToken", accessToken);
        setIsLoading(false);
        if (refreshPage) {
          window.location.reload(); // might make sense here
        }
      } catch (e) {
        logoutUser();
      }
    },
    [logoutUser, tokens?.refreshToken]
  );

  useEffect(() => {
    setIsLoading(true, "Authenticating user");
    const { accessToken, refreshToken } = getTokens();

    if (accessToken && refreshToken) {
      setTokens({
        accessToken,
        refreshToken,
      });
      setIsLoading(false);
      return;
    }

    if (refreshToken) {
      handleRefreshToken();
      return;
    }

    setIsLoading(false);
    router.push("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      loginUser,
      isLoading,
      logoutUser,
      handleRefreshToken,
    }),
    [
      isLoading,
      logoutUser,
      handleRefreshToken,
      tokens?.accessToken,
      tokens?.refreshToken,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {value.accessToken && router.pathname !== "/" ? ( // TODO: decouple
        <PlayerProvider>
          <AnalyserProvider>{children}</AnalyserProvider>
        </PlayerProvider>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

function getTokens() {
  function getTokenFromCookies(key: string) {
    const token = Cookies.get(key);

    return !!token && token !== "undefined" ? token : null;
  }
  const accessToken = getTokenFromCookies("accessToken");
  const refreshToken = getTokenFromCookies("refreshToken");

  return {
    accessToken,
    refreshToken,
  };
}
