import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
const maxBpm = 1080;
const minNum = 0;
const maxNum = 1023;
const minMidi = 21;
const maxMidi = 127;
const minAmplitude = -8;
const maxAmplitude = 7;

export default function Voice({
  id,
  globalToggle,
  controlSelected,
  selected,
  firstKnobDown,
  firstKnobUp,
  secondKnobDown,
  secondKnobUp,
  bpm,
  setBpm
}) {
  const [activeTick, setActiveTick] = useState(0);
  const [numToSend, setNumToSend] = useState((minNum + maxNum) / 2);
  const [midi, setMidi] = useState(60);
  const [amplitude, setAmplitude] = useState(0);
  const amplitudeRef = useRef(7);
  const bpmRef = useRef(maxBpm / 2);
  const numToSendRef = useRef((minNum + maxNum) / 2);
  const activeTickRef = useRef(0);
  const transportRef = useRef(null);
  const setVolume = async (level) => {
    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        url: 'http://localhost:1337/serial/volume',
        data: {
          volume: level,
          id: id,
          numToSend: numToSendRef.current
        }
      })
        .then((res) => {
          // console.log('got response', res.data);
          resolve(res.data);
        })
        .catch((err) => {
          console.log('got error', err);
          reject(err);
        });
    });
  };
  useEffect(() => {
    if (!globalToggle) {
      clearInterval(transportRef.current);
      setActiveTick(0);
      activeTickRef.current = 0;
      transportRef.current = null;
      setTimeout(() => {
        setVolume(15)
          .then((data) => {
            // console.log(data);
          })
          .catch((err) => {
            console.log(err);
          });
      }, 500);
    } else {
      transportRef.current = setInterval(() => {
        activeTickRef.current = (activeTickRef.current + 1) % 16;
        setActiveTick(activeTickRef.current);
      }, (60 / bpmRef.current) * 1000);
    }
  }, [globalToggle]);
  /**
   * SEQUENCER TICKS
   */
  useEffect(() => {
    setVolume(amplitudeRef.current)
      .then((data) => {
        // console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [activeTick]);
  /**
   * Amplitude changes
   */
  useEffect(() => {
    amplitudeRef.current = 7 - amplitude;
  }, [amplitude]);
  /**
   * BPM changes
   */
  useEffect(() => {
    bpmRef.current = bpm;
    // console.log('changed the bpm i guess', bpm);
    if (transportRef.current) {
      clearInterval(transportRef.current);
      transportRef.current = null;
      transportRef.current = setInterval(() => {
        activeTickRef.current = (activeTickRef.current + 1) % 16;
        setActiveTick(activeTickRef.current);
      }, (60 / bpm) * 1000);
    }
  }, [bpm]);
  /**
   * FREQUENCY changes
   */
  useEffect(() => {
    numToSendRef.current = numToSend;
    // Send updated frequency to server
    axios({
      method: 'post',
      url: 'http://localhost:1337/serial/frequency',
      data: {
        numToSend: numToSendRef.current,
        id: id
      }
    })
      .then((res) => {
        // console.log('got response', res.data);
      })
      .catch((err) => {
        console.log('got error', err);
      });
  }, [numToSend]);
  /**
   * MIDI changes
   */
  useEffect(() => {
    const newNumToSend = 2000000 / (32 * 440 * Math.pow(2, (midi - 69) / 12));
    setNumToSend(newNumToSend);
  }, [midi]);
  /**
   * Set up midi stuff
   */
  useEffect(() => {
    const onMIDIMessage = (evt) => {
      console.log(evt.data);
      if (evt.data[0] === 144) {
        console.log('NOTE ON', evt.data[1]);
        setMidi(evt.data[1]);
        // Need to do something here with the note
        // to convert it to frequency (or whatever it is
        // that you're sending to the serial comms)
      }
    };
    const onMIDISuccess = (midiAccess) => {
      console.log('MIDI ready!');
      for (const entry of midiAccess.inputs) {
        const input = entry[1];
        console.log(
          `Input port [type:'${input.type}']` +
            ` id:'${input.id}'` +
            ` manufacturer:'${input.manufacturer}'` +
            ` name:'${input.name}'` +
            ` version:'${input.version}'`
        );
      }
      midiAccess.inputs.forEach((entry) => {
        entry.onmidimessage = onMIDIMessage;
      });
    };
    const onMIDIFailure = (msg) => {
      console.error(`Failed to get MIDI access - ${msg}`);
    };
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
  }, []);
  /**
   * OFFSET/AMP TOGGLIN'
   */
  useEffect(() => {
    if (firstKnobDown !== 0) {
      console.log('turn it down');
      if (selected) {
        bpmRef.current--;
        setBpm(bpmRef.current);
      }
    }
  }, [firstKnobDown]);
  useEffect(() => {
    if (firstKnobUp !== 0) {
      console.log('turn it up');
      if (selected) {
        bpmRef.current++;
        setBpm(bpmRef.current);
      }
    }
  }, [firstKnobUp]);
  /**
   * LFO TOGGLIN'
   */
  useEffect(() => {
    if (secondKnobDown !== 0) {
      if (selected) {
        setAmplitude(-amplitudeRef.current + 7 - 1);
      }
    }
  }, [secondKnobDown]);
  useEffect(() => {
    if (secondKnobUp !== 0) {
      if (selected) {
        setAmplitude(-amplitudeRef.current + 7 + 1);
      }
    }
  }, [secondKnobUp]);
  return (
    <main
      className="h-auto flex flex-col border border-black"
      style={{
        backgroundColor: selected ? '#cacaca' : ''
      }}
    >
      <div
        className="w-full flex justify-items-between border-b border-black"
        style={{
          display: !selected ? 'none' : 'block'
        }}
      >
        <h1 className="unit-header">voice {id}</h1>
      </div>
      <div className="flex w-full">
        <div className="hidden w-[50%] px-3 flex flex-col justify-items-center items-center">
          <div htmlFor="bpm" className="">
            BPM: {bpm}
          </div>
        </div>
        <div className="hidden w-[50%] px-3 flex flex-col justify-items-center items-center">
          <input
            type="range"
            name="midi"
            id="midi"
            min={minMidi}
            max={maxMidi}
            value={midi}
            className="w-full"
            onChange={(e) => {
              console.log('we should change...');
              setMidi(parseInt(e.target.value));
            }}
          />
          <label htmlFor="midi" className="">
            Midi: {midi}
          </label>
        </div>
        <div className="w-[50%] px-3 flex flex-col justify-items-center items-center">
          <input
            type="range"
            name="amplitude"
            min={0}
            max={maxBpm}
            value={bpm}
            step="1"
            className="w-full"
            onChange={(e) => {
              console.log('we should change...');
              setBpm(parseInt(e.target.value));
            }}
          />
          <label htmlFor="bpm" className="">
            Bpm: {bpm}
          </label>
        </div>
        <div className="w-[50%] px-3 flex flex-col justify-items-center items-center">
          <input
            type="range"
            name="amplitude"
            min={minAmplitude}
            max={maxAmplitude}
            value={amplitude}
            step="1"
            className="w-full"
            onChange={(e) => {
              console.log('we should change...');
              setAmplitude(parseInt(e.target.value));
            }}
          />
          <label htmlFor="amplitude" className="">
            Amplitude: {amplitude}
          </label>
        </div>
      </div>
    </main>
  );
}
