const { queryPostition } = require("./queries");

const priceAveraging = async (req, pairPrice) => {
  const pairPosition = await queryPostition(req.params.pair, req.user.id)

  const currentQuantity = pairPosition.quantity;
  const currentTotalPrice = pairPosition.purchase_price * currentQuantity;
  const newQuantity = currentQuantity + req.body.quantity;
  const newTotalPrice = currentTotalPrice + pairPrice * req.body.quantity;
  const averagePrice = newTotalPrice / newQuantity;

  return averagePrice;
}

module.exports = {priceAveraging}