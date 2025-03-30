import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

const DialogBox = forwardRef(({ items = [] }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dialogRef = useRef(null);

  useImperativeHandle(ref, () => ({
    showDialog: (event) => {
      event.preventDefault();
      const { clientX, clientY } = event;
      const dialogHeight = 200;
      const dialogWidth = 200;
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;

      let top = clientY + window.scrollY + 5;
      let left = clientX + window.scrollX;

      if (top + dialogHeight > windowHeight + window.scrollY) {
        top = clientY + window.scrollY - dialogHeight - 5;
      }
      if (left + dialogWidth > windowWidth + window.scrollX) {
        left = windowWidth + window.scrollX - dialogWidth - 5;
      }

      setPosition({ top, left });
      setIsVisible(true);
    },
    hideDialog: () => {
      setIsVisible(false);
    },
  }));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="absolute bg-secondary-bg dark:bg-secondary-bg-dark rounded-lg shadow-xl min-w-40 max-w-60 z-50 border border-gray-00 dark:border-gray-800 overflow-hidden"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <ul className="m-0 p-0 list-none divide-y divide-quaternary-bg dark:divide-quaternary-bg-dark">
            {items.map((item, index) => (
              <li
                key={index}
                className="px-4 py-2 cursor-pointer hover:bg-tertiary-bg dark:hover:bg-tertiary-bg-dark transition-colors duration-100"
                onClick={() => {
                  item.onClick?.();
                  setIsVisible(false);
                }}
              >
                {item.component}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default DialogBox;
