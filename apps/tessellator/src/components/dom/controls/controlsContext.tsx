import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { generateRandomInteger } from "core";

import { useKeys } from "./useKeys";

export const modeMap = [
  { key: "0", value: 0 },
  { key: "1", value: 1 },
  { key: "2", value: 2 },
  { key: "3", value: 3 },
];

const colourMap = [
  { key: "q", value: 0 },
  { key: "a", value: 1 },
  { key: "z", value: 2 },
  { key: "w", value: 3 },
];

type ControlsProviderProps = {
  children: ReactNode;
  modes?: number[];
  modeKey?: number;
  colourKey?: number;
  addMode?: (mode: number) => void;
  removeMode?: (mode: number) => void;
  changeColourMode: () => void;
  changeMode: () => void;
};

const ControlsContext = createContext({
  modes: [0],
  modeKey: 0,
  colourKey: 0,
  randomizeMode: true,
  randomizeColourMode: true,
  addMode: (value: number) => {
    return;
  },
  removeMode: (value: number) => {
    return;
  },
  changeColourMode: () => {
    return;
  },
  changeMode: () => {
    return;
  },
  setRandomizeMode: (value: boolean) => {
    return;
  },
  setRandomizeColourMode: (value: boolean) => {
    return;
  },
});

export const useControls = () => useContext(ControlsContext);

export const ControlsProvider = ({ children }: { children: ReactNode }) => {
  const [modes, setModes] = useState(
    modeMap.reduce((acc, curr) => {
      acc.push(curr.value);
      return acc;
    }, [] as number[])
  );

  const [modeKey, setModeKey] = useState(0);
  const [randomizeMode, setRandomizeMode] = useState(true);
  const [colourKey, setColourKey] = useState(0);
  const [randomizeColourMode, setRandomizeColourMode] = useState(true);

  useKeys([
    ...modeMap.map(({ key, value }) => ({
      keys: [key],
      fn: () => setModeKey(value),
    })),
    ...colourMap.map(({ key, value }) => ({
      keys: [key],
      fn: () => setColourKey(value),
    })),
  ]);

  const value = useMemo(
    () => ({
      modes,
      modeKey,
      colourKey,
      addMode: (mode: number) => {
        if (modes.includes(mode)) {
          return;
        }
        setModes((prevState) => [...prevState, mode]);
      },
      removeMode: (mode: number) => {
        setModes((prevState) => {
          const index = prevState.findIndex((val) => val === mode);
          if (index >= 0) {
            prevState.splice(index, 1);
            return prevState;
          }
          return prevState;
        });
      },
      changeMode: () => {
        const index = generateRandomInteger(0, modes.length - 1);
        setModeKey(modes[index]);
      },
      changeColourMode: () => {
        setColourKey(generateRandomInteger(0, colourMap.length - 1));
      },
      randomizeMode,
      randomizeColourMode,
      setRandomizeMode: (value: boolean) => setRandomizeMode(value),
      setRandomizeColourMode: (value: boolean) => setRandomizeColourMode(value),
    }),
    [
      modes,
      colourKey,
      modeKey,
      setModes,
      randomizeMode,
      setRandomizeMode,
      randomizeColourMode,
      setRandomizeColourMode,
    ]
  );

  return (
    <ControlsContext.Provider value={value}>
      {children}
    </ControlsContext.Provider>
  );
};
