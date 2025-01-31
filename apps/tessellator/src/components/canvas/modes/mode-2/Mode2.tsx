import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  InstancedMesh,
  MeshPhongMaterial,
  Object3D,
  Vector3,
} from "three";

import { useAnalyser } from "../../../../utils/analyserContext";
import { usePlayer } from "../../../../utils/playerContext";
import { useGetColour } from "../useGetColour";

const Mode2 = ({ visible }: { visible: boolean }) => {
  const count = 8000;
  const tempObject = new Object3D();
  const mesh = useRef<InstancedMesh>(
    new InstancedMesh(undefined, undefined, count)
  );
  const tempVector = new Vector3();
  const tempColor = new Color();
  const tempColor2 = new Color();
  const colorArray = useMemo(
    () =>
      Float32Array.from(
        new Array(count)
          .fill("")
          .flatMap((_, i) => tempColor.set("#FFF").toArray())
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { getColour } = useGetColour();
  const { audioAnalyser } = useAnalyser();
  const { spotifyAnalyser, trackFeatures } = usePlayer();

  useFrame((state, delta) => {
    if (!visible) return;

    tempColor.lerp(
      new Color(getColour()),
      delta * 10 * (1 - trackFeatures.energy)
    );
    const zValue = 10 * trackFeatures.danceability;
    const scale = Math.min(
      Math.max(
        Math.abs(
          (audioAnalyser.bassSection.average -
            audioAnalyser.snareSection.average) /
            5
        ),
        0.01
      ),
      2
    );
    let i = 0;
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        for (let z = 0; z < 20; z++) {
          const id = i++;
          tempObject.position.set((10 - x) / 2, (10 - y) / 2, (10 - z) / 2);

          tempObject.updateMatrix();
          tempObject.scale.setScalar(scale);
          mesh.current.setMatrixAt(id, tempObject.matrix);
          mesh.current.setColorAt(
            id,
            tempColor2
              .set(tempColor.getHex())
              .offsetHSL(Math.abs(x - 10) * -0.01, 0, Math.abs(z - 10) * -0.05)
          );
        }
      }
    }

    mesh.current.position.lerp(
      tempVector.set(
        0,
        0,
        zValue * (spotifyAnalyser.beats.counter % 2 === 0 ? 1 : -1)
      ),
      delta * (1 - trackFeatures.energy)
    );

    spotifyAnalyser.bars.counter % 2 === 0
      ? (mesh.current.rotation.y += audioAnalyser.midSection.average / 10000) *
          spotifyAnalyser.bars.current.confidence >
        0.5
        ? 1
        : -1
      : (mesh.current.rotation.x += audioAnalyser.midSection.average / 10000) *
          spotifyAnalyser.bars.current.confidence >
        0.5
      ? 1
      : -1;

    (mesh.current.material as MeshPhongMaterial).wireframe =
      spotifyAnalyser.beats.counter % 2 === 0;
    mesh.current.instanceMatrix.needsUpdate = true;

    if (!mesh.current.instanceColor) return;
    mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <group visible={visible}>
      <instancedMesh args={[undefined, undefined, count]} ref={mesh}>
        <boxGeometry args={[0.1, 0.1, 0.1]}>
          <instancedBufferAttribute
            args={[colorArray, 3]}
            attach="attributes-color"
          />
        </boxGeometry>
        <meshPhongMaterial />
      </instancedMesh>
    </group>
  );
};

export default Mode2;
