const wait = (timeout) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, timeout);
  });
};

module.exports = { wait };
