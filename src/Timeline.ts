import { TimelineDefinition } from "./TimelineEngine/TimelineProvider";

export const timeline: TimelineDefinition = [
  {
    // In reality this will be a URI but the origin will be resolved by the host application
    audioSrc: "https://cdn.freesound.org/previews/571/571367_2282212-lq.mp3",
    animations: [
      {
        domId: "#a1",
        durationInMs: 10000,
        animations: [
          {
            opacity: 0,
            offset: 0,
            transform: "translateX(-500%)",
          },
          {
            opacity: 1,
            offset: 0.05,
            transform: "translate(-100%, -100%);",
            scale: 6,
          },
          {
            opacity: 1,
            offset: 0.1,
            scale: 1,
            transform: "translate(-500%, -500%);",
          },
          {
            offset: 0.2,
            opacity: 1,
            transform: "translateX(500%); translateY(0%);",
          },
          {
            offset: 0.25,
            opacity: 1,
            transform: "translateX(-500%)",
          },
          {
            offset: 0.3,
            transform: "translateX(0)",
            scale: 1.2,
          },
          {
            offset: 0.4,
            transform: "translateX(0)",
            scale: 4,
          },
          {
            offset: 0.5,
            transform: "translateX(-350%)",
            scale: 0.2,
          },
          {
            offset: 0.52,
            transform: "translate(-25%, 20%)",
            scale: 12,
          },
          {
            offset: 0.59,
            transform: "translate(250%, 200%)",
            scale: 0.4,
          },
          {
            offset: 0.65,
            transform: "translate(-250%, -200%)",
            scale: 2,
          },
          {
            offset: 0.7,
            transform: "translate(0%, 0%)",
            scale: 1,
          },
        ],
      },
      {
        domId: "#delayedElementOne",
        durationInMs: 5000,
        animations: [
          {
            offset: 0,
            backgroundColor: "red",
            transform: "translate(0px, 0px)",
          },
          {
            offset: 0.1,
            backgroundColor: "darkslateblue",
          },
          {
            offset: 0.2,
            backgroundColor: "green",
          },
          {
            offset: 0.3,
            backgroundColor: "red",
          },
          {
            offset: 0.4,
            transform: "translate(200px, 300px)",
          },
          {
            offset: 0.5,
            transform: "translate(0px, 0px)",
          },
        ],
      },
    ],
  },
];
