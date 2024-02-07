import { useEffect, useState } from 'react';
import { useTimeline } from '../../TimelineEngine/hooks/useTimeline';
import { DelayedAnimatedElementExample } from './DelayedAnimatedElementExample';
import { Toolbar } from './Toolbar';
import { Placement, moveElement } from '../../TimelineEngine/TimelineProvider/util';

export function Home() {
  const { play, pause, isPlaying, registerTimelineCallback } = useTimeline();
  const [backgroundColor, setBackgroundColor] = useState('cyan');
  const [showDelayedElement, setShowDelayedElement] = useState(false);
  const audioSrc = 'https://cdn.freesound.org/previews/571/571367_2282212-lq.mp3';

  function handleMoveA() {
    const target1 = document.getElementById('button-a');
    const dot = document.getElementById('dot');

    if (!target1 || !dot) {
      return;
    }

    const target1Rect = target1.getBoundingClientRect();

    dot.animate(
      [
        {
          transform: `translate(${target1Rect.left - dot.offsetLeft}px, ${target1Rect.top - dot.offsetTop}px)`,
        },
      ],
      {
        duration: 500, // Adjust duration as needed
        fill: 'forwards', // Keeps the element in the final state of the animation
      },
    );
  }

  function handleMoveB() {
    const target1 = document.getElementById('button-d');
    const dot = document.getElementById('dot');
    if (!target1 || !dot) {
      return;
    }

    const target1Rect = target1.getBoundingClientRect();

    dot.animate(
      [
        {
          transform: `translate(${target1Rect.left - dot.offsetLeft}px, ${target1Rect.top - dot.offsetTop}px)`,
        },
      ],
      {
        duration: 500, // Adjust duration as needed
        fill: 'forwards', // Keeps the element in the final state of the animation
      },
    );
  }

  useEffect(() => {
    registerTimelineCallback(
      () => {
        setBackgroundColor('red');
      },
      1000,
      audioSrc,
    );

    registerTimelineCallback(
      () => {
        setBackgroundColor('orange');
      },
      2000,
      audioSrc,
    );

    registerTimelineCallback(
      () => {
        setBackgroundColor('green');
        setShowDelayedElement(true);
      },
      3000,
      audioSrc,
    );

    registerTimelineCallback(
      () => {
        setBackgroundColor('yellow');
      },
      4000,
      audioSrc,
    );

    registerTimelineCallback(
      () => {
        setBackgroundColor('violet');
      },
      5000,
      audioSrc,
    );

    registerTimelineCallback(
      () => {
        setBackgroundColor('cyan');
      },
      6000,
      audioSrc,
    );
  }, [registerTimelineCallback]);

  const placements: Placement[] = [
    'top-start',
    'top',
    'top-end',
    'right-start',
    'right',
    'right-end',
    'bottom-start',
    'bottom',
    'bottom-end',
    'left-start',
    'left',
    'left-end',
    'center',
  ];

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <button onClick={isPlaying ? pause : play}>
          {isPlaying ? 'PAUSE AUDIO' : 'PLAY AUDIO'}
        </button>
        <button onClick={() => handleMoveA()}>Move A</button>
        <button onClick={() => handleMoveB()}>Move D</button>
        {placements.map((placement) => (
          <button key={placement} onClick={() => moveElement('#dot', '#button-a', placement)}>
            Move {placement}
          </button>
        ))}
      </div>
      <div
        style={{
          width: '800px',
          height: '600px',
          margin: '0 auto',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '0',
          border: '1px solid black',
        }}
      >
        <Toolbar />
        <div
          style={{
            flex: 1,
            display: 'grid',
            placeContent: 'center',
          }}
        ></div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              id="a1"
              style={{
                height: '50px',
                width: '50px',
                backgroundColor,
                margin: '0 auto',
              }}
            ></div>
            <div
              id="dot"
              style={{
                position: 'absolute',
                border: '4px solid tomato',
                borderRadius: '50%',
                width: '6px',
                height: '6px',
              }}
            ></div>
            {/* <HandPointer id="hand" /> */}
          </div>
        </div>
        <div>{showDelayedElement && <DelayedAnimatedElementExample />}</div>
      </div>
    </>
  );
}
