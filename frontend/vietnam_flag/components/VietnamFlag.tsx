"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const VietnamFlagLogic = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
        }),
        []
    );

    useFrame((state) => {
        if (meshRef.current) {
            // @ts-ignore
            meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    const vertexShader = `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vPos;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Calculate world position for fragment shader
      // Since we use projectionMatrix * modelViewMatrix in gl_Position,
      // 'position' here is in local space.
      // Because we resize the geometry to match viewport, local space 'position'
      // basically IS the world space dimensions (adjusted for camera z if we wanted, 
      // but here we just want the physical size).
      
      vPos = pos; 

      // Sine wave deformation: 
      // Wave moves along X axis.
      // Adjust frequency and speed.
      // Amplitude: 0.1 - 0.2 depending on taste.
      
      pos.z = sin(pos.x * 2.0 + uTime * 2.0) * 0.2 + sin(pos.y * 3.0 + uTime * 1.5) * 0.1;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

    const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vPos;

    // SDF for 5-pointed Star
    float sdStar5(in vec2 p, in float r, in float rf) {
        const vec2 k1 = vec2(0.809016994375, -0.587785252292);
        const vec2 k2 = vec2(-k1.x,k1.y);
        p.x = abs(p.x);
        p -= 2.0*max(dot(k1,p),0.0)*k1;
        p -= 2.0*max(dot(k2,p),0.0)*k2;
        p.x = abs(p.x);
        p.y -= r;
        vec2 ba = rf*vec2(-k1.y,k1.x) - vec2(0,1);
        float h = clamp( dot(p,ba)/dot(ba,ba), 0.0, r );
        return length(p-ba*h) * sign(p.y*ba.x-p.x*ba.y);
    }

    void main() {
      vec3 redColor = vec3(0.8549, 0.1451, 0.1137);
      vec3 yellowColor = vec3(1.0, 1.0, 0.0);

      // Use vPos (world coordinates) instead of vUv to preserve aspect ratio.
      // vPos.x is roughly -viewportWidth/2 to +viewportWidth/2
      // vPos.y is roughly -viewportHeight/2 to +viewportHeight/2
      vec2 p = vPos.xy;

      // Adjust star size logic.
      // Standard Flag: Star size is relative to height.
      // Let's make the star reasonable size like 1.5 units depending on viewport?
      // Or better, scale it based on the smaller dimension to fit?
      // But standard flag is 2:3.
      // User just wants "Full Screen". 
      // Let's use a fixed size that looks good, or relative to 'height'.
      // Usually star radius is proportional to flag height.
      // Let's estimate flag height is vPos.y range.
      // Actually vPos.y range is viewport.height.
      // Let's try radius = 1.5 (if height is say 5-10?).
      // Better: we don't have viewport in shader, but p.y varies over viewport.
      // If we use constant radius, it stays same physical size regardless of screen.
      // This is probably GOOD for a "flag" effect usually, but if screen is tiny star is huge.
      // BUT, we have vPos.
      // Let's make it responsive??
      // No, user said "lá cờ ... full màn hình".
      // Let's assume on a phone we want it to fit.
      
      // Let's hardcode a reasonable size.
      // If camera z=4, viewport height at z=0 is: 
      // 2 * tan(fov/2) * distance.
      // Default fov=75.
      // H ~ 2 * tan(37.5) * 4 ~ 2 * 0.76 * 4 ~ 6 units.
      // So height is ~6.
      // Star radius 1.5 seems reasonable (diameter 3, half height).
      
      float starSize = 1.2;
      float starDist = sdStar5(p, starSize, starSize * 0.382); 

      // Antialiasing
      float w = fwidth(starDist); 
      float alpha = 1.0 - smoothstep(-w, w, starDist); 

      vec3 color = mix(redColor, yellowColor, alpha);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

    // Scale plane to viewport size + extra to avoid gap when waving
    // Waving amplitude is ~0.2.
    // Add some padding to width/height to ensure edges don't show background.
    const width = viewport.width + 1.0;
    const height = viewport.height + 1.0;

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[width, height, 128, 128]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            // side={THREE.DoubleSide} // Optional, single side is fine if always facing camera
            />
        </mesh>
    );
};

export default function VietnamFlag() {
    return (
        <div className="w-full h-screen bg-black">
            <Canvas camera={{ position: [0, 0, 4] }}>
                <ambientLight intensity={0.5} />
                {/* Helper logic inside Canvas to access useThree */}
                <VietnamFlagLogic />
            </Canvas>
        </div>
    );
}
