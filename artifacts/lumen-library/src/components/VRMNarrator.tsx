import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin, VRMUtils, VRMExpressionPresetName, VRMHumanBoneName } from "@pixiv/three-vrm";
import type { EmotionTag } from "@/hooks/use-speech";

interface VRMNarratorProps {
  modelUrl: string;
  isPlaying: boolean;
  isSpeakingWord: boolean;
  emotion: EmotionTag;
  onLoaded?: () => void;
  onError?: (err: Error) => void;
}

const VISEME_NAMES: VRMExpressionPresetName[] = [
  VRMExpressionPresetName.Aa,
  VRMExpressionPresetName.Ih,
  VRMExpressionPresetName.Ou,
  VRMExpressionPresetName.Ee,
  VRMExpressionPresetName.Oh,
];

const EMOTION_PRESETS: Record<EmotionTag, { expression: VRMExpressionPresetName | null; intensity: number }> = {
  neutral: { expression: VRMExpressionPresetName.Neutral, intensity: 0.4 },
  soft: { expression: VRMExpressionPresetName.Relaxed, intensity: 0.6 },
  happy: { expression: VRMExpressionPresetName.Happy, intensity: 0.85 },
  sad: { expression: VRMExpressionPresetName.Sad, intensity: 0.75 },
  serious: { expression: VRMExpressionPresetName.Angry, intensity: 0.35 },
};

export default function VRMNarrator({ modelUrl, isPlaying, isSpeakingWord, emotion, onLoaded, onError }: VRMNarratorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    isPlaying,
    isSpeakingWord,
    emotion,
  });
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Keep latest values in a ref so the animation loop reads them without re-creating the scene.
  useEffect(() => {
    stateRef.current = { isPlaying, isSpeakingWord, emotion };
  }, [isPlaying, isSpeakingWord, emotion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let vrm: VRM | null = null;
    let animationId = 0;
    let resizeObserver: ResizeObserver | null = null;

    const clock = new THREE.Clock();

    // Scene setup
    scene = new THREE.Scene();
    scene.background = null;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 30);
    camera.position.set(0, 1.35, 2.4);
    camera.lookAt(new THREE.Vector3(0, 1.35, 0));

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // Lighting — warm key + cool fill + soft rim
    const hemi = new THREE.HemisphereLight(0xfff3df, 0x1f1a14, 0.55);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffe7b8, 1.6);
    key.position.set(2.5, 3.2, 2.5);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xa4c8ff, 0.45);
    fill.position.set(-2.5, 2, 1.2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffd9a8, 0.7);
    rim.position.set(0, 2, -3);
    scene.add(rim);

    // Idle animation memory
    const blink = { value: 0, next: 2 + Math.random() * 4, t: 0 };
    const headOffset = { x: 0, y: 0, targetX: 0, targetY: 0, nextChange: 2 };
    const bodySway = { value: 0, target: 0, nextChange: 4 };

    let timeSinceMouthChange = 0;
    let mouthHoldUntil = 0;
    let currentVisemeIndex = 0;
    const expressionWeights: Record<string, number> = {};

    const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));

    // VRM load
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) return;
        const loadedVrm = gltf.userData.vrm as VRM;
        if (!loadedVrm) {
          const err = new Error("Loaded glTF did not contain VRM data");
          setLoadError(err.message);
          onError?.(err);
          return;
        }

        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.combineSkeletons(gltf.scene);

        // Many VRM 0.x models are flipped relative to VRM 1.0 — face the camera.
        loadedVrm.scene.rotation.y = Math.PI;
        loadedVrm.scene.position.set(0, 0, 0);

        scene!.add(loadedVrm.scene);
        vrm = loadedVrm;
        setReady(true);
        onLoaded?.();
      },
      (event) => {
        if (event.lengthComputable) {
          setLoadProgress(event.loaded / event.total);
        }
      },
      (err) => {
        const message = err instanceof Error ? err.message : "Failed to load avatar";
        setLoadError(message);
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    );

    // Render loop
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);

      if (vrm) {
        // ---- Idle: breathing ----
        const t = clock.elapsedTime;
        const breath = Math.sin(t * 1.3) * 0.012;

        // ---- Idle: head sway ----
        headOffset.nextChange -= dt;
        if (headOffset.nextChange <= 0) {
          headOffset.targetX = (Math.random() - 0.5) * 0.15;
          headOffset.targetY = (Math.random() - 0.5) * 0.18;
          headOffset.nextChange = 2.5 + Math.random() * 3;
        }
        headOffset.x = lerp(headOffset.x, headOffset.targetX, dt * 1.5);
        headOffset.y = lerp(headOffset.y, headOffset.targetY, dt * 1.5);

        // ---- Idle: body sway ----
        bodySway.nextChange -= dt;
        if (bodySway.nextChange <= 0) {
          bodySway.target = (Math.random() - 0.5) * 0.06;
          bodySway.nextChange = 4 + Math.random() * 3;
        }
        bodySway.value = lerp(bodySway.value, bodySway.target, dt * 1.2);

        // ---- Bones ----
        const human = vrm.humanoid;
        if (human) {
          const head = human.getNormalizedBoneNode(VRMHumanBoneName.Head);
          if (head) {
            head.rotation.x = headOffset.y - 0.04;
            head.rotation.y = headOffset.x;
            head.rotation.z = Math.sin(t * 0.6) * 0.02;
          }

          const neck = human.getNormalizedBoneNode(VRMHumanBoneName.Neck);
          if (neck) {
            neck.rotation.x = headOffset.y * 0.3;
            neck.rotation.y = headOffset.x * 0.4;
          }

          const spine = human.getNormalizedBoneNode(VRMHumanBoneName.Spine);
          if (spine) {
            spine.rotation.z = bodySway.value;
            spine.rotation.x = breath;
          }

          const chest = human.getNormalizedBoneNode(VRMHumanBoneName.Chest);
          if (chest) {
            chest.rotation.x = breath * 1.5;
          }

          // Storyteller arm/hand gestures while speaking
          const speaking = stateRef.current.isPlaying;
          const gestureAmp = speaking ? 1 : 0.15;

          const lShoulder = human.getNormalizedBoneNode(VRMHumanBoneName.LeftShoulder);
          const rShoulder = human.getNormalizedBoneNode(VRMHumanBoneName.RightShoulder);
          const lUpper = human.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm);
          const rUpper = human.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm);
          const lLower = human.getNormalizedBoneNode(VRMHumanBoneName.LeftLowerArm);
          const rLower = human.getNormalizedBoneNode(VRMHumanBoneName.RightLowerArm);
          const lHand = human.getNormalizedBoneNode(VRMHumanBoneName.LeftHand);
          const rHand = human.getNormalizedBoneNode(VRMHumanBoneName.RightHand);

          // Resting arms close to the body, slightly lowered
          const rest = 1.25;
          if (lShoulder) lShoulder.rotation.z = 0.05;
          if (rShoulder) rShoulder.rotation.z = -0.05;
          if (lUpper) {
            lUpper.rotation.z = rest + Math.sin(t * 1.1) * 0.05 * gestureAmp;
            lUpper.rotation.x = -0.15 + Math.sin(t * 0.7) * 0.08 * gestureAmp;
            lUpper.rotation.y = -0.05;
          }
          if (rUpper) {
            rUpper.rotation.z = -rest - Math.sin(t * 1.1 + 1.1) * 0.05 * gestureAmp;
            rUpper.rotation.x = -0.15 + Math.sin(t * 0.7 + 0.7) * 0.08 * gestureAmp;
            rUpper.rotation.y = 0.05;
          }
          if (lLower) {
            lLower.rotation.y = -1.0 - Math.sin(t * 0.9) * 0.18 * gestureAmp;
            lLower.rotation.z = 0.1;
          }
          if (rLower) {
            rLower.rotation.y = 1.0 + Math.sin(t * 0.9 + 1.4) * 0.18 * gestureAmp;
            rLower.rotation.z = -0.1;
          }
          if (lHand) {
            lHand.rotation.x = Math.sin(t * 1.6) * 0.12 * gestureAmp;
            lHand.rotation.z = 0.1 + Math.sin(t * 1.2) * 0.08 * gestureAmp;
          }
          if (rHand) {
            rHand.rotation.x = Math.sin(t * 1.6 + 0.9) * 0.12 * gestureAmp;
            rHand.rotation.z = -0.1 - Math.sin(t * 1.2 + 0.9) * 0.08 * gestureAmp;
          }
        }

        // ---- Blink ----
        blink.t += dt;
        if (blink.t >= blink.next) {
          blink.value = 1;
          blink.t = 0;
          blink.next = 2 + Math.random() * 4;
        } else {
          blink.value = Math.max(0, blink.value - dt * 8);
        }

        // ---- Expressions ----
        const expr = vrm.expressionManager;
        if (expr) {
          // Reset all known expressions toward 0 each frame
          const resetNames = [
            VRMExpressionPresetName.Happy,
            VRMExpressionPresetName.Sad,
            VRMExpressionPresetName.Angry,
            VRMExpressionPresetName.Relaxed,
            VRMExpressionPresetName.Neutral,
            VRMExpressionPresetName.Surprised,
            VRMExpressionPresetName.Aa,
            VRMExpressionPresetName.Ih,
            VRMExpressionPresetName.Ou,
            VRMExpressionPresetName.Ee,
            VRMExpressionPresetName.Oh,
            VRMExpressionPresetName.Blink,
          ];
          for (const name of resetNames) {
            expressionWeights[name] = lerp(expressionWeights[name] ?? 0, 0, dt * 6);
          }

          // Emotion expression
          const emotionPreset = EMOTION_PRESETS[stateRef.current.emotion];
          if (emotionPreset.expression) {
            expressionWeights[emotionPreset.expression] = lerp(
              expressionWeights[emotionPreset.expression] ?? 0,
              emotionPreset.intensity,
              dt * 4
            );
          }

          // Blink — only if no emotion is overriding eye area too aggressively
          expressionWeights[VRMExpressionPresetName.Blink] = blink.value;

          // ---- Mouth lip sync ----
          if (stateRef.current.isPlaying) {
            timeSinceMouthChange += dt;
            // Pick a new viseme on word boundary or every ~120ms while speaking
            if (stateRef.current.isSpeakingWord && t > mouthHoldUntil) {
              currentVisemeIndex = Math.floor(Math.random() * VISEME_NAMES.length);
              mouthHoldUntil = t + 0.12 + Math.random() * 0.08;
              timeSinceMouthChange = 0;
            } else if (timeSinceMouthChange > 0.18) {
              currentVisemeIndex = Math.floor(Math.random() * VISEME_NAMES.length);
              timeSinceMouthChange = 0;
              mouthHoldUntil = t + 0.1;
            }

            // Drive selected viseme toward open, others toward 0
            const openTarget = stateRef.current.isSpeakingWord ? 0.85 : 0.45;
            for (let i = 0; i < VISEME_NAMES.length; i++) {
              const name = VISEME_NAMES[i];
              const target = i === currentVisemeIndex ? openTarget : 0;
              expressionWeights[name] = lerp(expressionWeights[name] ?? 0, target, dt * 18);
            }
          } else {
            // Mouth closed when paused
            for (const name of VISEME_NAMES) {
              expressionWeights[name] = lerp(expressionWeights[name] ?? 0, 0, dt * 12);
            }
          }

          // Apply weights
          for (const [name, w] of Object.entries(expressionWeights)) {
            try {
              expr.setValue(name, w);
            } catch {
              // Some VRM models don't define every preset — ignore.
            }
          }
        }

        vrm.update(dt);
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!renderer || !camera || !container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    } else {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener("resize", handleResize);
      if (vrm) {
        scene?.remove(vrm.scene);
        VRMUtils.deepDispose(vrm.scene);
      }
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentElement === container) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, [modelUrl, onLoaded, onError]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {!ready && !loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <div className="w-32 h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-[width] duration-200"
              style={{ width: `${Math.round(loadProgress * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-serif italic">Awakening the narrator…</p>
        </div>
      )}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center text-destructive text-sm font-serif px-4 text-center">
          {loadError}
        </div>
      )}
    </div>
  );
}
