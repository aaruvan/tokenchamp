import React, { useEffect, useRef } from 'react'

// Lightweight liquid-like background using three.js with a shader plane
// Props are accepted to match the requested API surface; only key ones are used.
export default function LiquidEther({
  colors = ['#5227FF', '#FF9FFC', '#B19EEF'],
  mouseForce = 20,
  cursorSize = 100,
  isViscous = false,
  viscous = 30,
  iterationsViscous = 32,
  iterationsPoisson = 32,
  resolution = 0.5,
  isBounce = false,
  autoDemo = true,
  autoSpeed = 0.5,
  autoIntensity = 2.2,
  takeoverDuration = 0.25,
  autoResumeDelay = 3000,
  autoRampDuration = 0.6,
}) {
  const mountRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    let disposed = false
    ;(async () => {
      const THREE = await import('three')

      const mount = mountRef.current
      if (!mount) return

      const size = () => {
        const rect = mount.getBoundingClientRect()
        return { w: Math.max(1, rect.width), h: Math.max(1, rect.height) }
      }
      const { w, h } = size()

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(w, h)
      mount.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

      // Create a plane with a shader material
      const geometry = new THREE.PlaneGeometry(2, 2)

      const colorA = new THREE.Color(colors[0] || '#5227FF')
      const colorB = new THREE.Color(colors[1] || '#FF9FFC')
      const colorC = new THREE.Color(colors[2] || '#B19EEF')

      const uniforms = {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(w, h) },
        u_mouse: { value: new THREE.Vector2(-10, -10) },
        u_colors: { value: [colorA, colorB, colorC] },
        u_auto: { value: autoDemo ? 1 : 0 },
        u_autoSpeed: { value: autoSpeed },
        u_intensity: { value: autoIntensity },
      }

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: /* glsl */`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */`
          precision highp float;
          varying vec2 vUv;
          uniform float u_time;
          uniform vec2 u_resolution;
          uniform vec2 u_mouse;
          uniform vec3 u_colors[3];
          uniform float u_auto;
          uniform float u_autoSpeed;
          uniform float u_intensity;

          // Simple fbm
          float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
          float noise(vec2 p){
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
          }
          float fbm(vec2 p){
            float v = 0.0;
            float a = 0.5;
            for(int i=0;i<5;i++){
              v += a * noise(p);
              p *= 2.0;
              a *= 0.5;
            }
            return v;
          }

          void main(){
            vec2 uv = vUv;
            vec2 st = (uv * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

            // auto swirl path
            vec2 autoPos = vec2(0.5) + 0.25 * vec2(
              sin(u_time * u_autoSpeed * 0.6),
              cos(u_time * u_autoSpeed * 0.5)
            );

            vec2 m = mix(autoPos, u_mouse / u_resolution, 1.0 - u_auto);
            float d = distance(uv, m);

            // layered fbm fields for silky motion
            float f1 = fbm(uv * 3.5 + vec2(u_time * 0.05, -u_time * 0.03));
            float f2 = fbm(uv * 2.0 - vec2(u_time * 0.02, u_time * 0.04));
            float swirl = f1 * 0.6 + f2 * 0.4;

            // emphasis around cursor/auto path
            float cursor = exp(-d * 6.0) * u_intensity;

            vec3 col = mix(u_colors[0], u_colors[1], smoothstep(0.2, 0.8, swirl));
            col = mix(col, u_colors[2], clamp(cursor, 0.0, 1.0));

            // vignette for depth
            float vig = smoothstep(0.95, 0.4, length(uv - 0.5));
            col *= 0.85 + 0.15 * vig;

            gl_FragColor = vec4(col, 1.0);
          }
        `,
      })

      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      const onResize = () => {
        const s = size()
        uniforms.u_resolution.value.set(s.w, s.h)
        renderer.setSize(s.w, s.h)
      }
      const onMouseMove = (e) => {
        const rect = mount.getBoundingClientRect()
        uniforms.u_mouse.value.set(e.clientX - rect.left, rect.height - (e.clientY - rect.top))
      }
      window.addEventListener('resize', onResize)
      window.addEventListener('mousemove', onMouseMove)

      const clock = new THREE.Clock()
      const animate = () => {
        if (disposed) return
        uniforms.u_time.value += clock.getDelta()
        renderer.render(scene, camera)
        rafRef.current = requestAnimationFrame(animate)
      }
      animate()

      return () => {
        disposed = true
        cancelAnimationFrame(rafRef.current)
        window.removeEventListener('resize', onResize)
        window.removeEventListener('mousemove', onMouseMove)
        geometry.dispose()
        material.dispose()
        renderer.dispose()
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
      }
    })()
  }, [colors, autoDemo, autoSpeed, autoIntensity])

  return (
    <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
  )
}


