import { useEffect, useState } from "react";
import { useTimeline } from "../../TimelineEngine/hooks/useTimeline";
import { DelayedAnimatedElementExample } from "./delayedAnimatedElementExample";

export function Home() {
  const { play, pause, isPlaying, registerTimelineCallback } = useTimeline();
  const [backgroundColor, setBackgroundColor] = useState("cyan");
  const [showDelayedElement, setShowDelayedelement] = useState(false);

  useEffect(() => {
    registerTimelineCallback(() => {
      setBackgroundColor("red");
    }, 1000);

    registerTimelineCallback(() => {
      setBackgroundColor("orange");
    }, 2000);

    registerTimelineCallback(() => {
      setBackgroundColor("green");
      setShowDelayedelement(true);
    }, 3000);

    registerTimelineCallback(() => {
      setBackgroundColor("yellow");
    }, 4000);

    registerTimelineCallback(() => {
      setBackgroundColor("violet");
    }, 5000);

    registerTimelineCallback(() => {
      setBackgroundColor("cyan");
    }, 6000);
  }, [registerTimelineCallback]);

  return (
    <div style={{ width: "90vw", margin: "0 auto" }}>
      <div className="App">App Prototype</div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>
          <button onClick={isPlaying ? pause : play}>
            {isPlaying ? "PAUSE AUDIO" : "PLAY AUDIO"}
          </button>
          <div
            id="a1"
            style={{
              height: "50px",
              width: "50px",
              backgroundColor,
              margin: "0 auto",
            }}
          ></div>
        </div>
      </div>
      <div>{showDelayedElement && <DelayedAnimatedElementExample />}</div>
    </div>
  );
}
