const waitFor = async (callback: () => void, timeout = 500) => {
  const step = 10;
  let timeSpent = 0;
  let timedOut = false;

  while (true) {
    try {
      await new Promise(resolve => setTimeout(resolve, step));
      timeSpent += step;
      callback();
      break;
    } catch {}
    if (timeSpent >= timeout) {
      timedOut = true;
      break;
    }
  }

  if (timedOut) {
    throw new Error('timeout');
  }
};

export default waitFor;
