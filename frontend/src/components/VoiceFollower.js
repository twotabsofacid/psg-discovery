import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
const maxBpm = 360;
const minOffset = -50;
const maxOffset = 50;
const minAmplitude = -8;
const maxAmplitude = 7;

// NOTE FOR SEAN!!!!
// TODOS
// Hook up lfo toggles so that
// 1) you're keeping track of current lfo, changing it every time
//    there's a step trigger
// 2) send those changes to /frequency endpoint and see if that works,
//    and isnt too many changes all happening at once

export default function VoiceFollower({ id, globalToggle, bpm }) {
  const [activeTick, setActiveTick] = useState(0);
  const [midiOffset, setMidiOffset] = useState(0);
  const [finegrainOffset, setFinegrainOffset] = useState(0);
  const [finegrainLfoOffset, setFinegrainLfoOffset] = useState(0);
  const [amplitude, setAmplitude] = useState(0);
  const [amplitudeOffset, setAmplitudeOffset] = useState(0);
  const [localBpm, setLocalBpm] = useState(0);
  const finegrainLfoRef = useRef(false);
  const finegrainNoiseyLfoRef = useRef(false);
  const amplitudeLfoRef = useRef(false);
  const amplitudeNoiseyLfoRef = useRef(false);
  const amplitudeRef = useRef(7);
  const amplitudeOffsetRef = useRef(0);
  const amplitudeOffsetAmountRef = useRef(0);
  const amplitudeOffsetDirRef = useRef(1);
  const bpmRef = useRef(maxBpm / 2);
  const midiOffsetRef = useRef(0);
  const finegrainOffsetRef = useRef(0);
  const finegrainLfoOffsetRef = useRef(0);
  const finegrainLfoOffsetAmountRef = useRef(0);
  const finegrainLfoOffsetDirRef = useRef(1);
  const activeTickRef = useRef(0);
  const transportRef = useRef(null);
  const setFrequency = async (_offset, _finegrainOffset) => {
    axios({
      method: 'post',
      url: 'http://localhost:1337/serial/frequency',
      data: {
        midiNumOffset: _offset,
        finegrainNumOffset: _finegrainOffset,
        id: id
      }
    })
      .then((res) => {})
      .catch((err) => {
        console.log('got error', err);
      });
  };
  const setVolume = async (level) => {
    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        url: 'http://localhost:1337/serial/volume',
        data: {
          volume: level,
          id: id
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
    // Do any LFO setting...
    if (finegrainLfoRef.current && finegrainLfoOffsetRef.current !== 0) {
      if (
        finegrainLfoOffsetDirRef.current === -1 &&
        finegrainLfoOffsetAmountRef.current <=
          finegrainOffsetRef.current - finegrainLfoOffsetRef.current
      ) {
        finegrainLfoOffsetDirRef.current = 1;
      } else if (
        finegrainLfoOffsetDirRef.current === 1 &&
        finegrainLfoOffsetAmountRef.current >=
          finegrainOffsetRef.current + finegrainLfoOffsetRef.current
      ) {
        finegrainLfoOffsetDirRef.current = -1;
      }
      finegrainLfoOffsetAmountRef.current += finegrainLfoOffsetDirRef.current;
      setFrequency(midiOffsetRef.current, finegrainLfoOffsetAmountRef.current)
        .then((res) => {})
        .catch((err) => {
          console.log('got error', err);
        });
    } else if (
      finegrainNoiseyLfoRef.current &&
      finegrainLfoOffsetRef.current !== 0
    ) {
      if (
        finegrainLfoOffsetDirRef.current === -1 &&
        finegrainLfoOffsetAmountRef.current <=
          finegrainOffsetRef.current - finegrainLfoOffsetRef.current
      ) {
        finegrainLfoOffsetDirRef.current = 1;
      } else if (
        finegrainLfoOffsetDirRef.current === 1 &&
        finegrainLfoOffsetAmountRef.current >=
          finegrainOffsetRef.current + finegrainLfoOffsetRef.current
      ) {
        finegrainLfoOffsetDirRef.current = -1;
      } else {
        finegrainLfoOffsetDirRef.current = Math.random() < 0.5 ? 1 : -1;
      }
      finegrainLfoOffsetAmountRef.current += finegrainLfoOffsetDirRef.current;
      setFrequency(midiOffsetRef.current, finegrainLfoOffsetAmountRef.current)
        .then((res) => {})
        .catch((err) => {
          console.log('got error', err);
        });
    }
    // Do any amplitude settings...
    if (amplitudeLfoRef.current && amplitudeOffsetRef.current !== 0) {
      if (
        Math.abs(amplitudeRef.current) +
          Math.abs(amplitudeOffsetAmountRef.current) >=
        Math.abs(amplitudeRef.current) + amplitudeOffsetRef.current
      ) {
        amplitudeOffsetDirRef.current *= -1;
      }
      amplitudeOffsetAmountRef.current += amplitudeOffsetDirRef.current;
    } else if (
      amplitudeNoiseyLfoRef.current &&
      amplitudeOffsetRef.current !== 0
    ) {
      if (
        Math.abs(amplitudeRef.current) +
          Math.abs(amplitudeOffsetAmountRef.current) >=
        Math.abs(amplitudeRef.current) + amplitudeOffsetRef.current
      ) {
        amplitudeOffsetDirRef.current *= -1;
      } else {
        amplitudeOffsetDirRef.current *= Math.random() > 0.5 ? -1 : 1;
      }
      amplitudeOffsetAmountRef.current += amplitudeOffsetDirRef.current;
    } else {
      amplitudeOffsetAmountRef.current = 0;
    }
    setVolume(
      Math.max(
        Math.min(15, amplitudeRef.current + amplitudeOffsetAmountRef.current),
        0
      )
    )
      .then((data) => {
        // console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [activeTick]);
  /**
   * BPM changes
   */
  useEffect(() => {
    setLocalBpm(bpm);
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
  useEffect(() => {
    bpmRef.current = localBpm;
    console.log('changed the bpm i guess', localBpm);
    if (transportRef.current) {
      clearInterval(transportRef.current);
      transportRef.current = null;
      transportRef.current = setInterval(() => {
        activeTickRef.current = (activeTickRef.current + 1) % 16;
        setActiveTick(activeTickRef.current);
      }, (60 / localBpm) * 1000);
    }
  }, [localBpm]);
  /**
   * Amplitude changes
   */
  useEffect(() => {
    amplitudeRef.current = 7 - amplitude;
  }, [amplitude]);
  /**
   * Amplitude Offset changes
   */
  useEffect(() => {
    amplitudeOffsetRef.current = amplitudeOffset;
  }, [amplitudeOffset]);
  /**
   * offset changes
   */
  useEffect(() => {
    midiOffsetRef.current = midiOffset;
    console.log(
      'offsets!!!',
      midiOffsetRef.current,
      finegrainOffsetRef.current
    );
    // Send updated offset to server
    setFrequency(midiOffsetRef.current, finegrainOffsetRef.current)
      .then((res) => {})
      .catch((err) => {
        console.log('got error', err);
      });
  }, [midiOffset]);
  /**
   * offset changes
   */
  useEffect(() => {
    finegrainOffsetRef.current = finegrainOffset;
    console.log(
      'offsets!!!',
      midiOffsetRef.current,
      finegrainOffsetRef.current
    );
    // Send updated offset to server
    setFrequency(midiOffsetRef.current, finegrainOffsetRef.current)
      .then((res) => {})
      .catch((err) => {
        console.log('got error', err);
      });
  }, [finegrainOffset]);
  /**
   * Finegrain LFO offset changes
   */
  useEffect(() => {
    finegrainLfoOffsetRef.current = finegrainLfoOffset;
  }, [finegrainLfoOffset]);
  return (
    <main className="h-auto flex flex-col m-3 p-3 border border-black">
      <div className="w-full flex justify-items-between pb-1 mb-6 border-b border-black">
        <h1 className="text-xl font-bold">voice {id}</h1>
      </div>
      <div className="flex w-full">
        <div className="w-[25%] px-3 flex flex-col justify-items-center items-center">
          <input
            type="range"
            name="offset"
            min={1}
            max={1080}
            step="1"
            value={localBpm}
            className="w-full"
            onChange={(e) => {
              setLocalBpm(parseInt(e.target.value));
            }}
          />
          <label htmlFor="offset" className="mb-3">
            BPM: {localBpm}
          </label>
        </div>
        <div className="w-[25%] px-3 flex flex-col justify-items-center items-center">
          <input
            type="range"
            name="offset"
            min={-10}
            max={10}
            step="1"
            value={finegrainOffset}
            className="w-full"
            onChange={(e) => {
              console.log('we should change...');
              setFinegrainOffset(parseInt(e.target.value));
            }}
          />
          <label htmlFor="offset" className="mb-3">
            Finegrain offset: {finegrainOffset}
          </label>
          <fieldset className="flex flex-col">
            <div className="flex justify-items-center items-center">
              <input
                type="radio"
                id={`finegrain-normal-${id}`}
                name={`finegrain-val-${id}`}
                onChange={() => {
                  finegrainLfoRef.current = false;
                  finegrainNoiseyLfoRef.current = false;
                }}
              />
              <label className="ml-2" htmlFor={`finegrain-normal-${id}`}>
                "Normal"
              </label>
            </div>
            <input
              type="range"
              name="lfoOffset"
              min={0}
              max={10}
              step="1"
              value={finegrainLfoOffset}
              className="w-full"
              onChange={(e) => {
                console.log('we should change...');
                setFinegrainLfoOffset(parseInt(e.target.value));
              }}
            />
            <label htmlFor="offset" className="mb-3">
              Finegrain LFO offset: {finegrainLfoOffset}
            </label>
            <div className="flex justify-items-center items-center">
              <input
                type="radio"
                id={`finegrain-lfo-${id}`}
                name={`finegrain-val-${id}`}
                onChange={() => {
                  finegrainNoiseyLfoRef.current = false;
                  finegrainLfoRef.current = true;
                }}
              />
              <label className="ml-2" htmlFor={`finegrain-lfo-${id}`}>
                LFO
              </label>
            </div>
            <div className="flex justify-items-center items-center">
              <input
                type="radio"
                id={`finegrain-noisey-${id}`}
                name={`finegrain-val-${id}`}
                onChange={() => {
                  finegrainLfoRef.current = false;
                  finegrainNoiseyLfoRef.current = true;
                }}
              />
              <label className="ml-2" htmlFor={`finegrain-noisey-${id}`}>
                Noisey LFO
              </label>
            </div>
          </fieldset>
        </div>
        <div className="w-[25%] px-3 flex flex-col justify-items-center items-center">
          <input
            type="range"
            name="offset"
            min={minOffset}
            max={maxOffset}
            value={midiOffset}
            className="w-full"
            onChange={(e) => {
              console.log('we should change...');
              setMidiOffset(parseInt(e.target.value));
            }}
          />
          <label htmlFor="offset" className="mb-3">
            Midi Offset: {midiOffset}
          </label>
        </div>
        <div className="w-[25%] px-3 flex flex-col justify-items-center items-center">
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
          <label htmlFor="amplitude" className="mb-3">
            Amplitude: {amplitude}
          </label>
          <fieldset className="flex flex-col w-full">
            <div className="flex justify-items-center items-center">
              <input
                type="radio"
                id={`amplitude-normal-${id}`}
                name={`amplitude-val-${id}`}
                onChange={() => {
                  amplitudeLfoRef.current = false;
                  amplitudeNoiseyLfoRef.current = false;
                }}
              />
              <label className="ml-2" htmlFor={`amplitude-normal-${id}`}>
                "Normal"
              </label>
            </div>
            <input
              type="range"
              name="amplitudeLfo"
              min={0}
              max={15}
              value={amplitudeOffset}
              step="1"
              className="w-full"
              onChange={(e) => {
                console.log('we should change...');
                setAmplitudeOffset(parseInt(e.target.value));
              }}
            />
            <label htmlFor="amplitude" className="mb-3">
              Amplitude Offset: {amplitudeOffset}
            </label>
            <div className="flex justify-items-center items-center">
              <input
                type="radio"
                id={`amplitude-lfo-${id}`}
                name={`amplitude-val-${id}`}
                onChange={() => {
                  amplitudeNoiseyLfoRef.current = false;
                  amplitudeLfoRef.current = true;
                }}
              />
              <label className="ml-2" htmlFor={`amplitude-lfo-${id}`}>
                LFO
              </label>
            </div>
            <div className="flex justify-items-center items-center">
              <input
                type="radio"
                id={`amplitude-noisey-${id}`}
                name={`amplitude-val-${id}`}
                onChange={() => {
                  amplitudeLfoRef.current = false;
                  amplitudeNoiseyLfoRef.current = true;
                }}
              />
              <label className="ml-2" htmlFor={`amplitude-noisey-${id}`}>
                Noisey LFO
              </label>
            </div>
          </fieldset>
        </div>
      </div>
    </main>
  );
}
