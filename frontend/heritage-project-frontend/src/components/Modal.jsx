import React, { useEffect } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

/*
isOpen: a boolean state in the parent component that decides whether the modal should be visible.
onClose: a function in the parent component that sets isOpen to false (or performs any other cleanup)
children: component that will be acting as the modal
backgroundOpacity and animationType are just for aesthetics
*/
const Modal = ({
  isOpen,
  onClose,
  children,
  backgroundOpacity = 0.5,
  animationType = "popup", // "popup" | "slide" | "fade"
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Define motion variants for different animation types
  const animations = {
    popup: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.8, opacity: 0 },
    },
    slide: {
      initial: { y: 60, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 60, opacity: 0 },
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
  };

  const selectedAnim = animations[animationType] || animations.popup;
  return (
    <AnimatePresence>
      {isOpen && (
        <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={selectedAnim.initial}
            animate={selectedAnim.animate}
            exit={selectedAnim.exit}
            transition={{ duration: 0.18 }}
            className="w-full max-w-lg px-4"
          >
            <Card className="border shadow-xl rounded-2xl">


              <CardContent>
                {children}
              </CardContent>

            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default Modal;
