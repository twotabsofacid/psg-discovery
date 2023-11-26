import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Voice from '@/components/Voice';
import VoiceFollower from '@/components/VoiceFollower';
import Noise from '@/components/Noise';

const maxBpm = 1080;

export default function Home() {
  const [globalToggle, setGlobalToggle] = useState(false);
  const [bpm, setBpm] = useState(maxBpm / 2);
  const bpmRef = useRef(maxBpm / 2);
  const [voiceSelected, setVoiceSelected] = useState(1);
  const voiceSelectedRef = useRef(1);
  const [controlSelected, setControlSelected] = useState(0);
  const controlSelectedRef = useRef(0);
  const [typeToggle, setTypeToggle] = useState(0);
  const typeToggleRef = useRef(0);
  const [firstKnobDown, setFirstKnobDown] = useState(0);
  const [firstKnobUp, setFirstKnobUp] = useState(0);
  const firstKnobDownRef = useRef(0);
  const firstKnobUpRef = useRef(0);
  const [secondKnobUp, setSecondKnobUp] = useState(0);
  const [secondKnobDown, setSecondKnobDown] = useState(0);
  const secondKnobUpRef = useRef(0);
  const secondKnobDownRef = useRef(0);
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);
  useEffect(() => {
    const onKeydown = (e) => {
      console.log(e.key);
      // KNObS SIMULATED
      if (e.key === 'q' || e.key === 'w') {
        // BPM UP/DOWN
        if (e.key === 'q') {
          setBpm(bpmRef.current - 10);
        } else {
          setBpm(bpmRef.current + 10);
        }
      } else if (e.key === 'e' || e.key === 'r') {
        // AMP UP/DOWN
      } else if (e.key === 'z' || e.key === 'x') {
        // OFFSET or AMP on voice follower UP/DOWN
        if (e.key === 'z') {
          firstKnobDownRef.current--;
          setFirstKnobDown(firstKnobDownRef.current);
        } else {
          firstKnobUpRef.current++;
          setFirstKnobUp(firstKnobUpRef.current);
        }
      } else if (e.key === 'c' || e.key === 'v') {
        // LFO on voice follower UP/DOWN
        if (e.key === 'c') {
          secondKnobDownRef.current--;
          setSecondKnobDown(secondKnobDownRef.current);
        } else {
          secondKnobUpRef.current++;
          setSecondKnobUp(secondKnobUpRef.current);
        }
      }
      // BUTTONS SIMULATED
      if (e.key === 'a') {
        if (voiceSelectedRef.current === 0) {
          voiceSelectedRef.current = 1;
        } else if (voiceSelectedRef.current === 1) {
          if (controlSelectedRef.current === 0) {
            controlSelectedRef.current = 1;
          } else {
            controlSelectedRef.current = 0;
            voiceSelectedRef.current = 2;
          }
        } else {
          if (controlSelectedRef.current === 0) {
            controlSelectedRef.current = 1;
          } else {
            controlSelectedRef.current = 0;
            voiceSelectedRef.current = 0;
          }
        }
        // VOICE BUTTON
        setControlSelected(controlSelectedRef.current);
        setVoiceSelected(voiceSelectedRef.current);
        console.log(
          'we should have done this',
          voiceSelectedRef.current,
          controlSelectedRef.current
        );
      } else if (e.key === 's') {
        // TYPE SELECTOR
        typeToggleRef.current = typeToggleRef.current + 1;
        setTypeToggle(typeToggleRef.current);
      }
    };
    document.addEventListener('keydown', onKeydown);
    return () => {
      document.removeEventListener('keydown', onKeydown);
    };
  }, []);
  return (
    <main className="flex flex-col">
      <section className="flex m-3 items-center justify-center">
        <button
          className="p-3 bg-green-200 mx-3"
          onClick={() => {
            setGlobalToggle(true);
          }}
        >
          Start All
        </button>
        <button
          className="p-3 bg-red-200 mx-3"
          onClick={() => {
            setGlobalToggle(false);
          }}
        >
          Stop All
        </button>
        <input
          type="range"
          name="bpm"
          min="1"
          className="w-full"
          max={maxBpm}
          value={bpm}
          onChange={(e) => {
            setBpm(parseInt(e.target.value));
          }}
        />
        <label htmlFor="bpm" className="mb-3">
          BPM: {bpm}
        </label>
      </section>
      <section className="flex flex-col screen-container">
        <Voice
          id={0}
          selected={voiceSelected === 0}
          controlSelected={controlSelected}
          globalToggle={globalToggle}
          firstKnobDown={firstKnobDown}
          firstKnobUp={firstKnobUp}
          secondKnobUp={secondKnobUp}
          secondKnobDown={secondKnobDown}
          bpm={bpm}
          setBpm={setBpm}
        />
        <VoiceFollower
          selected={voiceSelected === 1}
          controlSelected={controlSelected}
          typeToggle={typeToggle}
          firstKnobDown={firstKnobDown}
          firstKnobUp={firstKnobUp}
          secondKnobUp={secondKnobUp}
          secondKnobDown={secondKnobDown}
          id={1}
          globalToggle={globalToggle}
          bpm={bpm}
        />
        <VoiceFollower
          selected={voiceSelected === 2}
          controlSelected={controlSelected}
          typeToggle={typeToggle}
          firstKnobDown={firstKnobDown}
          firstKnobUp={firstKnobUp}
          secondKnobUp={secondKnobUp}
          secondKnobDown={secondKnobDown}
          id={2}
          globalToggle={globalToggle}
          bpm={bpm}
        />
      </section>
    </main>
  );
}
