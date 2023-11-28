import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Voice from '@/components/Voice';
import VoiceFollower from '@/components/VoiceFollower';
import Noise from '@/components/Noise';

const maxBpm = 1080;

const wait = (timeout) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, timeout);
  });
};

export default function Home() {
  const [checkboxes, setCheckboxes] = useState([]);
  const [globalToggle, setGlobalToggle] = useState(false);
  const [bpm, setBpm] = useState(maxBpm / 2);
  const [voiceOneStepOffset, setVoiceOneStepOffset] = useState(0);
  const [voiceTwoStepOffset, setVoiceTwoStepOffset] = useState(0);
  const dlAnchorRef = useRef(null);
  const checkboxesRef = useRef([]);
  useEffect(() => {
    if (checkboxes) {
      checkboxesRef.current = checkboxes;
    }
  }, [checkboxes]);
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
          onChange={(e) => {
            setBpm(parseInt(e.target.value));
          }}
        />
        <label htmlFor="bpm" className="mb-3">
          BPM: {bpm}
        </label>
      </section>
      <section className="flex module-screen">
        <div className="sequencer">
          {[...Array(6).keys()].map((item, index) => {
            return (
              <span
                key={index}
                className="background-line"
                style={{
                  top: `${index * 8 * 2 + 6}px`,
                  left: 0,
                  width: '100%',
                  height: '2px'
                }}
              ></span>
            );
          })}
          {[...Array(16).keys()].map((item, index) => {
            return (
              <span
                key={index}
                className="background-line"
                style={{
                  top: 0,
                  left: `${index * 8 * 2 + 6}px`,
                  height: '100%',
                  width: '2px'
                }}
              ></span>
            );
          })}
          {[...Array(3).keys()].map((item, index) => {
            const colorIndex = index;
            return (
              <div className="dot-wrapper absolute w-full h-full">
                {checkboxes.map((boxRow, index) => {
                  const rowIndex = index;
                  return (
                    <div key={rowIndex}>
                      {boxRow.map((box, index) => {
                        const colIndex = index;
                        return (
                          <span
                            key={box.value}
                            className={`absolute sequencer-dot dot-${colorIndex} dot-${
                              box.on ? 'active' : 'inactive'
                            }`}
                            style={{
                              top: `${colIndex * 8 * 2 + 6 - 5}px`,
                              left: `${rowIndex * 8 * 2 + 6 - 5}px`,
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              transform:
                                colorIndex === 1
                                  ? `${1}px`
                                  : colorIndex === 2
                                  ? `${2}px`
                                  : 'none' // CHANGE THIS!!!
                            }}
                          ></span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>
      <section className="flex flex-col">
        <Voice
          id={0}
          checkboxes={checkboxes}
          setCheckboxes={setCheckboxes}
          globalToggle={globalToggle}
          bpm={bpm}
        />
        <VoiceFollower
          id={1}
          checkboxes={checkboxes}
          globalToggle={globalToggle}
          stepOffset={voiceOneStepOffset}
          setStepOffset={setVoiceOneStepOffset}
          bpm={bpm}
        />
        <VoiceFollower
          id={2}
          checkboxes={checkboxes}
          globalToggle={globalToggle}
          stepOffset={voiceTwoStepOffset}
          setStepOffset={setVoiceTwoStepOffset}
          bpm={bpm}
        />
      </section>
      <a href="" ref={dlAnchorRef} className="hidden">
        DL
      </a>
    </main>
  );
}
