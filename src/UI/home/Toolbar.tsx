export function Toolbar() {
  return (
    <div
      style={{
        backgroundColor: 'lightblue',
        height: '60px',
        display: 'flex',
        gap: '4px',
        padding: '5px 10px',
        alignItems: 'center',
      }}
    >
      <button id="button-a">A</button>
      <button id="button-b">B</button>
      <button id="button-c">C</button>
      <button id="button-d">D</button>
    </div>
  );
}
