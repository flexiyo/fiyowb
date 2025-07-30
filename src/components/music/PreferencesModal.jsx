import { useContext } from "react";
import AppContext from "../../context/items/AppContext"; // adjust path as needed
import { AnimatePresence, motion } from "framer-motion";

const PreferencesModal = ({ show, setShow }) => {
  const { contentQuality, setContentQuality } = useContext(AppContext);

  const handleChange = (e) => {
    setContentQuality(e.target.value);
  };

  return (
    <>
      <i
        className="fa fa-gear text-2xl"
        onClick={() => setShow(true)}
        title="Settings"
      />

      <AnimatePresence>
        {show && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl max-w-md w-full relative"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Preferences
              </h2>

              {/* Quality Selector */}
              <div className="mb-6">
                <label
                  htmlFor="quality"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Preferred Audio Quality
                </label>
                <select
                  id="quality"
                  value={contentQuality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-500 transition"
                  aria-label="Choose preferred audio quality"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
                <p className="mt-3 text-gray-400 dark:text-gray-500 text-xs">
                  This will be your default content quality.
                </p>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShow(false);
                    console.log("Shown false", show);
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PreferencesModal;
