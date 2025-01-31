import { ReactNode } from "react";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  OrbitControls,
  Preload,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";

import { environment } from "../../environments/environment";

export default function DefaultScene({ children }: { children: ReactNode }) {
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas
      shadows="soft"
      style={{
        position: "absolute",
        top: 0,
        background: "#000",
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight intensity={1} position={[2.5, 2, 12]} />
      <pointLight castShadow intensity={1} position={[-10, 5, 20]} />
      {children}
      <OrbitControls />
      {environment.production ? null : (
        <Perf antialias={false} colorBlind deepAnalyze position="top-left" />
      )}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <Preload all />
    </Canvas>
  );
}
