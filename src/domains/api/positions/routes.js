const express = require("express");
const { querySpotPositions } = require("./queries");
const router = express.Router();

// route returns the user's current positions
router.get("/spot", async (req, res) => {

  // function accepts the user id and returns the currently opened positions by the user
  const positions = await querySpotPositions(req.user.id);

  if(positions){
    res.status(200).json(positions);
    return;
  }
  res.status(200).json(null)
  
});

// route returns the current position of the user given in the argument
router.get("/spot/:pair", async (req, res) => {

  const pair = req.params.pair;

  // function accepts the user id and the pair accepted in the pararam, returns the currently open positions in a given pair by the user
  const positions = await querySpotPositions(req.user.id, pair);

  if(positions){
    res.status(200).json(positions);
    return;
  }
  res.status(200).json(null)
  
});

module.exports = router;