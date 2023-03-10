const { queryPostition } = require("./queries");

const priceAveraging = async (req, pairPrice) => {
  const pairPosition = await queryPostition(req.params.pair, req.user.id)

  const currentQuantity = pairPosition.quantity;
  const currentTotalPrice = pairPosition.purchasePrice * currentQuantity;
  const newQuantity = currentQuantity + req.body.quantity;
  const newTotalPrice = currentTotalPrice + pairPrice * req.body.quantity;
  const averagePrice = newTotalPrice / newQuantity;
  console.log(req.params.pair, req.user.id)
  return averagePrice;
}

module.exports = {priceAveraging}