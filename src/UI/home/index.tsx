import { useTimeline } from "../../TimelineEngine/hooks/useTimeline";

export function Home() {
  const { play, pause, isPlaying } = useTimeline();

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
              backgroundColor: "cyan",
              margin: "0 auto",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
