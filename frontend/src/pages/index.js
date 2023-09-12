import { useState, useRef } from 'react';
import axios from 'axios';
import Voice from '@/components/Voice';
import Noise from '@/components/Noise';

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
  const downloadRef = useRef(null);
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
              })
              .catch((err) => {
                console.log('we got error', err);
              });
          }}
        >
          Download
        </button>
      </section>
      <section className="flex flex-col">
        <Voice id={0} globalToggle={globalToggle} download={download} />
        <Voice id={1} globalToggle={globalToggle} download={download} />
        <Voice id={2} globalToggle={globalToggle} download={download} />
        <Noise />
      </section>
    </main>
  );
}
