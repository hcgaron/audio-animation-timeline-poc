import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { attachAnimationToElementIfPresent, createKeyframes } from "../Utils";

interface IAnimation {
  domId: string;
  // If not provided, it will default to the entire length of the audio file
  durationInMs?: number;
  animations: Keyframe[];
}

interface ITimelineCallback {
  timestamp: number; // In milliseconds
  callback: () => void;
}

interface TimelineSegment {
  audioSrc: string;
  animations: IAnimation[];
}
export type TimelineDefinition = TimelineSegment[];

interface ITimelineContext {
  registerAnimation: (animation: IAnimation) => void;
  registerTimelineCallback: (callback: () => void, timestamp: number) => void;
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
  schedulerLookahead = 250,
}: {
  children: React.ReactNode;
  timelineDefinition: TimelineDefinition;
  schedulerLookahead?: number;
}) => {
  const [currentTrackNumber, setCurrentTrackNumber] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // Callback registry is a Map of type [audioFile: string]: ITimelineCallback[]
  type CallbackSchedule = ITimelineCallback & {
    isScheduled: boolean;
    hasCompleted: boolean;
  };
  const callbackRegistry = useRef<Map<string, CallbackSchedule[]>>(new Map());

  // Default to the first entry of the timelineDefinition prop
  const audioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    if (callbackRegistry.current?.size) {
      return;
    }
    // Initialize our callback registry
    for (const segment of timelineDefinition) {
      callbackRegistry.current.set(segment.audioSrc, []);
    }
  }, [timelineDefinition]);

  useEffect(() => {
    // Initialize our Audio element
    if (!audioRef.current) {
      audioRef.current = new Audio(
        timelineDefinition[currentTrackNumber].audioSrc
      );
    }

    function setAnimationDurationBasedOnAudioClipLength(durationInMs: number) {
      const animations = timelineDefinition[currentTrackNumber].animations;
      for (const domId of animations
        .filter((animation) => !animation.durationInMs)
        .map((animation) => animation.domId)) {
        const element = document.getElementById(domId.slice(1));
        if (element) {
          element.style.animationDuration = `${durationInMs}ms`;
          element.style.animationPlayState = "paused";
        }
      }
    }

    audioRef.current.onloadedmetadata = () => {
      const audioClipLengthInMilliseconds =
        (audioRef.current?.duration || 0) * 1000;
      // set our animation durations for our css keyframe elements
      // TODO: we need to do this every time we change the audio file
      setAnimationDurationBasedOnAudioClipLength(audioClipLengthInMilliseconds);
    };

    // audioRef.current?.addEventListener("loadedmetadata", );
  }, [currentTrackNumber, timelineDefinition]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    // We could optimize this process by removing executed callbacks from the registry
    const checkWindowForScheduledCallbacks = (
      lookahead: number = schedulerLookahead
    ) => {
      if (!audioRef.current) {
        return;
      }
      if (audioRef.current.paused) {
        return;
      }
      // check the currentTime of the audioRef.current, converting it to milliseconds, then look into our callbackRegistry
      // for any callbacks that are scheduled to be called within the lookahead window
      const currentTimeInMilliseconds = audioRef.current?.currentTime * 1000;
      const currentAudioSrc = timelineDefinition[currentTrackNumber].audioSrc;
      const callbacks = callbackRegistry.current.get(currentAudioSrc);
      if (!callbacks?.length) {
        return;
      }

      for (const callback of callbacks) {
        const scheduledTime = callback.timestamp;
        if (
          scheduledTime >= currentTimeInMilliseconds &&
          scheduledTime <= currentTimeInMilliseconds + lookahead
        ) {
          // calculate the time until the callback should be called
          const timeUntilCallback = scheduledTime - currentTimeInMilliseconds;
          // call the callback after the timeUntilCallback has passed
          setTimeout(callback.callback, timeUntilCallback);
        }
      }
    };
    // start our scheduler
    const scheduler = setInterval(
      checkWindowForScheduledCallbacks,
      schedulerLookahead
    );
    return () => clearInterval(scheduler);
  }, [schedulerLookahead, currentTrackNumber, timelineDefinition, isPlaying]);

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
    // TODO: do we need to schedule callbacks here? Just in case one is a millisecond after the play event?
  }
  function onAudioPause() {
    const animations = timelineDefinition[currentTrackNumber].animations;
    for (const animation of animations) {
      const element = document.getElementById(animation.domId.slice(1));
      if (element) {
        element.style.animationPlayState = "paused";
      }
    }
    // TODO: We need to clear all scheduled callbacks from executing if they are scheduled to execute after the pause
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

  // TODO: registration should include an audioSrc and we don't need to check for the currentTrackNumber
  const registerTimelineCallback = useCallback(
    (callback: () => void, timestamp: number) => {
      if (!callbackRegistry.current) {
        return;
      }
      const callbackMap = callbackRegistry.current;
      const newCallback = {
        callback,
        timestamp,
        isScheduled: false,
        hasCompleted: false,
      };
      if (!callbackMap.get(timelineDefinition[currentTrackNumber].audioSrc)) {
        callbackMap.set(timelineDefinition[currentTrackNumber].audioSrc, []);
      }
      callbackRegistry.current
        .get(timelineDefinition[currentTrackNumber].audioSrc)
        ?.push(newCallback);
    },
    [callbackRegistry, currentTrackNumber, timelineDefinition]
  );

  function registerAnimatedElement(domId: string) {
    // const elapsedTimeInMs = (audioRef.current?.currentTime || 0) * 1000;
    // const animationDelay = `${elapsedTimeInMs}ms`;
    attachAnimationToElementIfPresent(
      domId,
      domId.slice(1),
      undefined,
      "playing"
      // animationDelay
    );
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
        createKeyframes(
          animation.domId,
          animation.animations,
          animation.durationInMs
        );
      }
    }
  }, [timelineDefinition]);

  useEffect(() => {
    if (isPlaying && audioRef.current?.paused) {
      audioRef.current?.play();
      return;
    }
    if (!audioRef.current?.paused) {
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
