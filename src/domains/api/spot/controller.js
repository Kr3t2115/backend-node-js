const { queryPostition } = require("./queries");

// checking how many numbers after the decimal point are in the quantity willing to buy (maximum 1 decimal point)
const numberOfDecimalPlaces = (quantity) => {
  const quantityString = quantity.toString(); 
  const decimalPlaces = quantityString.indexOf('.') === -1 ? 0 : quantityString.split('.')[1].length;
  
  return decimalPlaces;
}

const priceAveraging = async (req, pairPrice) => {
  const pairPosition = await queryPostition(req.params.pair, req.user.id)

  const currentQuantity = pairPosition.quantity;
  const currentTotalPrice = pairPosition.purchase_price * currentQuantity;
  const newQuantity = currentQuantity + req.body.quantity;
  const newTotalPrice = currentTotalPrice + pairPrice * req.body.quantity;
  const averagePrice = newTotalPrice / newQuantity;

  return averagePrice;
}

module.exports = {numberOfDecimalPlaces, priceAveraging}