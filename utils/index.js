String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

// ToProperCase Function
export const ToProperCase = (algoId) => {
  let AlgoName = "" + algoId;
  AlgoName = AlgoName.replace(/-/g, " ");
  return AlgoName.toProperCase();
};

// MakeDelay Function
export const MakeDelay = async (ms) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

// Kebab Case to Pascal Case Function
export const kebabToPascalCase = (kebabCase) => {
  console.log("Converting kebabCase:", kebabCase);
  return kebabCase?.split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("") || "";
};