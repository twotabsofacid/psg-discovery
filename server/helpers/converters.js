const toBinary = (dec) => {
  return (dec >>> 0).toString(2);
};

const midiToNum = (midi) => {
  return 440 * Math.pow(2, (midi - 69) / 12);
};

const numToMidi = (num) => {
  return 12 * Math.log2(num / 440) + 69;
};

const numToHex = (voiceNum, numToSend) => {
  // 4 to 1023
  const binaryToSend = (numToSend >>> 0).toString(2);
  const binaryToSendArr = binaryToSend.toString().padStart(10, '0').split('');
  const firstHexNum = parseInt(binaryToSendArr.slice(0, 3).join(''), 2)
    .toString(16)
    .toUpperCase();
  const secondHexNum = parseInt(binaryToSendArr.slice(3).join(''), 2)
    .toString(16)
    .toUpperCase();
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
  toBinary,
  midiToNum,
  numToMidi
};
