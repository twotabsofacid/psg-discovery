import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
const maxBpm = 360;
const minNum = 0;
const maxNum = 1023;
const minMidi = 21;
const maxMidi = 127;

export default function Voice({
  id,
  globalToggle,
  checkboxes,
  setCheckboxes,
  bpm,
  activeTick,
  setActiveTick
}) {
  const [numToSend, setNumToSend] = useState((minNum + maxNum) / 2);
  const [midi, setMidi] = useState(60);
  const [manipulateCol, setManipulateCol] = useState(0);
  const manipulateColRef = useRef(0);
  const checkboxesRef = useRef([]);
  const bpmRef = useRef(maxBpm / 2);
  const numToSendRef = useRef((minNum + maxNum) / 2);
  const activeTickRef = useRef(0);
  const transportRef = useRef(null);
  const toggleBox = (x, y) => {
    checkboxesRef.current[x][y].on = !checkboxesRef.current[x][y].on;
    setCheckboxes([...checkboxesRef.current]);
  };
  const switchBox = (x, y, on = false) => {
    checkboxesRef.current[x][y].on = on;
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
        console.log('active tick set to', activeTickRef.current);
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
  }, [numToSend]);
  /**
   * MIDI changes
   */
  useEffect(() => {
    const newNumToSend = 2000000 / (32 * 440 * Math.pow(2, (midi - 69) / 12));
    setNumToSend(newNumToSend);
  }, [midi]);
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
  useEffect(() => {
    const press = (e) => {
      if (e.key === 'z' || e.key === 'x') {
        if (e.key === 'z') {
          manipulateColRef.current--;
          manipulateColRef.current = (manipulateColRef.current + 16) % 16;
          setManipulateCol(manipulateColRef.current);
        } else {
          manipulateColRef.current++;
          manipulateColRef.current = (manipulateColRef.current + 16) % 16;
          setManipulateCol(manipulateColRef.current);
        }
      } else if (e.key === 'c' || e.key === 'v') {
        // Find if the col has anything active...
        const row = checkboxesRef.current[manipulateColRef.current].filter(
          (item) => {
            return item.on;
          }
        );
        console.log('anything in row..', row);
        let moveNum = 5;
        if (row.length) {
          moveNum = row[0].row;
        }
        if (e.key === 'c') {
          moveNum++;
          moveNum = (moveNum + 6) % 6;
        } else {
          moveNum--;
          moveNum = (moveNum + 6) % 6;
        }
        for (let i = 0; i < 6; i++) {
          switchBox(manipulateColRef.current, i, false);
        }
        switchBox(manipulateColRef.current, moveNum, true);
      }
    };
    window.addEventListener('keydown', press);
    return () => {
      window.removeEventListener('keydown', press);
    };
  }, []);
  return (
    <main className="h-auto flex flex-col m-3 p-3 border border-black">
      <div className="w-full flex justify-items-between pb-1 mb-6 border-b border-black">
        <h1 className="text-xl font-bold">voice {id}</h1>
      </div>
      <div className="flex w-full">
        <div className="w-[20%] px-3 flex flex-col justify-items-center items-center">
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
                className={`flex flex-col justify-between tick-col relative ${
                  activeTick === index ? 'bg-blue-300' : ''
                } ${manipulateCol === index ? 'manipulate' : ''}`}
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
                          toggleBox(
                            box.value.split(',')[0],
                            box.value.split(',')[1]
                          );
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
