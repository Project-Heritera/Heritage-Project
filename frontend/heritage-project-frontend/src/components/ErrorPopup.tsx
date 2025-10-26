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

  return (
    <AnimatePresence>
      {errorData && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={clearError}
        >
          <motion.div
            className={`flex flex-col  border-white-100 items-center justify-between border-4 rounded-lg shadow-lg max-w-md w-full p-6 relative
            ${
              errorData.type === "error"
                ? "bg-red-500 "
                : errorData.type === "warning"
                ? "bg-yellow-500"
                : "bg-green-500 "
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
              <Icon className="text-white w-8 h-8 mr-3" />
              <p className="text-white text-xl font-semibold text-center">
                {errorData.message}
              </p>
            </div>

            <button
              onClick={clearError}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded mt-4"
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
