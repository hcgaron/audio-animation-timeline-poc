import './App.css';
import { TimelineProvider } from './TimelineEngine/TimelineProvider';
import { timeline } from './Timeline';
import { Home } from './UI/home';

function App() {
  return (
    <TimelineProvider timelineDefinition={timeline}>
      <Home />
    </TimelineProvider>
  );
}

export default App;
