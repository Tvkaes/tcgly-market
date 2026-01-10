import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      v += noise(p) * amp;
      p *= 2.3;
      amp *= 0.55;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 coord = vec2(uv.x * aspect, uv.y);
    vec2 centered = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
    
    vec3 color = mix(
      vec3(0.98, 0.95, 1.0),
      vec3(0.95, 0.92, 1.0),
      uv.y * 0.8 + sin(uv.x * 2.0 + uTime * 0.1) * 0.1
    );
    
    float t = uTime * 0.2;
    
    vec2 blob1Pos = vec2(0.2 + sin(t * 0.3) * 0.15, 0.75 + cos(t * 0.25) * 0.1);
    float blob1 = exp(-pow(length(coord - blob1Pos * vec2(aspect, 1.0)) * 2.5, 2.0));
    color += vec3(1.0, 0.45, 0.65) * blob1 * 0.35;
    
    vec2 blob2Pos = vec2(0.8 + cos(t * 0.28) * 0.12, 0.4 + sin(t * 0.35) * 0.15);
    float blob2 = exp(-pow(length(coord - blob2Pos * vec2(aspect, 1.0)) * 2.2, 2.0));
    color += vec3(0.6, 0.35, 0.95) * blob2 * 0.3;
    
    vec2 blob3Pos = vec2(0.5 + sin(t * 0.22) * 0.2, 0.25 + cos(t * 0.3) * 0.12);
    float blob3 = exp(-pow(length(coord - blob3Pos * vec2(aspect, 1.0)) * 2.8, 2.0));
    color += vec3(0.35, 0.6, 1.0) * blob3 * 0.28;
    
    vec2 blob4Pos = vec2(0.75 + sin(t * 0.18) * 0.1, 0.8 + cos(t * 0.22) * 0.08);
    float blob4 = exp(-pow(length(coord - blob4Pos * vec2(aspect, 1.0)) * 3.5, 2.0));
    color += vec3(1.0, 0.85, 0.2) * blob4 * 0.2;
    
    vec2 blob5Pos = vec2(0.15 + cos(t * 0.25) * 0.1, 0.35 + sin(t * 0.32) * 0.12);
    float blob5 = exp(-pow(length(coord - blob5Pos * vec2(aspect, 1.0)) * 3.0, 2.0));
    color += vec3(0.2, 0.85, 0.8) * blob5 * 0.22;
    
    vec2 blob6Pos = vec2(0.4 + sin(t * 0.15) * 0.18, 0.65 + cos(t * 0.2) * 0.1);
    float blob6 = exp(-pow(length(coord - blob6Pos * vec2(aspect, 1.0)) * 4.0, 2.0));
    color += vec3(1.0, 0.4, 0.25) * blob6 * 0.15;

    float fogNoise = fbm(vec2(centered.x * 2.5, uv.y * 4.0) + vec2(t * 0.3, -t * 0.25));
    float depthFog = smoothstep(0.35, 0.95, uv.y + fogNoise * 0.15);
    vec3 fogColor = vec3(0.92, 0.96, 1.0);
    color = mix(color, fogColor, depthFog * 0.45);

    float horizonGlow = smoothstep(0.4, 0.7, uv.y + sin(centered.x * 3.0 + t * 0.4) * 0.05);
    color += vec3(0.35, 0.32, 0.55) * horizonGlow * 0.25;

    float vignette = smoothstep(1.2, 0.4, length(centered));
    color *= mix(1.0, 0.8, vignette);
    
    gl_FragColor = vec4(color, 1.0);
  }
`

type BackgroundVariant = 'hero' | 'pages'

interface GridBackgroundProps {
  variant?: BackgroundVariant
}

const GridBackground = ({ variant = 'hero' }: GridBackgroundProps) => {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const frameIdRef = useRef<number>(0)
  const isReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    if (variant !== 'hero') {
      mount.style.background = '#ffffff'
      return () => {
        mount.style.background = ''
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio, 2)

    // === MAIN SCENE ===
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0xf5f0ff, 0.012)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(0, 6, 15)
    camera.lookAt(0, 0, -30)

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(dpr)
    renderer.autoClear = false
    mount.appendChild(renderer.domElement)

    // === BACKGROUND SCENE (2D Shader) ===
    const bgScene = new THREE.Scene()
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
      },
      vertexShader,
      fragmentShader,
      depthWrite: false,
    })
    
    const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial)
    bgScene.add(bgPlane)

    let gridHelper: THREE.GridHelper | null = null
    let gridMaterial: THREE.LineBasicMaterial | null = null
    const gridSize = 300
    const gridDivisions = 60

    gridMaterial = new THREE.LineBasicMaterial({ 
      color: 0xd8b4fe, 
      transparent: true, 
      opacity: 0.5
    })
    gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0xc084fc, 0xe9d5ff)
    gridHelper.position.y = -4
    gridHelper.material = gridMaterial
    scene.add(gridHelper)

    // === ANIMATION ===
    const clock = new THREE.Clock()
    const baseSpeed = isReducedMotion ? 0.3 : 1

    const animate = () => {
      const elapsed = clock.getElapsedTime() * baseSpeed
      
      // Update shader time
      shaderMaterial.uniforms.uTime.value = elapsed

      if (gridHelper) {
        const gridScroll = (elapsed * 2) % (gridSize / gridDivisions)
        gridHelper.position.z = gridScroll
      }

      camera.position.x = Math.sin(elapsed * 0.08) * 0.8
      camera.position.y = 6 + Math.sin(elapsed * 0.06) * 0.4
      camera.lookAt(0, 0, -30)

      renderer.clear()
      renderer.render(bgScene, bgCamera)
      renderer.clearDepth()
      renderer.render(scene, camera)
      
      frameIdRef.current = requestAnimationFrame(animate)
    }
    animate()

    // === RESIZE HANDLER ===
    const handleResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      shaderMaterial.uniforms.uResolution.value.set(w, h)
    }
    window.addEventListener('resize', handleResize)

    // === CLEANUP ===
    return () => {
      cancelAnimationFrame(frameIdRef.current)
      window.removeEventListener('resize', handleResize)
      
      if (gridHelper) {
        scene.remove(gridHelper)
        gridHelper.geometry.dispose()
      }
      gridMaterial?.dispose()
      shaderMaterial.dispose()
      bgPlane.geometry.dispose()
      
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [isReducedMotion, variant])

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  )
}

export default GridBackground
