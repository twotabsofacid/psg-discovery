import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
const maxBpm = 360;
const minFreq = 0;
const maxFreq = 1023;
const minMidi = 21;
const maxMidi = 127;

export default function Voice({ id, globalToggle, download, data, bpm }) {
  const [checkboxes, setCheckboxes] = useState([]);
  const [activeTick, setActiveTick] = useState(0);
  const [transportActive, setTransportActive] = useState(false);
  const [frequency, setFrequency] = useState((maxFreq + minFreq) / 2);
  const [midi, setMidi] = useState(60);
  const midiRef = useRef(60);
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
  }, [frequency]);
  /**
   * MIDI changes
   */
  useEffect(() => {
    const numToSend = 2000000 / (32 * 440 * Math.pow(2, (midi - 69) / 12));
    console.log('we should send num', numToSend);
    frequencyRef.current = numToSend;
    // Send updated frequency to server
    axios({
      method: 'post',
      url: 'http://localhost:1337/serial/frequency',
      data: {
        frequency: numToSend,
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
  }, [midi]);
  /**
   * DOWNLOAD
   * Store stuff in storage on back end
   */
  useEffect(() => {
    axios({
      method: 'post',
      url: 'http://localhost:1337/data/store',
      data: {
        id: id,
        sequence: checkboxesRef.current
      }
    })
      .then((res) => {
        // console.log(res);
      })
      .catch((err) => {
        console.log('error', err);
      });
  }, [download]);
  /**
   * DATA
   * Load in data
   */
  useEffect(() => {
    if (data) {
      checkboxesRef.current = data;
      setCheckboxes([...checkboxesRef.current]);
    }
  }, [data]);
  /**
   * Create boxes, set up midi stuff
   */
  useEffect(() => {
    let checks = [];
    for (let i = 0; i < 16; i++) {
      checks[i] = [];
      for (let j = 0; j < 6; j++) {
        checks[i][j] = { value: `${i},${j}`, row: j, column: i, on: false };
      }
    }
    checkboxesRef.current = checks;
    setCheckboxes(checkboxesRef.current);
    const onMIDIMessage = (evt) => {
      console.log(evt.data);
      if (evt.data[0] === 144) {
        console.log('NOTE ON', evt.data[1]);
        const numToSend =
          2000000 / (32 * 440 * Math.pow(2, (evt.data[1] - 69) / 12));
        setFrequency(numToSend);
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
  return (
    <main className="h-auto flex flex-col m-3 p-3 border border-black">
      <div className="w-full flex justify-items-between pb-1 mb-6 border-b border-black">
        <h1 className="text-xl font-bold">voice {id}</h1>
      </div>
      <div className="flex w-full">
        <div className="w-[20%] px-3 flex flex-col justify-items-center items-center">
          {/* <button
            onClick={toggleTransport}
            className={`p-3 mb-3 ${
              transportActive ? 'bg-red-200' : 'bg-green-200'
            }`}
          >
            {transportActive ? 'Stop' : 'Start'}
          </button> */}
          <div htmlFor="bpm" className="mb-3">
            BPM: {bpm}
          </div>
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
          <label htmlFor="midi" className="mb-3">
            Midi: {midi}
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
