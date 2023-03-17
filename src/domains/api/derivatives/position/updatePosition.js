const express = require("express");
const {updateTPSL, getPosition } = require("../queries");
const getPairPrice = require("../../../../services/getPairPrice");
const { validateUpdateData } = require("../controller");
const router = express.Router();

// route responsible for updating futures positions
router.post("/position/update/:id", async(req, res) => {
  try {
    // declare data object
    const data = {
      takeProfit: req.body.takeProfit || null,
      stopLoss: req.body.stopLoss || null
    }

    // function that returns position data from the database
    const position = await getPosition(
      req.params.id, 
      req.user.id
    );

    if(!position){
      res.status(404).json({
        "error_message": "There was a problem retrieving position from the database",
        "error_code": 105
      });
      return; 
    }

    // function that returns the current price of the pair
    const pairPrice = await getPairPrice(position.pair);

    if (!pairPrice){
      res.status(404).json({
        "error_message": "There is a problem with the cryptocurrency pair you provided",
        "error_code": 100
      });
      return;
    }

    // function that returns true if there was a problem verifying the data provided by the user
    const validateError = validateUpdateData(
      position, 
      data, 
      pairPrice
    )

    if(validateError){
      res.status(404).json({
        "error_message": "There was a problem validation the data you entered",
        "error_code": validateError
      });
      return;
    }

    // function to update the take profit and stop loss of the position
    const updatePosition = await updateTPSL(data.takeProfit, data.stopLoss, req.params.id, req.user.id);

    if(!updatePosition){
      res.status(404).json({
        "error_message": "There was a problem with validation",
        "error_code": 14
      });
      return; 
    }

    res.status(200).json({
      "success": "Position updated successfully"
    })
  } catch (error) {
    console.log(error);
    res.status(404).json({
      "error": "An unexpected error occurred"
    })
  }
});

module.exports = router;