import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
const maxBpm = 360;

export default function Sequencer({ id }) {
  const [checkboxes, setCheckboxes] = useState([]);
  const [activeTick, setActiveTick] = useState(0);
  const [transportActive, setTransportActive] = useState(false);
  const [bpm, setBpm] = useState(maxBpm / 2);
  const checkboxesRef = useRef([]);
  const bpmRef = useRef(maxBpm / 2);
  const activeTickRef = useRef(0);
  const transportRef = useRef(null);
  const toggleTransport = () => {
    if (transportRef.current) {
      setTransportActive(false);
      clearInterval(transportRef.current);
      setActiveTick(0);
      activeTickRef.current = 0;
      transportRef.current = null;
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
  useEffect(() => {
    const volToPlay = checkboxesRef.current[activeTick]?.find((box) => {
      return box.on;
    });
    console.log('WE SHOULD PLAY', volToPlay);
    if (volToPlay) {
      // TODO SEND AXIOS POST REQUEST TO BACK END,
      // PLAY VOICE `ID` FREQ AT VOL
      axios({
        method: 'post',
        url: 'http://localhost:1337/serial/volume',
        data: {
          volume: 15 - volToPlay.row,
          id: id
        }
      })
        .then((res) => {
          console.log('got response', res);
        })
        .catch((err) => {
          console.log('got error', err);
        });
    }
  }, [activeTick]);
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
    <section className="flex">
      <div className="w-[20vw] flex flex-col">
        <button
          onClick={toggleTransport}
          className={`p-3 ${transportActive ? 'bg-red-200' : 'bg-green-200'}`}
        >
          {transportActive ? 'Stop' : 'Start'}
        </button>
        <input
          type="range"
          id="bpm"
          name="bpm"
          min="1"
          max={maxBpm}
          onChange={(e) => {
            setBpm(parseInt(e.target.value));
          }}
        />
        <label htmlFor="bpm">BPM: {bpm}</label>
      </div>
      <div className="w-[80vw] flex">
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
                      className={`${
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
    </section>
  );
}
