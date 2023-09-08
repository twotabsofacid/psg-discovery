import { useState } from 'react';
import Voice from '@/components/Voice';
import Noise from '@/components/Noise';
export default function Home() {
  const [globalToggle, setGlobalToggle] = useState(false);
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
      </section>
      <section className="flex flex-col">
        <Voice id={0} globalToggle={globalToggle} />
        <Voice id={1} globalToggle={globalToggle} />
        <Voice id={2} globalToggle={globalToggle} />
        <Noise />
      </section>
    </main>
  );
}
