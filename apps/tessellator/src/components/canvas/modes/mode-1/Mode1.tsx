import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { getIndexOfMax, getIndexOfMin } from "core";
import {
  AdditiveBlending,
  Color,
  Float32BufferAttribute,
  MathUtils,
  Points,
  ShaderMaterial,
  Vector3,
} from "three";

import "../../shaders/ParticleMaterial";

import { useAnalyser } from "../../../../utils/analyserContext";
import { usePlayer } from "../../../../utils/playerContext";
import { useGetColour } from "../useGetColour";

const Mode1 = ({ visible }: { visible: boolean }) => {
  const mesh = useRef<Points>(null);
  const { audioAnalyser } = useAnalyser();
  const { getColour } = useGetColour({ minSaturation: 75, minLightness: 150 });
  const { spotifyAnalyser, trackFeatures } = usePlayer();

  const radius = useRef(10);
  const tube = useRef(5);
  const tubularSegments = useRef(5);
  const radialSegments = useRef(5);
  const p = useRef(2);
  const q = useRef(3);

  const vertex = new Vector3();
  const normal = new Vector3();

  const P1 = new Vector3();
  const P2 = new Vector3();

  const B = new Vector3();
  const T = new Vector3();
  const N = new Vector3();

  // TODO: move to utils / helpers
  const calculatePositionOnCurve = (
    u: number,
    p: number,
    q: number,
    radius: number,
    position: Vector3
  ) => {
    const cu = Math.cos(u);
    const su = Math.sin(u);
    const quOverP = (q / p) * u;
    const cs = Math.cos(quOverP);

    position.x = radius * (2 + cs) * 0.5 * cu;
    position.y = radius * (2 + cs) * su * 0.5;
    position.z = radius * Math.sin(quOverP) * 0.5;
  };

  const getTorusBufferAttributes = (
    radius: number,
    tube: number,
    tubularSegments: number,
    radialSegments: number,
    p: number,
    q: number
  ) => {
    /* generate torus buffer */

    // buffers
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

    // reset variables

    vertex.set(0, 0, 0);
    normal.set(0, 0, 0);

    P1.set(0, 0, 0);
    P2.set(0, 0, 0);

    B.set(0, 0, 0);
    T.set(0, 0, 0);
    N.set(0, 0, 0);

    // generate vertices, normals and uvs

    for (let i = 0; i <= tubularSegments; ++i) {
      // the radian "u" is used to calculate the position on the torus curve of the current tubular segment

      const u = (i / tubularSegments) * p * Math.PI * 2;

      // now we calculate two points. P1 is our current position on the curve, P2 is a little farther ahead.
      // these points are used to create a special "coordinate space", which is necessary to calculate the correct vertex positions

      calculatePositionOnCurve(u, p, q, radius, P1);
      calculatePositionOnCurve(u + 0.01, p, q, radius, P2);

      // calculate orthonormal basis

      T.subVectors(P2, P1);
      N.addVectors(P2, P1);
      B.crossVectors(T, N);
      N.crossVectors(B, T);

      // normalize B, N.
      B.normalize();
      N.normalize();
      // T can be ignored, we don't use it

      for (let j = 0; j <= radialSegments; ++j) {
        // now calculate the vertices. they are nothing more than an extrusion of the torus curve.
        // because we extrude a shape in the xy-plane, there is no need to calculate a z-value.

        const v = (j / radialSegments) * Math.PI * 2;
        const cx = -tube * Math.cos(v);
        const cy = tube * Math.sin(v);

        // now calculate the final vertex position.
        // first we orient the extrusion with our basis vectors, then we add it to the current position on the curve

        vertex.x = P1.x + (cx * N.x + cy * B.x);
        vertex.y = P1.y + (cx * N.y + cy * B.y);
        vertex.z = P1.z + (cx * N.z + cy * B.z);

        vertices.push(vertex.x, vertex.y, vertex.z);

        // normal (P1 is always the center/origin of the extrusion, thus we can use it to calculate the normal)

        normal.subVectors(vertex, P1).normalize();

        normals.push(normal.x, normal.y, normal.z);

        // uv
        uvs.push(i / tubularSegments);
        uvs.push(j / radialSegments);
      }
    }

    // generate indices
    for (let j = 1; j <= tubularSegments; j++) {
      for (let i = 1; i <= radialSegments; i++) {
        // indices
        const a = (radialSegments + 1) * (j - 1) + (i - 1);
        const b = (radialSegments + 1) * j + (i - 1);
        const c = (radialSegments + 1) * j + i;
        const d = (radialSegments + 1) * (j - 1) + i;

        // faces
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    return [indices, vertices, normals, uvs];
  };

  const updateTorusProperties = (delta: number) => {
    radius.current = MathUtils.lerp(
      radius.current,
      Math.abs(
        audioAnalyser.bassSection.average - audioAnalyser.snareSection.energy
      ) / 5,
      delta
    );

    tube.current = MathUtils.lerp(
      tube.current,
      Math.abs(
        audioAnalyser.bassSection.average - audioAnalyser.kickSection.energy
      ) / 2,
      delta
    );

    tubularSegments.current = Math.ceil(
      MathUtils.lerp(
        tubularSegments.current,
        audioAnalyser.midSection.average,
        delta
      )
    );

    radialSegments.current = Math.ceil(
      MathUtils.lerp(
        radialSegments.current,
        audioAnalyser.analyserData.averageFrequency,
        delta
      )
    );

    if (trackFeatures.valence > 0.5) {
      p.current =
        getIndexOfMin(spotifyAnalyser.getCurrentSegment()?.pitches) + 1;
      q.current =
        getIndexOfMax(spotifyAnalyser.getCurrentSegment()?.pitches) + 1;
      return;
    }

    p.current = MathUtils.lerp(
      p.current,
      getIndexOfMin(spotifyAnalyser.getCurrentSegment()?.pitches) + 1,
      delta * 10
    );

    q.current = MathUtils.lerp(
      q.current,
      getIndexOfMax(spotifyAnalyser.getCurrentSegment()?.pitches) + 1,
      delta * 10
    );
  };

  console.log(trackFeatures);

  useFrame((state, delta) => {
    if (!visible) return;
    if (!mesh.current) return;

    const dynamicDelta =
      delta *
      (trackFeatures.tempo / 10) *
      trackFeatures.energy *
      trackFeatures.danceability *
      (1 - trackFeatures.valence);

    updateTorusProperties(dynamicDelta);

    const [indices, vertices, normals, uvs] = getTorusBufferAttributes(
      radius.current,
      tube.current,
      tubularSegments.current,
      radialSegments.current,
      p.current,
      q.current
    );

    const { uColour, uSize, uRadius } = (
      mesh.current.material as ShaderMaterial
    ).uniforms;

    const timbre = spotifyAnalyser.getCurrentSegment()?.timbre;

    uColour.value.lerp(new Color(getColour()), dynamicDelta);
    uRadius.value = radius.current;

    uSize.value = MathUtils.lerp(
      uSize.value,
      Math.abs(timbre?.length ? timbre[11] : 1),
      dynamicDelta
    );

    mesh.current.geometry.setIndex(indices);
    mesh.current.geometry.setAttribute(
      "position",
      new Float32BufferAttribute(vertices, 3)
    );
    mesh.current.geometry.setAttribute(
      "normal",
      new Float32BufferAttribute(normals, 3)
    );
    mesh.current.geometry.setAttribute(
      "uv",
      new Float32BufferAttribute(uvs, 3)
    );
  });

  return (
    <points ref={mesh} visible={visible}>
      <bufferGeometry attach="geometry" />
      <particleMaterial
        attach="material"
        blending={AdditiveBlending}
        depthWrite={false}
        transparent
      />
    </points>
  );
};

export default Mode1;
