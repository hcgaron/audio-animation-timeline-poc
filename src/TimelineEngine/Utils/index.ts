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
      const keyframeRule = `${property}: ${value};`;
      return result + keyframeRule;
    }, "");
}

function attachAnimationToElementIfPresent(
  elementId: string,
  animationName: string
) {
  const element = document.getElementById(elementId.slice(1));
  if (!element) {
    return;
  }
  element.style.animationName = elementId.slice(1);
  element.style.animationName = animationName;
  element.style.animationDuration = "10s";
  element.style.animationPlayState = "paused";
}

// Function to create keyframes dynamically
export function createKeyframes(elementId: string, frames: Keyframe[]) {
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
  attachAnimationToElementIfPresent(elementId, animationName);
}

interface Keyframe {
  composite?: CompositeOperationOrAuto;
  easing?: string;
  offset?: number | null;
  [property: string]: string | number | null | undefined;
}
