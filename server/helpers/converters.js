const toBinary = (dec) => {
  return (dec >>> 0).toString(2);
};

const midiToFrequency = (midi) => {
  return 440 * Math.pow(2, (midi - 69) / 12);
};

const frequencyToMidi = (frequency) => {
  return 12 * Math.log2(frequency / 440) + 69;
};

const frequencyToHex = (freq) => {
  // Frequency should go from 62 to 15625
  // this should get mapped to an int 4 1023
  // (but this calculation isnt one to one, its scaled)
  // frequency = 2000000/(32 * numToSend)
  // where numToSend is 4 to 1023
  // so equation is
  // (2000000)/(32 * freq) = numToSend
  // translates to a hex value
  // but a weird fucked up one
  // where lowest is 000,
  // highest is 87f,
  // but that 7 is the higest value
  // that can go in the second place there
  // so once you max that out you have to start incrementing
  // the first value (e.g. the one where 8 is largest)
  const numToSend = 2000000 / (32 * freq);
  const binaryToSend = (numToSend >>> 0).toString(2);
  const binaryToSendArr = binaryToSend.toString().padStart(10, '0').split('');
  console.log(numToSend, binaryToSendArr);
  const firstHexNum = parseInt(binaryToSendArr.slice(0, 3).join(''), 2)
    .toString(16)
    .toUpperCase();
  const secondHexNum = parseInt(binaryToSendArr.slice(3).join(''), 2)
    .toString(16)
    .toUpperCase();
  console.log('HEX TO SEND', freq, firstHexNum, secondHexNum);
  return [parseInt(firstHexNum, 16) + 0x80, parseInt(secondHexNum, 16)];
};

const numToHex = (voiceNum, numToSend) => {
  // 4 to 1023
  const binaryToSend = (numToSend >>> 0).toString(2);
  const binaryToSendArr = binaryToSend.toString().padStart(10, '0').split('');
  console.log(numToSend, binaryToSendArr);
  const firstHexNum = parseInt(binaryToSendArr.slice(0, 3).join(''), 2)
    .toString(16)
    .toUpperCase();
  const secondHexNum = parseInt(binaryToSendArr.slice(3).join(''), 2)
    .toString(16)
    .toUpperCase();
  console.log('NUM TO SEND', numToSend, firstHexNum, secondHexNum);
  if (voiceNum === 0) {
    return [parseInt(firstHexNum, 16) + 0x80, parseInt(secondHexNum, 16)];
  } else if (voiceNum === 1) {
    return [parseInt(firstHexNum, 16) + 0xa0, parseInt(secondHexNum, 16)];
  } else {
    return [parseInt(firstHexNum, 16) + 0xc0, parseInt(secondHexNum, 16)];
  }
};

module.exports = {
  numToHex,
  frequencyToHex,
  toBinary,
  midiToFrequency,
  frequencyToMidi
};
