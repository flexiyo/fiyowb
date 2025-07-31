import { useState, useEffect, useRef } from "react";
import { Mic, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const SpeechDialog = ({ handleSearch }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [errorState, setErrorState] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef(null);
  const endTimeout = useRef(null);
  const noSpeechTimeout = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      clearTimeout(noSpeechTimeout.current);

      let final = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }

      if (final || interim) {
        setErrorState(false);
        setInterimTranscript(interim);

        if (final) {
          setTranscript(final);
        }

        setIsProcessing(true);
        clearTimeout(endTimeout.current);
        endTimeout.current = setTimeout(() => {
          setIsProcessing(false);
          if (final) {
            handleSearch(final);
          }
          stopListening();
        }, 2000);
      }

      noSpeechTimeout.current = setTimeout(() => {
        setErrorState(true);
        stopListening();
      }, 8000);
    };

    recognition.onerror = (e) => {
      console.warn("Recognition error:", e);
      setErrorState(true);
      stopListening();
    };

    recognition.onend = () => {
      if (isListening) stopListening();
    };

    return () => {
      recognition.stop();
      clearTimeout(endTimeout.current);
      clearTimeout(noSpeechTimeout.current);
    };
  }, [handleSearch]);

  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    try {
      recognition.start();
      setTranscript("");
      setInterimTranscript("");
      setIsListening(true);
      setErrorState(false);
      setIsProcessing(false);

      noSpeechTimeout.current = setTimeout(() => {
        setErrorState(true);
        stopListening();
      }, 8000);
    } catch (err) {
      console.warn("Recognition start error:", err);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setIsProcessing(false);
    setInterimTranscript("");
    clearTimeout(endTimeout.current);
    clearTimeout(noSpeechTimeout.current);
  };

  const handleMicClick = () => {
    isListening ? stopListening() : startListening();
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 py-6">
      {/* Waves */}
      {isListening && !isProcessing && (
        <div className="relative">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-blue-700/20 opacity-30"
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: [0, 2, 2.5], opacity: [0.6, 0.3, 0] }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 0.4,
                ease: "easeOut",
              }}
              style={{
                width: "90px",
                height: "90px",
                left: "-50px",
                top: "25px",
              }}
            />
          ))}
        </div>
      )}

      {/* Mic Button */}
      <div
        onClick={handleMicClick}
        className={`w-24 h-24 relative z-10 cursor-pointer flex items-center justify-center shadow-xl rounded-full ring-6 transition-all duration-300 mb-10
          ${
            errorState
              ? "ring-red-500"
              : isProcessing
              ? "ring-yellow-500 animate-pulse"
              : "ring-transparent"
          }
          ${isListening ? "bg-blue-600" : "bg-gray-500"}
        `}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </div>

      {/* Transcript Output */}
      <div className="w-full text-center px-4 min-h-[40px] mb-30">
        {errorState ? (
          <p className="text-red-500 text-lg">Couldn't Capture. Try Again.</p>
        ) : transcript || interimTranscript ? (
          <p className="text-gray-800 dark:text-gray-200 text-xl font-bold leading-relaxed">
            {transcript}
            {interimTranscript}
            <span className="inline-block w-1 h-6 ml-1 bg-blue-500 animate-pulse rounded" />
          </p>
        ) : isListening ? (
          <p className="text-gray-400 text-lg">
            Listening...
          </p>
        ) : (
          <p className="text-gray-400 text-lg">Click the mic to speak</p>
        )}  
      </div>
    </div>
  );
};

export default SpeechDialog;
