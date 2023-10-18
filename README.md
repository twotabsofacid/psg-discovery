# PSG Discovery

Programmable Sound Generator discover application

## Todos

Functionality

- Start implementing...
  - ~Fine grain offset has a button for lfo or not, when lfo it applies the offset as a triangle wave changing by 1 each step. So, e.g., if you have finegrain offset of 3 it would go offset 0, offset 1, offset 2, offset 3, offset 2, offset 1, offset 0, offset -1, etc and so on (doing this on each step)~
  - ~Same thing, but with a NOISEY lfo offset~
  - ~Same things for amplitude~
  - ~Get rid of step sequencer entirely (just for this! do it on a different branch)~
    - ~Just take midi in~
- Add BPM individually controllable
- ~FIX THAT FUCKIN BUG WHERE FINEGRAIN OFFSET GOES CRAZY AS HELL~
- ~Break out amplitude and finegrain offset into two sliders, one for main and another for LFO (so that the lfo bounced around the main offset)~
- Implement download for settings
- Scale the BPM with the big one at the top

UI

- Simple interface for a few knobs
  - should work with midi
