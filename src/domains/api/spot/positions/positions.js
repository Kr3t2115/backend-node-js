const express = require('express');
const SSE = require('sse-node');
const router = express.Router();

router.get('/stream', (req, res) => {
  const sse = SSE(req, res);
  let counter = 0;
  const intervalId = setInterval(() => {
    if (!res.writable) {
      clearInterval(intervalId);
      return;
    }
    sse.send({ data: `Counter is ${counter++}` });
  }, 1000);
  res.on('close', () => {
    clearInterval(intervalId);
  });
});

module.exports = router;