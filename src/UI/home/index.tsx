import { useEffect, useState } from "react";
import { useTimeline } from "../../TimelineEngine/hooks/useTimeline";
import { DelayedAnimatedElementExample } from "./DelayedAnimatedElementExample";

export function Home() {
  const { play, pause, isPlaying, registerTimelineCallback } = useTimeline();
  const [backgroundColor, setBackgroundColor] = useState("cyan");
  const [showDelayedElement, setShowDelayedelement] = useState(false);
  const audioSrc =
    "https://cdn.freesound.org/previews/571/571367_2282212-lq.mp3";

  useEffect(() => {
    registerTimelineCallback(
      () => {
        setBackgroundColor("red");
      },
      1000,
      audioSrc
    );

    registerTimelineCallback(
      () => {
        setBackgroundColor("orange");
      },
      2000,
      audioSrc
    );

    registerTimelineCallback(
      () => {
        setBackgroundColor("green");
        setShowDelayedelement(true);
      },
      3000,
      audioSrc
    );

    registerTimelineCallback(
      () => {
        setBackgroundColor("yellow");
      },
      4000,
      audioSrc
    );

    registerTimelineCallback(
      () => {
        setBackgroundColor("violet");
      },
      5000,
      audioSrc
    );

    registerTimelineCallback(
      () => {
        setBackgroundColor("cyan");
      },
      6000,
      audioSrc
    );
  }, [registerTimelineCallback]);

  return (
    <div style={{ width: "90vw", margin: "0 auto" }}>
      <div style={{ fontSize: "24px" }} className="App">
        App Prototype
      </div>
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
