// Universal enum for status types used to display the state of a task/quesiton
const statusTypes = Object.freeze({
  NOSTAR: "NOT STARTED",
  INCOMP: "INCOMPLETE",
  COMPLE: "COMPLETE",
});

// Reverse mapping: display value => key (e.g., "COMPLETE" => "COMPLE")
export const statusDisplayToKey = Object.freeze(
  Object.entries(statusTypes).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {})
);

export { statusTypes };
export default statusTypes;



