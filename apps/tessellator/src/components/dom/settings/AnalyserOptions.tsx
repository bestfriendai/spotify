import React from "react";
import { button, folder, useControls } from "leva";
import { useEffect } from "react";
import { LocalStorageKeys } from "../../../constants";
import { useAnalyser } from "../../../utils/analyserContext";
import { defaultAnalyserOptions } from "audio-analyser";

export function AnalyserOptions() {
  const {
    analyserOptions: {
      fftSize,
      smoothingTimeConstant,
      minDecibels,
      maxDecibels,
    },
    setAnalyserOptions,
  } = useAnalyser();

  const [analyzerValues, setAnalyzerValues] = useControls(
    () => ({
      "Analyzer Options": folder({
        fftSize: {
          value: fftSize,
          options: [64, 128, 256, 512, 1024, 2048],
        },
        smoothingTimeConstant: {
          value: smoothingTimeConstant,
          min: 0.1,
          max: 1,
          step: 0.01,
        },
        minDecibels: {
          value: minDecibels,
          min: -200,
          max: maxDecibels - 1,
          step: 1,
        },
        maxDecibels: {
          value: maxDecibels,
          min: Math.max(minDecibels + 1, -80),
          max: 0,
          step: 1,
        },
        reset: button(() =>
          setAnalyzerValues({
            fftSize: defaultAnalyserOptions.fftSize,
            smoothingTimeConstant: defaultAnalyserOptions.smoothingTimeConstant,
            minDecibels: defaultAnalyserOptions.minDecibels,
            maxDecibels: defaultAnalyserOptions.maxDecibels,
          })
        ),
      }),
    }),
    []
  );

  useEffect(() => {
    const data = {
      fftSize: analyzerValues.fftSize,
      smoothingTimeConstant: analyzerValues.smoothingTimeConstant,
      minDecibels: analyzerValues.minDecibels,
      maxDecibels: analyzerValues.maxDecibels,
    };

    setAnalyserOptions(data);
    localStorage.setItem(
      LocalStorageKeys.AUDIO_ANALYSER_OPTIONS,
      JSON.stringify(data)
    );
  }, [analyzerValues, setAnalyserOptions]);

  return null;
}