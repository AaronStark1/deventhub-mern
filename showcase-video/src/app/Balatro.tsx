// Port of event-hub-frontend/src/components/backgrounds/Balatro.jsx. The
// shader is verbatim; only the clock changes: iTime comes from the frame
// number instead of requestAnimationFrame, so every render is identical.
import { Mesh, Program, Renderer, Triangle } from "ogl";
import { useLayoutEffect, useRef } from "react";

const vertex = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragment = `
precision highp float;

#define PI 3.14159265359

uniform float iTime;
uniform vec3 iResolution;
uniform float uSpinRotation;
uniform float uSpinSpeed;
uniform vec2 uOffset;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;
uniform float uContrast;
uniform float uLighting;
uniform float uSpinAmount;
uniform float uPixelFilter;
uniform float uSpinEase;
uniform bool uIsRotate;
uniform vec2 uMouse;

varying vec2 vUv;

vec4 effect(vec2 screenSize, vec2 screen_coords) {
    float pixel_size = length(screenSize.xy) / uPixelFilter;
    vec2 uv = (floor(screen_coords.xy * (1.0 / pixel_size)) * pixel_size - 0.5 * screenSize.xy) / length(screenSize.xy) - uOffset;
    float uv_len = length(uv);

    float speed = (uSpinRotation * uSpinEase * 0.2);
    if(uIsRotate){
       speed = iTime * speed;
    }
    speed += 302.2;

    float mouseInfluence = (uMouse.x * 2.0 - 1.0);
    speed += mouseInfluence * 0.1;

    float new_pixel_angle = atan(uv.y, uv.x) + speed - uSpinEase * 20.0 * (uSpinAmount * uv_len + (1.0 - uSpinAmount));
    vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.0;
    uv = (vec2(uv_len * cos(new_pixel_angle) + mid.x, uv_len * sin(new_pixel_angle) + mid.y) - mid);

    uv *= 30.0;
    float baseSpeed = iTime * uSpinSpeed;
    speed = baseSpeed + mouseInfluence * 2.0;

    vec2 uv2 = vec2(uv.x + uv.y);

    for(int i = 0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv += 0.5 * vec2(
            cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
            sin(uv2.x - 0.113 * speed)
        );
        uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
    }

    float contrast_mod = (0.25 * uContrast + 0.5 * uSpinAmount + 1.2);
    float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
    float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
    float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
    float c3p = 1.0 - min(1.0, c1p + c2p);
    float light = (uLighting - 0.2) * max(c1p * 5.0 - 4.0, 0.0) + uLighting * max(c2p * 5.0 - 4.0, 0.0);

    return (0.3 / uContrast) * uColor1 + (1.0 - 0.3 / uContrast) * (uColor1 * c1p + uColor2 * c2p + vec4(c3p * uColor3.rgb, c3p * uColor1.a)) + light;
}

void main() {
    vec2 uv = vUv * iResolution.xy;
    gl_FragColor = effect(iResolution.xy, uv);
}
`;

const hexToVec4 = (hex: string) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).concat(1);
};

type Gl = { renderer: Renderer; program: Program; mesh: Mesh };

/** The landing hero's colours and settings (LandingPage.jsx). */
export const HERO_BALATRO = {
  color1: "#539b8f",
  color2: "#255156",
  color3: "#10242b",
  pixelFilter: 1020,
};

export const Balatro = ({
  width,
  height,
  time,
  color1,
  color2,
  color3,
  pixelFilter = 745,
  mouse = [0.5, 0.5],
  resolution = 1,
}: {
  width: number;
  height: number;
  /** Seconds — the shader's iTime. */
  time: number;
  color1: string;
  color2: string;
  color3: string;
  pixelFilter?: number;
  mouse?: [number, number];
  /** Canvas pixels per CSS pixel. */
  resolution?: number;
}) => {
  const host = useRef<HTMLDivElement>(null);
  const gl = useRef<Gl | null>(null);

  useLayoutEffect(() => {
    const renderer = new Renderer({ dpr: 1, alpha: false, antialias: false, preserveDrawingBuffer: true });
    renderer.setSize(Math.round(width * resolution), Math.round(height * resolution));
    const canvas = renderer.gl.canvas as HTMLCanvasElement;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.display = "block";

    const program = new Program(renderer.gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: [canvas.width, canvas.height, canvas.width / canvas.height] },
        uSpinRotation: { value: -2.0 },
        uSpinSpeed: { value: 7.0 },
        uOffset: { value: [0, 0] },
        uColor1: { value: hexToVec4(color1) },
        uColor2: { value: hexToVec4(color2) },
        uColor3: { value: hexToVec4(color3) },
        uContrast: { value: 3.5 },
        uLighting: { value: 0.4 },
        uSpinAmount: { value: 0.25 },
        uPixelFilter: { value: pixelFilter },
        uSpinEase: { value: 1.0 },
        uIsRotate: { value: false },
        uMouse: { value: [0.5, 0.5] },
      },
    });
    const mesh = new Mesh(renderer.gl, { geometry: new Triangle(renderer.gl), program });
    host.current?.appendChild(canvas);
    gl.current = { renderer, program, mesh };

    return () => {
      canvas.remove();
      renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.current = null;
    };
  }, [width, height, resolution, color1, color2, color3, pixelFilter]);

  // Runs after every render: paint this frame.
  useLayoutEffect(() => {
    const g = gl.current;
    if (!g) return;
    g.program.uniforms.iTime.value = time;
    g.program.uniforms.uMouse.value = mouse;
    g.renderer.render({ scene: g.mesh });
  });

  return <div ref={host} style={{ width, height }} />;
};
