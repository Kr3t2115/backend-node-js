// checking how many numbers after the decimal point are in the quantity willing to buy (maximum 1 decimal point)
const numberOfDecimalPlaces = (quantity) => {
  const quantityString = quantity.toString(); 
  const decimalPlaces = quantityString.indexOf('.') === -1 ? 0 : quantityString.split('.')[1].length;

  return decimalPlaces;
}
  
module.exports = numberOfDecimalPlaces;