// Universal enum for getting the list of special characters for a given language
// used for the special character toolbar component
const LANGUAGE = Object.freeze({
  CREOLE: {
    label: "creole",
    specialLetterSet: ["è", "é", "ò", "â", "ê", "î", "ô", "û"],
  },
  HAWAIIAN: {
    label: "hawaiian",
    specialLetterSet: [],
  },
});

export { LANGUAGE };
