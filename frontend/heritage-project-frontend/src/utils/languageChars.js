// Universal enum for getting the list of special characters for a given language
// used for the special character toolbar component
const LANGUAGE = Object.freeze({
  CREOLE: {
    label: "Creole",
    specialLetterSet: [
      "à",
      "À",
      "â",
      "Â",
      "ç",
      "Ç",
      "è",
      "È",
      "é",
      "É",
      "ë",
      "Ë",
      "ê",
      "Ê",
      "ï",
      "Ï",
      "î",
      "Î",
      "ñ",
      "Ñ",
      "ò",
      "Ò",
      "ó",
      "Ó",
      "ô",
      "Ô",
      "œ",
      "Œ",
      "ù",
      "Ù",
      "û",
      "Û",
    ],
  },
  HAWAIIAN: {
    label: "Hawaiian",
    specialLetterSet: [
      "ʻ",
    ],
  },
});

export { LANGUAGE };
