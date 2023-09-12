import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
const maxBpm = 360;
const minFreq = 0;
const maxFreq = 1023;

export default function Sequencer({ id, globalToggle, download }) {
  const [checkboxes, setCheckboxes] = useState([]);
  const [activeTick, setActiveTick] = useState(0);
  const [transportActive, setTransportActive] = useState(false);
  const [bpm, setBpm] = useState(maxBpm / 2);
  const [frequency, setFrequency] = useState((maxFreq + minFreq) / 2);
  const checkboxesRef = useRef([]);
  const bpmRef = useRef(maxBpm / 2);
  const frequencyRef = useRef((maxFreq + minFreq) / 2);
  const activeTickRef = useRef(0);
  const transportRef = useRef(null);
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
            console.log(data);
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
    console.log('should toggle', boxValue);
    let x = parseInt(boxValue.split(',')[0]);
    let y = parseInt(boxValue.split(',')[1]);
    checkboxesRef.current[x][y].on = !checkboxesRef.current[x][y].on;
    console.log(checkboxesRef);
  };
  const setVolume = async (level) => {
    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        url: 'http://localhost:1337/serial/volume',
        data: {
          volume: level,
          id: id,
          frequency: frequencyRef.current
        }
      })
        .then((res) => {
          console.log('got response', res.data);
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
            console.log(data);
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
    console.log('WE SHOULD PLAY', volToPlay);
    if (volToPlay) {
      // TODO SEND AXIOS POST REQUEST TO BACK END,
      // PLAY VOICE `ID` FREQ AT VOL
      setVolume(volToPlay.row)
        .then((data) => {
          console.log(data);
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
    console.log('changed the bpm i guess', bpm);
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
    frequencyRef.current = frequency;
    // Send updated frequency to server
    axios({
      method: 'post',
      url: 'http://localhost:1337/serial/frequency',
      data: {
        frequency: frequencyRef.current,
        id: id
      }
    })
      .then((res) => {
        console.log('got response', res.data);
        setVolume(15)
          .then((data) => {
            console.log(data);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log('got error', err);
      });
  }, [frequency]);
  useEffect(() => {
    // Store the data on the back end...
    console.log('we should store stuff on the back end...');
    axios({
      method: 'post',
      url: 'http://localhost:1337/data/store',
      data: {
        id: id,
        sequence: checkboxesRef.current
      }
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log('error', err);
      });
  }, [download]);
  /**
   * Create boxes
   */
  useEffect(() => {
    let checks = [];
    for (let i = 0; i < 16; i++) {
      checks[i] = [];
      for (let j = 0; j < 16; j++) {
        checks[i][j] = { value: `${i},${j}`, row: j, column: i, on: false };
      }
    }
    checkboxesRef.current = checks;
    setCheckboxes(checkboxesRef.current);
  }, []);
  return (
    <main className="h-auto flex flex-col m-3 p-3 border border-black">
      <div className="w-full flex justify-items-between pb-1 mb-6 border-b border-black">
        <h1 className="text-xl font-bold">voice {id}</h1>
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
          <input
            type="range"
            name="frequency"
            min={minFreq}
            max={maxFreq}
            className="w-full"
            onChange={(e) => {
              console.log('we should change...');
              setFrequency(parseInt(e.target.value));
            }}
          />
          <label htmlFor="frequency" className="mb-3">
            Frequency: {frequency}
          </label>
        </div>
        <div className="w-[80%] flex mx-auto">
          {checkboxes.map((boxRow, index) => {
            return (
              <div
                key={index}
                className={`flex flex-col tick-col ${
                  activeTick === index ? 'bg-blue-300' : ''
                }`}
              >
                <>
                  {boxRow.map((box) => {
                    return (
                      <input
                        key={box.value}
                        type="checkbox"
                        id={`box-${box.value}`}
                        value={box.value}
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
