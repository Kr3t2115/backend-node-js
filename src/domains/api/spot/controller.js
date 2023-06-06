const { getPostition, updatePosition, insertPosition } = require("./queries");

// function that calculates the average price, based on the current position and what the user buys
const calculatePriceAverage = async (req, pairPrice) => {
  const pairPosition = await getPostition(req.params.pair, req.user.id)

  const currentQuantity = pairPosition.quantity;
  const currentTotalPrice = pairPosition.purchasePrice * currentQuantity;
  const newQuantity = currentQuantity + req.body.quantity;
  const newTotalPrice = currentTotalPrice + pairPrice * req.body.quantity;
  const averagePrice = newTotalPrice / newQuantity;
  
  return averagePrice;
}

// function responsible for adding a new position
const addNewPosition = async (newCryptocurrencyBalance, quantity, pair, pairPrice, userId, newAccountBalance) => {
  newCryptocurrencyBalance[pair] = quantity;

  // the function that adds an position to the database, accepts the pair name, quantity, purchase price and user id
  const position = await insertPosition(
    pair, 
    quantity, 
    pairPrice, 
    userId, 
    newAccountBalance, 
    JSON.stringify(newCryptocurrencyBalance)
  );

  return position;
}

// function responsible for position modifications
const modifyPosition = async (quantity, pair, wallet, newCryptocurrencyBalance, req, pairPrice, userId, newAccountBalance) => {
  let cryptoQuantity = Number(quantity) + Number(wallet.spotBalance[pair]);

  newCryptocurrencyBalance[pair] = cryptoQuantity.toFixed(1);

  // function that calculates the average purchase price of cryptocurrencies based on quantity and price
//   const newAveragePrice = await calculatePriceAverage(
//     req, 
//     pairPrice
//   );
  
  const position = await updatePosition(
    newCryptocurrencyBalance[pair], 
    pairPrice, 
    pair, 
    userId, 
    newAccountBalance, 
    JSON.stringify(newCryptocurrencyBalance),
    quantity
  );

  return position;
}

module.exports = { calculatePriceAverage, addNewPosition, modifyPosition }