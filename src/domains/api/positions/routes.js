const express = require("express");
const { querySpotPositions } = require("./queries");
const router = express.Router();

// funny ping pong answer function
router.get("/spot", async (req, res) => {

  const positions = await querySpotPositions(req.user.id);

  if(positions){
    res.status(200).json(positions);
    return;
  }
  res.status(200).json(null)
  
});

router.get("/spot/:pair", async (req, res) => {

  const pair = req.params.pair;

  const positions = await querySpotPositions(req.user.id, pair);

  if(positions){
    res.status(200).json(positions);
    return;
  }
  res.status(200).json(null)
  
});

module.exports = router;