const ChatMessenger = ({ inputText, setInputText, handleSendMessage }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleSendMessage();
    }
  };

  return (
    <form
      className={`flex flex-row items-center bg-secondary-bg dark:bg-secondary-bg-dark px-2 py-2 ${
        inputText.length > 40 ? "rounded-xl" : "rounded-full"
      } w-[96%] mx-auto mb-4`}
      onSubmit={handleSubmit}
    >
      <input
        placeholder="Message..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="flex-1 font-medium text-base px-4 py-2 bg-transparent outline-none placeholder-gray-400"
        aria-label="Chat message input"
      />
      {inputText.trim() ? (
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="flex items-center justify-center bg-blue-600 rounded-full px-4 py-2 disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
          aria-label="Send message"
        >
          <i className="fa fa-paper-plane text-lg text-white" />
        </button>
      ) : (
        <div className="mx-2 flex gap-2">
          <button
            type="button"
            className="p-2 cursor-pointer"
            aria-label="Voice input"
          >
            <i className="fa fa-microphone text-2xl" />
          </button>
          <button
            type="button"
            className="p-2 cursor-pointer"
            aria-label="Attach file"
          >
            <i className="far fa-paperclip-vertical text-2xl" />
          </button>
        </div>
      )}
    </form>
  );
};

export default ChatMessenger;
