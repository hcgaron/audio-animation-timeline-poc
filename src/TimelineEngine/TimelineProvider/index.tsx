import { createContext, useEffect, useRef, useState } from "react";
import { createKeyframes } from "../Utils";

interface IAnimation {
  domId: string;
  animations: Keyframe[];
}

interface ITimelineCallback {
  timestamp: number;
  callback: () => void;
}

interface TimelineSegment {
  audioSrc: string;
  animations: IAnimation[];
}
export type TimelineDefinition = TimelineSegment[];

interface ITimelineContext {
  registerAnimation: (animation: IAnimation) => void;
  registerTimelineCallback: (registration: ITimelineCallback) => void;
  // When an element that has a registered animation in the timeline is mounted, it will call this function
  // This is useful for when you want to animate an element that is not mounted when the timeline is created
  registerAnimatedElement: (domId: string) => void;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
}

export const TimelineContext = createContext<ITimelineContext | null>(null);

export const TimelineProvider = ({
  children,
  timelineDefinition,
}: {
  children: React.ReactNode;
  timelineDefinition: TimelineDefinition;
}) => {
  const [currentTrackNumber, setCurrentTrackNumber] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // Default to the first entry of the timelineDefinition prop
  const audioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    audioRef.current = new Audio(
      timelineDefinition[currentTrackNumber].audioSrc
    );
    audioRef.current?.addEventListener("loadedmetadata", () => {
      const audioClipLengthInMilliseconds =
        (audioRef.current?.duration || 0) * 1000;
      // set our animation durations for our css keyframe elements
      setAnimationDurationBasedOnAudioClipLength(audioClipLengthInMilliseconds);
    });
  }, []);

  if (audioRef.current) {
    audioRef.current.onended = playNextTrack;
    audioRef.current.onplay = onAudioPlay;
    audioRef.current.onpause = onAudioPause;
  }

  function onAudioPlay() {
    const animations = timelineDefinition[currentTrackNumber].animations;
    for (const animation of animations) {
      const element = document.getElementById(animation.domId.slice(1));
      if (element) {
        element.style.animationPlayState = "running";
      }
    }
  }
  function onAudioPause() {
    const animations = timelineDefinition[currentTrackNumber].animations;
    for (const animation of animations) {
      const element = document.getElementById(animation.domId.slice(1));
      if (element) {
        element.style.animationPlayState = "paused";
      }
    }
  }

  function playNextTrack() {
    if (!audioRef.current) {
      return;
    }
    setCurrentTrackNumber((currentTrackNumber) => currentTrackNumber + 1);
    audioRef.current.src = timelineDefinition[currentTrackNumber].audioSrc;
    audioRef.current.play();
  }

  function registerAnimation(animation: IAnimation) {
    console.log("registerAnimation", animation);
  }

  function registerTimelineCallback(timelineCallback: ITimelineCallback) {
    console.log("registerTimelineCallback", timelineCallback);
  }

  function registerAnimatedElement(domId: string) {
    console.log("registerAnimatedElement", domId);
  }

  function setAnimationDurationBasedOnAudioClipLength(durationInMs: number) {
    const animations = timelineDefinition[currentTrackNumber].animations;
    for (const domId of animations.map((animation) => animation.domId)) {
      const element = document.getElementById(domId.slice(1));
      if (element) {
        element.style.animationDuration = `${durationInMs}ms`;
        element.style.animationPlayState = "paused";
      }
    }
  }

  function play() {
    setIsPlaying(true);
  }

  function pause() {
    setIsPlaying(false);
  }

  useEffect(() => {
    // Create keyframes for each animation
    for (const segment of timelineDefinition) {
      for (const animation of segment.animations) {
        createKeyframes(animation.domId, animation.animations);
      }
    }
  }, [timelineDefinition]);

  useEffect(() => {
    if (isPlaying && audioRef.current?.paused) {
      console.log("play");
      audioRef.current?.play();
      return;
    }
    if (!audioRef.current?.paused) {
      console.log("pause");
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  return (
    <TimelineContext.Provider
      value={{
        registerAnimation,
        registerTimelineCallback,
        registerAnimatedElement,
        isPlaying,
        play,
        pause,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
};
