import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
export default function Noise() {
  const noiseOn = useRef(false);
  const noiseType = useRef('white');
  const noiseShift = useRef('low');
  const noiseOnOffChange = (e) => {
    noiseOn.current = e.target.checked ? true : false;
    axios({
      method: 'post',
      url: `http://localhost:1337/serial/noise`,
      data: {
        on: noiseOn.current,
        noiseType: noiseType.current,
        noiseShift: noiseShift.current
      }
    })
      .then((res) => {
        console.log(res.data);
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
        on: noiseOn.current,
        noiseType: noiseType.current,
        noiseShift: noiseShift.current
      }
    })
      .then((res) => {
        console.log(res.data);
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
        on: noiseOn.current,
        noiseType: noiseType.current,
        noiseShift: noiseShift.current
      }
    })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log('got error', err);
      });
  };
  return (
    <main className="h-auto flex flex-col m-3 p-3 border border-black">
      <div className="w-full flex justify-items-between pb-1 mb-6 border-b border-black">
        <h1 className="text-xl font-bold">noise</h1>
      </div>
      <div className="w-full flex justify-items-center items-center grow">
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
    </main>
  );
}
