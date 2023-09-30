import { useState, useRef } from 'react';
import axios from 'axios';
import Voice from '@/components/Voice';
import VoiceFollower from '@/components/VoiceFollower';
import Noise from '@/components/Noise';

const maxBpm = 1080;

const wait = (timeout) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, timeout);
  });
};

export default function Home() {
  const [globalToggle, setGlobalToggle] = useState(false);
  const [download, setDownload] = useState(0);
  const [dataVoiceOne, setDataVoiceOne] = useState(null);
  const [dataVoiceTwo, setDataVoiceTwo] = useState(null);
  const [dataVoiceThree, setDataVoiceThree] = useState(null);
  const [dataNoise, setDataNoise] = useState(null);
  const [bpm, setBpm] = useState(maxBpm / 2);
  const downloadRef = useRef(null);
  const dlAnchorRef = useRef(null);
  const onReaderLoad = (e) => {
    if (e.target.result) {
      var obj = JSON.parse(e.target.result);
      setDataVoiceOne(obj[0]);
      setDataVoiceTwo(obj[1]);
      setDataVoiceThree(obj[2]);
      setDataNoise(obj[3]);
    }
  };
  return (
    <main className="flex flex-col">
      <section className="flex m-3 items-center justify-center">
        <button
          className="p-3 bg-green-200 mx-3"
          onClick={() => {
            setGlobalToggle(true);
          }}
        >
          Start All
        </button>
        <button
          className="p-3 bg-red-200 mx-3"
          onClick={() => {
            setGlobalToggle(false);
          }}
        >
          Stop All
        </button>
        <button
          className="p-3 bg-blue-200 mx-3"
          onClick={async () => {
            console.log('we fucking click this..');
            downloadRef.current = downloadRef.current + 1;
            setDownload(downloadRef.current);
            await wait(1000);
            axios({
              method: 'get',
              url: 'http://localhost:1337/data'
            })
              .then((res) => {
                console.log(res.data);
                var dataStr =
                  'data:text/json;charset=utf-8,' +
                  encodeURIComponent(JSON.stringify(res.data.data));
                dlAnchorRef.current.setAttribute('href', dataStr);
                dlAnchorRef.current.setAttribute('download', 'sequence.json');
                dlAnchorRef.current.click();
              })
              .catch((err) => {
                console.log('we got error', err);
              });
          }}
        >
          Download
        </button>
        <input
          type="file"
          id="myFile"
          name="filename"
          className="p-3 bg-yellow-200 mx-3"
          onChange={(e) => {
            var reader = new FileReader();
            reader.onload = onReaderLoad;
            if (typeof e.target.files[0] === 'object') {
              reader.readAsText(e.target.files[0]);
            }
          }}
        />
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
      </section>
      <section className="flex flex-col">
        <Voice
          id={0}
          globalToggle={globalToggle}
          download={download}
          data={dataVoiceOne}
          bpm={bpm}
        />
        <VoiceFollower
          id={1}
          globalToggle={globalToggle}
          download={download}
          data={dataVoiceTwo}
          bpm={bpm}
        />
        <VoiceFollower
          id={2}
          globalToggle={globalToggle}
          download={download}
          data={dataVoiceThree}
          bpm={bpm}
        />
        <Noise
          id={3}
          globalToggle={globalToggle}
          download={download}
          data={dataNoise}
          bpm={bpm}
        />
      </section>
      <a href="" ref={dlAnchorRef} className="hidden">
        DL
      </a>
    </main>
  );
}
