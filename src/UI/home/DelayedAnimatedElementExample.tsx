import { useEffect } from "react";
import { useTimeline } from "../../TimelineEngine/hooks/useTimeline";

export function DelayedAnimatedElementExample() {
  const { registerAnimatedElement } = useTimeline();

  useEffect(() => {
    registerAnimatedElement("#delayedElementOne");
  }, []);

  return (
    <div
      id="delayedElementOne"
      style={{
        position: "absolute",
        top: 400,
        left: 200,
        height: "200px",
        width: "200px",
        backgroundColor: "magenta",
      }}
    />
  );
}
