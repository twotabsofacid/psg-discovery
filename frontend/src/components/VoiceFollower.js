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

export default function VoiceFollower({
  selected,
  controlSelected,
  typeToggle,
  firstKnobDown,
  firstKnobUp,
  secondKnobDown,
  secondKnobUp,
  id,
  globalToggle,
  bpm
}) {
  const [activeTick, setActiveTick] = useState(0);
  const [finegrainOffset, setFinegrainOffset] = useState(0);
  const [finegrainLfoOffset, setFinegrainLfoOffset] = useState(0);
  const [amplitude, setAmplitude] = useState(0);
  const [amplitudeOffset, setAmplitudeOffset] = useState(0);
  const [offsetType, setOffsetType] = useState('normal');
  const [amplitudeType, setAmplitudeType] = useState('normal');
  const offsetTypeRef = useRef('normal');
  const amplitudeTypeRef = useRef('normal');
  const amplitudeRef = useRef(7);
  const amplitudeOffsetRef = useRef(0);
  const amplitudeOffsetAmountRef = useRef(0);
  const amplitudeOffsetDirRef = useRef(1);
  const bpmRef = useRef(maxBpm / 2);
  const finegrainOffsetRef = useRef(0);
  const finegrainLfoOffsetRef = useRef(0);
  const finegrainLfoOffsetAmountRef = useRef(0);
  const finegrainLfoOffsetDirRef = useRef(1);
  const activeTickRef = useRef(0);
  const transportRef = useRef(null);
  const setFrequency = async (_finegrainOffset) => {
    axios({
      method: 'post',
      url: 'http://localhost:1337/serial/frequency',
      data: {
        midiNumOffset: 0,
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
    if (
      offsetTypeRef.current === 'lfo' &&
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
      }
      finegrainLfoOffsetAmountRef.current += finegrainLfoOffsetDirRef.current;
      setFrequency(finegrainLfoOffsetAmountRef.current)
        .then((res) => {})
        .catch((err) => {
          console.log('got error', err);
        });
    } else if (
      offsetTypeRef.current === 'noisey' &&
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
      setFrequency(finegrainLfoOffsetAmountRef.current)
        .then((res) => {})
        .catch((err) => {
          console.log('got error', err);
        });
    } else {
      setFrequency(finegrainOffsetRef.current)
        .then((res) => {})
        .catch((err) => {
          console.log('got error', err);
        });
    }
    // Do any amplitude settings...
    if (
      amplitudeTypeRef.current === 'lfo' &&
      amplitudeOffsetRef.current !== 0
    ) {
      if (
        Math.abs(amplitudeRef.current) +
          Math.abs(amplitudeOffsetAmountRef.current) >=
        Math.abs(amplitudeRef.current) + amplitudeOffsetRef.current
      ) {
        amplitudeOffsetDirRef.current *= -1;
      }
      amplitudeOffsetAmountRef.current += amplitudeOffsetDirRef.current;
    } else if (
      amplitudeTypeRef.current === 'noisey' &&
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
    finegrainOffsetRef.current = finegrainOffset;
    console.log('offsets!!!', finegrainOffsetRef.current);
    // Send updated offset to server
    setFrequency(finegrainOffsetRef.current)
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
  /**
   * Type Togglin'
   */
  useEffect(() => {
    if (typeToggle !== 0) {
      console.log('should we change something???');
      if (selected) {
        if (controlSelected === 0) {
          if (offsetTypeRef.current === 'normal') {
            offsetTypeRef.current = 'lfo';
            setOffsetType(offsetTypeRef.current);
          } else if (offsetTypeRef.current === 'lfo') {
            offsetTypeRef.current = 'noisey';
            setOffsetType(offsetTypeRef.current);
          } else {
            offsetTypeRef.current = 'normal';
            setOffsetType(offsetTypeRef.current);
          }
        } else {
          if (amplitudeTypeRef.current === 'normal') {
            amplitudeTypeRef.current = 'lfo';
            setAmplitudeType(amplitudeTypeRef.current);
          } else if (amplitudeTypeRef.current === 'lfo') {
            amplitudeTypeRef.current = 'noisey';
            setAmplitudeType(amplitudeTypeRef.current);
          } else {
            amplitudeTypeRef.current = 'normal';
            setAmplitudeType(amplitudeTypeRef.current);
          }
        }
      }
    }
  }, [typeToggle]);
  /**
   * OFFSET/AMP TOGGLIN'
   */
  useEffect(() => {
    if (firstKnobDown !== 0) {
      console.log('turn it down');
      if (selected) {
        if (controlSelected === 0) {
          setFinegrainOffset(finegrainOffsetRef.current - 1);
        } else {
          console.log(amplitudeRef.current);
          setAmplitude(-amplitudeRef.current + 7 - 1);
        }
      }
    }
  }, [firstKnobDown]);
  useEffect(() => {
    if (firstKnobUp !== 0) {
      console.log('turn it up');
      if (selected) {
        if (controlSelected === 0) {
          setFinegrainOffset(finegrainOffsetRef.current + 1);
        } else {
          setAmplitude(-amplitudeRef.current + 7 + 1);
        }
      }
    }
  }, [firstKnobUp]);
  /**
   * LFO TOGGLIN'
   */
  useEffect(() => {
    if (secondKnobDown !== 0) {
      if (selected) {
        if (controlSelected === 0) {
          setFinegrainLfoOffset(finegrainLfoOffsetRef.current - 1);
        } else {
          setAmplitudeOffset(amplitudeOffsetRef.current - 1);
        }
      }
    }
  }, [secondKnobDown]);
  useEffect(() => {
    if (secondKnobUp !== 0) {
      if (selected) {
        if (controlSelected === 0) {
          setFinegrainLfoOffset(finegrainLfoOffsetRef.current + 1);
        } else {
          setAmplitudeOffset(amplitudeOffsetRef.current + 1);
        }
      }
    }
  }, [secondKnobUp]);
  return (
    <main
      className={`h-auto flex flex-col border border-black`}
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
        <div className="w-[50%] px-1 flex flex-col">
          <fieldset className="text-center">
            <button
              className="bg-neutral-400"
              style={{
                backgroundColor:
                  selected && controlSelected === 0 ? '#f56500' : ''
              }}
              onClick={() => {
                if (offsetTypeRef.current === 'normal') {
                  offsetTypeRef.current = 'lfo';
                  setOffsetType(offsetTypeRef.current);
                } else if (offsetTypeRef.current === 'lfo') {
                  offsetTypeRef.current = 'noisey';
                  setOffsetType(offsetTypeRef.current);
                } else {
                  offsetTypeRef.current = 'normal';
                  setOffsetType(offsetTypeRef.current);
                }
              }}
            >
              {offsetType}
            </button>
          </fieldset>
          <div className="w-[100%] mt-3 flex flex-col justify-items-start">
            <div className="w-[100%] flex flex-col self-start">
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
              <label htmlFor="offset" className="mb-1">
                offset: {finegrainOffset}
              </label>
            </div>
            <div className="w-[100%] flex flex-col">
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
              <label htmlFor="offset" className="mb-1">
                lfo: {finegrainLfoOffset}
              </label>
            </div>
          </div>
        </div>
        <div className="w-[50%] px-1 flex flex-col justify-items-center items-center">
          <fieldset className="text-center">
            <button
              className="bg-neutral-400"
              style={{
                backgroundColor:
                  selected && controlSelected === 1 ? '#f56500' : ''
              }}
              onClick={() => {
                if (amplitudeTypeRef.current === 'normal') {
                  amplitudeTypeRef.current = 'lfo';
                  setAmplitudeType(amplitudeTypeRef.current);
                } else if (amplitudeTypeRef.current === 'lfo') {
                  amplitudeTypeRef.current = 'noisey';
                  setAmplitudeType(amplitudeTypeRef.current);
                } else {
                  amplitudeTypeRef.current = 'normal';
                  setAmplitudeType(amplitudeTypeRef.current);
                }
              }}
            >
              {amplitudeType}
            </button>
          </fieldset>
          <div className="w-[100%] mt-3 flex flex-col justify-items-start">
            <div className="w-[100%] flex flex-col self-start">
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
              <label htmlFor="amplitude" className="mb-1">
                amp: {amplitude}
              </label>
            </div>
            <div className="w-[100%] flex flex-col self-start">
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
              <label htmlFor="amplitude" className="mb-1">
                lfo: {amplitudeOffset}
              </label>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
