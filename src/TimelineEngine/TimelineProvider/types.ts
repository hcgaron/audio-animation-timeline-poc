export interface IAnimation {
  type: 'animation';
  domId: string;
  // If not provided, it will default to the entire length of the audio file
  duration: number;
  animations: Keyframe[];
  startTime: number;
}

export interface MoveElementTo {
  type: 'moveElementTo';
  elementSelector: string;
  destinationSelector: string;
  // If not provided, it will default to the entire length of the audio file
  duration: number;
  startTime: number;
}

export type TimelineEvent = IAnimation | MoveElementTo;

export interface ITimelineCallback {
  timestamp: number; // In milliseconds
  callback: () => void;
}

interface TimelineSegment {
  audioSrc: string;
  events: TimelineEvent[];
}
export type TimelineDefinition = TimelineSegment[];

export interface ITimelineContext {
  registerAnimation: (animation: IAnimation) => void;
  registerTimelineCallback: (callback: () => void, timestamp: number, audioSrc: string) => void;
  // When an element that has a registered animation in the timeline is mounted, it will call this function
  // This is useful for when you want to animate an element that is not mounted when the timeline is created
  registerAnimatedElement: (domId: string) => void;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
}
