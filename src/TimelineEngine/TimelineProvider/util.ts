/**
 * Function to get the X, Y delta between 2 elements
 * @param {HTMLElement} sourceEl - The first element
 * @param {HTMLElement} targetEl - The second element
 * @return {Object} An object containing the deltaX and deltaY
 */
export function getDelta(sourceEl: HTMLElement, targetEl: HTMLElement) {
  const sourceRect = sourceEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  const x = targetRect.left - sourceRect.left;
  const y = targetRect.top - sourceRect.top;

  return { x, y };
}

export type Alignment = 'start' | 'end';
// export type Side = 'top' | 'right' | 'bottom' | 'left';
// todo: remove center from side
export type Side = 'top' | 'right' | 'bottom' | 'left' | 'center';
export type AlignedPlacement = `${Side}-${Alignment}`;
export type Placement = Side | AlignedPlacement | 'center';

/**
 * Function to move a source element to a target element using the WAAPI api
 * @param {string} sourceSelector - The selector for the source element
 * @param {string} targetSelector - The selector for the target element
 * @param {Placement} anchorTo - The anchor point on the target element
 */
export function moveElement(
  sourceSelector: string,
  targetSelector: string,
  anchorTo: Placement = 'top-start'
) {
  const sourceEl = document.querySelector(sourceSelector) as HTMLElement;
  const targetEl = document.querySelector(targetSelector) as HTMLElement;

  if (!sourceEl || !targetEl) {
    console.error('Source or target element not found');
    return;
  }

  // reset
  sourceEl.style.transform = '';

  const destination = computeCoordsFromPlacement(
    sourceSelector,
    targetSelector,
    { placement: anchorTo }
  );

  console.log(destination);
  if (!destination) {
    console.error('Invalid placement');
    return;
  }

  sourceEl.animate(
    [
      { transform: 'translate(0, 0)' },
      { transform: `translate(${destination.x}px, ${destination.y}px)` },
    ],
    {
      duration: 1000,
      fill: 'forwards',
    }
  );
}

export type Axis = 'x' | 'y';
export type Coords = { [key in Axis]: number };
export type Length = 'width' | 'height';
export type Dimensions = { [key in Length]: number };
export type Rect = Coords & Dimensions;

export interface ElementRects {
  source: Rect;
  target: Rect;
}

export function getSide(placement: Placement): Side {
  return placement.split('-')[0] as Side;
}

export function getSideAxis(placement: Placement): Axis {
  return ['top', 'bottom'].includes(getSide(placement)) ? 'y' : 'x';
}

export function getAlignment(placement: Placement): Alignment | undefined {
  return placement.split('-')[1] as Alignment | undefined;
}

export function getAlignmentAxis(placement: Placement): Axis {
  return getOppositeAxis(getSideAxis(placement));
}

export function getOppositeAxis(axis: Axis): Axis {
  return axis === 'x' ? 'y' : 'x';
}

export function getAxisLength(axis: Axis): Length {
  return axis === 'y' ? 'height' : 'width';
}

export function computeCoordsFromPlacement(
  sourceSelector: string,
  targetSelector: string,
  {
    placement,
    sideOffset = 0,
    alignOffset = 0,
  }: { placement: Placement; sideOffset?: number; alignOffset?: number }
): Coords | undefined {
  const sourceEl = document.querySelector(sourceSelector);
  const targetEl = document.querySelector(targetSelector);

  if (!sourceEl || !targetEl) {
    console.error('Source or target element not found');
    return;
  }
  const source = sourceEl.getBoundingClientRect();
  const target = targetEl.getBoundingClientRect();
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === 'y';

  const commonX = target.x - source.x + target.width / 2 - source.width / 2;
  const commonY = target.y - source.y + target.height / 2 - source.height / 2;
  const commonAlign = target[alignLength] / 2 - source[alignLength] / 2;

  let coords: Coords;
  switch (side) {
    case 'top':
      coords = {
        x: commonX,
        y: target.y - source.y - source.height - sideOffset,
      };
      break;
    case 'bottom':
      coords = {
        x: commonX,
        y: target.y - source.y + target.height + sideOffset,
      };
      break;
    case 'right':
      coords = {
        x: target.x - source.x + target.width + sideOffset,
        y: commonY,
      };
      break;
    case 'left':
      coords = {
        x: target.x - source.x - source.width - sideOffset,
        y: commonY,
      };
      break;
    case 'center':
      coords = { x: commonX, y: commonY };
      break;
    default:
      coords = { x: target.x - source.x, y: target.y - source.y };
  }

  const alignment = getAlignment(placement);
  switch (alignment) {
    case 'start':
      if (side === 'right' || side === 'left') {
        coords[alignmentAxis] -=
          (commonAlign + alignOffset) * (isVertical ? -1 : 1);
      } else {
        coords[alignmentAxis] +=
          (commonAlign + alignOffset) * (isVertical ? -1 : 1);
      }
      break;
    case 'end':
      if (side === 'right' || side === 'left') {
        coords[alignmentAxis] +=
          (commonAlign + alignOffset) * (isVertical ? -1 : 1);
      } else {
        coords[alignmentAxis] -=
          (commonAlign + alignOffset) * (isVertical ? -1 : 1);
      }
      break;
    default:
  }

  return coords;
}
