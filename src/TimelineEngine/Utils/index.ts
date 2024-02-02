function createKeyframeRules(inputObject: Keyframe): string {
  return Object.keys(inputObject)
    .filter(
      (property) =>
        property !== "composite" &&
        property !== "easing" &&
        property !== "offset"
    )
    .reduce((result, property) => {
      const value = inputObject[property];
      const keyframeRule = `${camelToKebab(property)}: ${value};`;
      return result + keyframeRule;
    }, "");
}

export function attachAnimationToElementIfPresent(
  elementId: string,
  animationName: string,
  animationDurationInMs: number = 0,
  animationPlayState: string = "paused",
  animationDelay: string = "0ms"
) {
  if (!animationDurationInMs) {
    console.warn(
      `No animation duration found for element: ${elementId}. This animation will attempt to be registered but will have 0 duration; it will likely not play properly!`
    );
  }
  const element = document.getElementById(elementId.slice(1));
  if (!element) {
    console.warn(
      `No element with id ${elementId} found to attach animation ${animationName}!`
    );
    return;
  }
  element.style.animationName = elementId.slice(1);
  element.style.animationName = animationName;
  element.style.animationDuration = `${animationDurationInMs}ms`;
  element.style.animationPlayState = animationPlayState;
  element.style.animationDelay = animationDelay;
}

// Function to create keyframes dynamically
export function createKeyframes(
  elementId: string,
  frames: Keyframe[],
  animationDurationInMs?: number
) {
  const animationName = elementId.slice(1);
  // Create a new style element
  const style = document.createElement("style");
  document.head.appendChild(style);

  // Construct keyframe rules
  let keyframeRules = `@keyframes ${animationName} {`;
  for (const frame of frames) {
    keyframeRules += `${(frame.offset || 0) * 100}% {`;
    const rules = createKeyframeRules(frame);
    keyframeRules += rules;
    keyframeRules += "}";
  }
  keyframeRules += "}";
  style.sheet?.insertRule(keyframeRules, 0);
  attachAnimationToElementIfPresent(
    elementId,
    animationName,
    animationDurationInMs
  );
}

interface Keyframe {
  composite?: CompositeOperationOrAuto;
  easing?: string;
  offset?: number | null;
  [property: string]: string | number | null | undefined;
}

export function camelToKebab(camelCase: string): string {
  return camelCase.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
