import { useErrorStore } from "../stores/ErrorStore";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const ErrorPopup = () => {
  const errorData = useErrorStore((state) => state.errorData);
  const clearError = useErrorStore((state) => state.clearError);

  const Icon =
    errorData?.type === "error"
      ? AlertCircle
      : errorData?.type === "warning"
      ? AlertTriangle
      : CheckCircle;
  const colorClass = 
    errorData?.type === "error"
      ? "text-red-600"
      : errorData?.type === "warning"
      ? "text-yellow-600"
      : "text-green-600";

  return (
    <AnimatePresence>
      {errorData && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={clearError}
        >
          <motion.div
           className={`flex flex-col items-center justify-between border-4 rounded-lg shadow-lg max-w-md w-full p-6 relative bg-white
            ${
              errorData.type === "error"
                ? "border-red-600 "
                : errorData.type === "warning"
                ? "border-yellow-600"
                : "border-green-600 "
            }
            `}
            onClick={(e) => e.stopPropagation()}
            initial={{
              y: -30,
              opacity: 0.3,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: 30,
              opacity: 0.3,
            }}
            transition={{
              duration: 0.2,
            }}
          >
            <div className="flex items-center justify-center mb-6">
              <Icon className={`w-8 h-8 mr-3 ${colorClass}`} />
              <p 
                className={`text-xl font text-center font-zalando-sans-expanded ${colorClass}`}
                style={{ fontFamily: "'Zalando Sans Expanded'" }}> 
                {errorData.message}
              </p>
            </div>

            <button
              onClick={clearError}
              className="bg-black hover:bg-blue-700 text-white py-2 px-6 rounded mt-4"
              style={{ fontFamily: "'Zalando Sans Expanded'" }}
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ErrorPopup;
