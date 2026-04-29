import { Component, type ReactNode, useEffect, useState } from "react";
import VRMNarrator from "@/components/VRMNarrator";
import NarratorPersona from "@/components/NarratorPersona";
import type { EmotionTag } from "@/hooks/use-speech";

interface NarratorStageProps {
  modelUrl: string;
  isPlaying: boolean;
  isSpeakingWord: boolean;
  emotion: EmotionTag;
}

class WebGLBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  constructor(props: { children: ReactNode; onFail: () => void }) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    return !!gl;
  } catch {
    return false;
  }
}

export default function NarratorStage({ modelUrl, isPlaying, isSpeakingWord, emotion }: NarratorStageProps) {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (!detectWebGL()) {
      setUseFallback(true);
    }
  }, []);

  if (useFallback) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <NarratorPersona isPlaying={isPlaying} isSpeakingWord={isSpeakingWord} />
      </div>
    );
  }

  return (
    <WebGLBoundary onFail={() => setUseFallback(true)}>
      <VRMNarrator
        modelUrl={modelUrl}
        isPlaying={isPlaying}
        isSpeakingWord={isSpeakingWord}
        emotion={emotion}
        onError={() => setUseFallback(true)}
      />
    </WebGLBoundary>
  );
}
