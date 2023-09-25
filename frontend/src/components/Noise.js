import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
const maxBpm = 1080;

export default function Noise({ globalToggle }) {
  const noiseVol = useRef(0);
  const noiseType = useRef('white');
  const noiseShift = useRef('low');
  const [checkboxes, setCheckboxes] = useState([]);
  const [activeTick, setActiveTick] = useState(0);
  const [transportActive, setTransportActive] = useState(false);
  const [bpm, setBpm] = useState(maxBpm / 2);
  const checkboxesRef = useRef([]);
  const bpmRef = useRef(maxBpm / 2);
  const activeTickRef = useRef(0);
  const transportRef = useRef(null);
  const noiseOnOffChange = (e) => {
    noiseVol.current = e.target.checked ? 15 : 0;
    axios({
      method: 'post',
      url: `http://localhost:1337/serial/noise`,
      data: {
        volume: noiseVol.current,
        noiseType: noiseType.current,
        noiseShift: noiseShift.current
      }
    })
      .then((res) => {
        // console.log(res.data);
      })
      .catch((err) => {
        console.log('got error', err);
      });
  };
  const noiseTypeChange = (e) => {
    noiseType.current = e.target.checked ? 'periodic' : 'white';
    axios({
      method: 'post',
      url: `http://localhost:1337/serial/noise`,
      data: {
        volume: noiseVol.current,
        noiseType: noiseType.current,
        noiseShift: noiseShift.current
      }
    })
      .then((res) => {
        // console.log(res.data);
      })
      .catch((err) => {
        console.log('got error', err);
      });
  };
  const noiseShiftChange = (e) => {
    noiseShift.current = e.target.id.split('-')[1];
    axios({
      method: 'post',
      url: `http://localhost:1337/serial/noise`,
      data: {
        volume: noiseVol.current,
        noiseType: noiseType.current,
        noiseShift: noiseShift.current
      }
    })
      .then((res) => {
        // console.log(res.data);
      })
      .catch((err) => {
        console.log('got error', err);
      });
  };
  const toggleTransport = () => {
    if (transportRef.current) {
      setTransportActive(false);
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
      setTransportActive(true);
      transportRef.current = setInterval(() => {
        activeTickRef.current = (activeTickRef.current + 1) % 16;
        setActiveTick(activeTickRef.current);
      }, (60 / bpmRef.current) * 1000);
    }
  };
  const toggleBox = (boxValue) => {
    let x = parseInt(boxValue.split(',')[0]);
    let y = parseInt(boxValue.split(',')[1]);
    checkboxesRef.current[x][y].on = !checkboxesRef.current[x][y].on;
    setCheckboxes([...checkboxesRef.current]);
  };
  const setVolume = async (level) => {
    return new Promise((resolve, reject) => {
      noiseVol.current = level;
      axios({
        method: 'post',
        url: `http://localhost:1337/serial/volume`,
        data: {
          volume: level,
          id: 3
        }
      })
        .then((res) => {
          // console.log(res.data);
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
      setTransportActive(false);
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
      setTransportActive(true);
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
          ? 10
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
   * Create boxes
   */
  useEffect(() => {
    let checks = [];
    for (let i = 0; i < 16; i++) {
      checks[i] = [];
      for (let j = 0; j < 5; j++) {
        checks[i][j] = { value: `${i},${j}`, row: j, column: i, on: false };
      }
    }
    checkboxesRef.current = checks;
    setCheckboxes(checkboxesRef.current);
  }, []);
  return (
    <main className="h-auto flex flex-col m-3 p-3 border border-black">
      <div className="w-full flex justify-items-between pb-1 mb-6 border-b border-black">
        <h1 className="text-xl font-bold">noise</h1>
      </div>
      <div className="w-full flex justify-items-center items-center grow mb-6">
        <div className="flex grow justify-items-center items-center">
          <input
            type="checkbox"
            name="on-off"
            id="on-off"
            className="toggle w-full"
            value={1}
            onChange={noiseOnOffChange}
          />
          <label className="ml-2" htmlFor="on-off">
            off/on
          </label>
        </div>
        <div className="flex grow justify-items-center items-center">
          <input
            type="checkbox"
            name="periodic-white"
            id="periodic-white"
            className="toggle w-full"
            onChange={noiseTypeChange}
          />
          <label className="ml-2" htmlFor="periodic-white">
            white/periodic
          </label>
        </div>
        <div className="flex grow">
          <fieldset className="flex flex-col">
            <div className="flex justify-items-center items-center">
              <input
                type="radio"
                id="shift-low"
                name="shift-val"
                onChange={noiseShiftChange}
              />
              <label className="ml-2" htmlFor="shift-low">
                low
              </label>
            </div>
            <div className="flex justify-items-center items-center">
              <input
                type="radio"
                id="shift-med"
                name="shift-val"
                onChange={noiseShiftChange}
              />
              <label className="ml-2" htmlFor="shift-med">
                medium
              </label>
            </div>
            <div className="flex justify-items-center items-center">
              <input
                type="radio"
                id="shift-high"
                name="shift-val"
                onChange={noiseShiftChange}
              />
              <label className="ml-2" htmlFor="shift-high">
                high
              </label>
            </div>
            <div className="flex justify-items-center items-center">
              <input
                type="radio"
                id="shift-gen3"
                name="shift-val"
                onChange={noiseShiftChange}
              />
              <label className="ml-2" htmlFor="shift-gen3">
                Gen 3
              </label>
            </div>
          </fieldset>
        </div>
      </div>
      <div className="flex w-full">
        <div className="w-[20%] px-3 flex flex-col justify-items-center items-center">
          <button
            onClick={toggleTransport}
            className={`p-3 mb-3 ${
              transportActive ? 'bg-red-200' : 'bg-green-200'
            }`}
          >
            {transportActive ? 'Stop' : 'Start'}
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
                        className={`tick ${
                          activeTick === index ? 'bg-blue-100' : 'bg-white'
                        }`}
                        onChange={(e) => {
                          toggleBox(box.value);
                        }}
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
