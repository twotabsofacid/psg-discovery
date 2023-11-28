import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
const maxBpm = 360;
const minStepOffset = 0;
const maxStepOffset = 16;

export default function VoiceFollower({
  id,
  globalToggle,
  checkboxes,
  bpm,
  stepOffset,
  setStepOffset
}) {
  const [activeTick, setActiveTick] = useState(0);
  const [finegrainOffset, setFinegrainOffset] = useState(0);
  const checkboxesRef = useRef([]);
  const bpmRef = useRef(maxBpm / 2);
  const finegrainOffsetRef = useRef(0);
  const stepOffsetRef = useRef(0);
  const activeTickRef = useRef(0);
  const transportRef = useRef(null);
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
      setTimeout(() => {
        transportRef.current = setInterval(() => {
          activeTickRef.current = (activeTickRef.current + 1) % 16;
          setActiveTick(activeTickRef.current);
        }, (60 / bpmRef.current) * 1000);
      }, stepOffsetRef.current * (60 / bpmRef.current) * 1000);
    }
  }, [globalToggle]);
  /**
   * SEQUENCER TICKS
   */
  useEffect(() => {
    const volToPlay = checkboxesRef.current[activeTick]?.find((box) => {
      return box.on;
    });
    if (volToPlay) {
      // TODO SEND AXIOS POST REQUEST TO BACK END,
      // PLAY VOICE `ID` FREQ AT VOL
      let volToPlayMapped =
        volToPlay.row === 0
          ? 0
          : volToPlay.row === 1
          ? 2
          : volToPlay.row === 2
          ? 4
          : volToPlay.row === 3
          ? 6
          : volToPlay.row === 4
          ? 8
          : 15;
      setVolume(volToPlayMapped)
        .then((data) => {
          // console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
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
   * offset changes
   */
  useEffect(() => {
    finegrainOffsetRef.current = finegrainOffset;
    console.log('offsets!!!', finegrainOffsetRef.current);
    // Send updated offset to server
    axios({
      method: 'post',
      url: 'http://localhost:1337/serial/frequency',
      data: {
        midiNumOffset: 0,
        finegrainNumOffset: finegrainOffsetRef.current,
        id: id
      }
    })
      .then((res) => {
        // console.log('got response', res.data);
        setVolume(15)
          .then((data) => {
            // console.log(data);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log('got error', err);
      });
  }, [finegrainOffset]);
  /**
   * offset changes
   */
  useEffect(() => {
    console.log('set the offset...', stepOffset);
    stepOffsetRef.current = stepOffset;
  }, [stepOffset]);
  useEffect(() => {
    if (checkboxes) {
      checkboxesRef.current = checkboxes;
    }
  }, [checkboxes]);
  return (
    <main className="h-auto flex flex-col m-3 p-3 border border-black">
      <div className="w-full flex justify-items-between pb-1 mb-6 border-b border-black">
        <h1 className="text-xl font-bold">voice {id}</h1>
      </div>
      <div className="flex w-full">
        <div className="w-[20%] px-3 flex flex-col justify-items-center items-center">
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
          <input
            type="range"
            name="stepOffset"
            min={minStepOffset}
            max={maxStepOffset}
            value={stepOffset}
            step="0.25"
            className="w-full"
            onChange={(e) => {
              console.log('we should change...');
              setStepOffset(parseFloat(e.target.value));
            }}
          />
          <label htmlFor="stepOffset" className="mb-3">
            Step Offset: {stepOffset}
          </label>
        </div>
        <div className="w-[80%] flex mx-auto justify-between">
          {checkboxes.map((boxRow, index) => {
            return (
              <div
                key={index}
                className={`flex flex-col justify-between tick-col ${
                  activeTick === index ? 'bg-blue-300' : ''
                }`}
              >
                <>
                  {boxRow.map((box) => {
                    return (
                      <input
                        key={box.value}
                        type="checkbox"
                        value={box.value}
                        readOnly={true}
                        checked={box.on}
                        className={`tick ${
                          activeTick === index ? 'bg-blue-100' : 'bg-white'
                        }`}
                      ></input>
                    );
                  })}
                </>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
