import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
export default function Noise() {
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
            onChange={(e) => {
              console.log(e.target.checked);
              axios({
                method: 'get',
                url: `http://localhost:1337/serial/noise/${
                  e.target.checked ? 'on' : 'off'
                }`
              }).then((res) => {
                console.log(res.data);
              });
            }}
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
            onChange={(e) => {
              console.log(e.target.checked);
            }}
          />
          <label className="ml-2" htmlFor="periodic-white">
            white/periodic
          </label>
        </div>
        <div className="flex grow">
          <fieldset className="flex flex-col">
            <div className="flex justify-items-center items-center">
              <input type="radio" id="pitch-low" name="pitch-val" />
              <label className="ml-2" htmlFor="pitch-low">
                low
              </label>
            </div>

            <div className="flex justify-items-center items-center">
              <input type="radio" id="pitch-med" name="pitch-val" />
              <label className="ml-2" htmlFor="pitch-med">
                medium
              </label>
            </div>

            <div className="flex justify-items-center items-center">
              <input type="radio" id="pitch-high" name="pitch-val" />
              <label className="ml-2" htmlFor="pitch-high">
                high
              </label>
            </div>
          </fieldset>
        </div>
      </div>
    </main>
  );
}
