import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { generateRandomInteger } from "core";
import { Loader } from "ui";

type LoaderProviderProps = {
  isLoading?: boolean;
  setIsLoading?: (flag: boolean) => void;
  children: ReactNode;
};

const LoaderContext = createContext({
  isLoading: false,
  setIsLoading: (flag: boolean, message?: string) => {
    return;
  },
});

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider: FC<LoaderProviderProps> = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const value = useMemo(
    () => ({
      isLoading,
      setIsLoading: (flag: boolean, message = "") => {
        setIsLoading(flag);
        setLoadingMessage(flag ? message : "");
      },
    }),
    [isLoading, setIsLoading]
  );

  return (
    <LoaderContext.Provider value={value}>
      {isLoading ? (
        <Loader
          message={loadingMessage}
          dotVariant={generateRandomInteger(0, 11)}
        />
      ) : null}
      {children}
    </LoaderContext.Provider>
  );
};
