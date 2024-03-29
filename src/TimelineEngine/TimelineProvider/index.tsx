import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { attachAnimationToElementIfPresent, createKeyframes } from '../Utils';
import { IAnimation, ITimelineCallback, ITimelineContext, TimelineDefinition } from './types';
import { moveElement } from './util';

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
    if (audioRef.current) {
      return;
    }
    // Initialize our Audio element
    audioRef.current = new Audio(timelineDefinition[currentTrackNumber].audioSrc);
  }, [currentTrackNumber, timelineDefinition]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    // We could optimize this process by removing executed callbacks from the registry
    function checkWindowForScheduledCallbacks(lookahead: number = schedulerLookahead) {
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
    }
    function checkWindowForScheduledAnimations(lookahead: number = schedulerLookahead) {
      if (!audioRef.current) {
        return;
      }
      if (audioRef.current.paused) {
        return;
      }
      const currentTimeInMilliseconds = audioRef.current?.currentTime * 1000;
      const timelineEvents = timelineDefinition[currentTrackNumber].events;
      for (const event of timelineEvents) {
        const scheduledTime = event.startTime;
        if (
          scheduledTime >= currentTimeInMilliseconds &&
          scheduledTime <= currentTimeInMilliseconds + lookahead
        ) {
          if (event.type === 'moveElementTo') {
            // HERE IS WHERE WE HANDLE MOVE ELEMENT TO
            moveElement(event.elementSelector, event.destinationSelector);
            continue;
          }
          const timeUntilEvent = scheduledTime - currentTimeInMilliseconds;
          setTimeout(() => {
            const element = document.getElementById(event.domId.slice(1));
            if (!element) {
              console.warn(
                `No element found with id: ${event.domId.slice(1)} --> skipping animation`,
              );
              return;
            }

            element.style.animationPlayState = 'running';
          }, timeUntilEvent);
        }
      }
    }
    // start our scheduler
    const scheduler = setInterval(() => {
      checkWindowForScheduledCallbacks();
      checkWindowForScheduledAnimations();
    }, schedulerLookahead);
    return () => clearInterval(scheduler);
  }, [schedulerLookahead, currentTrackNumber, timelineDefinition, isPlaying]);

  useEffect(() => {
    // Create keyframes for each animation
    for (const segment of timelineDefinition) {
      for (const timelineEvent of segment.events) {
        if (timelineEvent.type === 'animation') {
          createKeyframes(timelineEvent.domId, timelineEvent.animations, timelineEvent.duration);
        }
        if (timelineEvent.type === 'moveElementTo') {
          // TODO: set this up
        }
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

  // TODO: Is it ok to do this assignment on every render?
  // I set it up like this so the callbacks don't get stale, and I believe garbage
  // collector will clean up the old ones. This is better than addEventListener since
  // we want to discard old callbacks to avoid stale closures
  if (audioRef.current) {
    audioRef.current.onended = playNextTrack;
    audioRef.current.onplay = onAudioPlay;
    audioRef.current.onpause = onAudioPause;
  }

  function onAudioPlay() {
    const timelineEvents = timelineDefinition[currentTrackNumber].events;
    const currentTimeInMilliseconds = (audioRef.current?.currentTime || 0) * 1000;
    // Restart any animations we paused
    for (const event of timelineEvents) {
      const eventEndTime = event.startTime + event.duration;
      if (
        event.startTime <= currentTimeInMilliseconds &&
        eventEndTime > currentTimeInMilliseconds
      ) {
        if (event.type === 'moveElementTo') {
          const element = document.getElementById(event.elementSelector.slice(1));  
          if (element) {
            element.getAnimations().forEach((animation) => {
              animation.play();
            });
          }
          continue;
        }
        const element = document.getElementById(event.domId.slice(1));
        if (element) {
          element.style.animationPlayState = 'running';
        }
      }
      // TODO: do we need to schedule callbacks here? Just in case one is a millisecond after the play event?
    }
  }
  function onAudioPause() {
    const timelineEvents = timelineDefinition[currentTrackNumber].events;
    for (const event of timelineEvents) {
      if (event.type == 'moveElementTo') {
        const element = document.getElementById(event.elementSelector.slice(1));
        if (element) {
          element.getAnimations().forEach((animation) => {
            animation.pause();
          });
        }
        continue;
      }
      const element = document.getElementById(event.domId.slice(1));
      if (element) {
        element.style.animationPlayState = 'paused';
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
    console.log('registerAnimation', animation);
  }

  const registerTimelineCallback = useCallback(
    (callback: () => void, timestamp: number, audioSrc: string) => {
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
      if (!callbackMap.get(audioSrc)) {
        callbackMap.set(audioSrc, []);
      }
      callbackRegistry.current.get(audioSrc)?.push(newCallback);
    },
    [callbackRegistry],
  );

  function registerAnimatedElement(domId: string) {
    const animationEvents = timelineDefinition[currentTrackNumber].events.filter(
      (animation) => animation.type === 'animation',
    ) as IAnimation[];

    const animationDuration = animationEvents.find((animation) => {
      return animation.domId === domId;
    })?.duration;

    attachAnimationToElementIfPresent(domId, domId.slice(1), animationDuration);
  }

  function play() {
    setIsPlaying(true);
  }

  function pause() {
    setIsPlaying(false);
  }

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
