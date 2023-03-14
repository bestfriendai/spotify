import { hslToHex } from "core";
import SpotifyAnalyser from "spotify-analyser";
import AudioAnalyser from "audio-analyser";

const minSaturation = 25;
const minLightness = 50;

const getColour = (
  colourKey: number,
  spotifyAnalyzer: SpotifyAnalyser,
  audioAnalyzer: AudioAnalyser
) => {
  if (!audioAnalyzer || !spotifyAnalyzer.segments?.current?.timbre?.length) {
    return "#123456";
  }

  switch (colourKey) {
    case 0:
      return hslToHex(
        audioAnalyzer.midSection.average * 5,
        Math.max(audioAnalyzer.kickSection.average, minSaturation),
        Math.max(audioAnalyzer.snareSection.average, minLightness)
      );
    case 1:
      return hslToHex(
        audioAnalyzer.bassSection.average * 4,
        Math.max(
          Math.abs(spotifyAnalyzer.segments.current.timbre[2] * 2),
          minSaturation
        ),
        Math.max(
          Math.abs(spotifyAnalyzer.segments.current.timbre[1] * 2),
          minLightness
        )
      );
    case 2:
      return hslToHex(
        audioAnalyzer.analyserData.averageFrequency * 7,
        Math.max(
          Math.abs(spotifyAnalyzer.segments.current.timbre[2] * 2),
          minSaturation
        ),
        Math.max(
          Math.abs(spotifyAnalyzer.segments.current.timbre[1] * 2),
          minLightness
        )
      );
    default:
      return hslToHex(
        audioAnalyzer.snareSection.average * 6,
        Math.max(
          Math.abs(spotifyAnalyzer.segments.current.timbre[2] * 2),
          minSaturation
        ),
        Math.max(
          Math.abs(spotifyAnalyzer.segments.current.timbre[1] * 2),
          minLightness
        )
      );
  }
};

export default getColour;