import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
const minStepOffset = 0;
const maxStepOffset = 16;

export default function VoiceFollower({
  id,
  globalToggle,
  checkboxes,
  bpm,
  stepOffset,
  setStepOffset,
  activeTickChange
}) {
  const [activeTick, setActiveTick] = useState(0);
  const [finegrainOffset, setFinegrainOffset] = useState(0);
  const checkboxesRef = useRef([]);
  const finegrainOffsetRef = useRef(0);
  const stepOffsetRef = useRef(0);
  const activeTickRef = useRef(0);
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
  /**
   * SEQUENCER TICKS
   */
  useEffect(() => {
    activeTickRef.current = activeTickChange;
    const volToPlay = checkboxesRef.current[activeTickRef.current]?.find(
      (box) => {
        return box.on;
      }
    );
    let volToPlayMapped = 15;
    if (volToPlay) {
      volToPlayMapped =
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
    }
    setTimeout(() => {
      setActiveTick(activeTickChange);
      setVolume(volToPlayMapped)
        .then((data) => {
          // console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }, (60 / bpm) * 1000 * stepOffsetRef.current);
  }, [activeTickChange]);
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
                        checked={box.on}
                        readOnly={true}
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
