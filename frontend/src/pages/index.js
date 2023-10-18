import { useState, useRef } from 'react';
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
  const [globalToggle, setGlobalToggle] = useState(false);
  const [bpm, setBpm] = useState(maxBpm / 2);
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
      <section className="flex flex-col">
        <Voice id={0} globalToggle={globalToggle} bpm={bpm} />
        <VoiceFollower id={1} globalToggle={globalToggle} bpm={bpm} />
        <VoiceFollower id={2} globalToggle={globalToggle} bpm={bpm} />
      </section>
    </main>
  );
}
