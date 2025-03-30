export const initializeMessageStock = (roomId) => {
  const messageStocks =
    JSON.parse(localStorage.getItem("sessionMessageStocks")) || {};
  return messageStocks[roomId] || { messages: [], seenBy: [] };
};

export const updateMessageStocks = (roomId, updatedStock) => {
  const messageStocks =
    JSON.parse(localStorage.getItem("sessionMessageStocks")) || {};
  localStorage.setItem(
    "sessionMessageStocks",
    JSON.stringify({ ...messageStocks, [roomId]: updatedStock }),
  );
  return updatedStock;
};

export const getLastLog = async (messageStock, userId) => {
  const getTimeDifference = (date) => {
    const diff = new Date() - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "now";
  };

  const { messages, seenBy } = messageStock || { messages: [], seenBy: [] };

  const lastMessage = messages[messages.length - 1];
  let lastLogMessage = "";
  let messageColor = "";
  let timing = "";

  const seenEntry = seenBy?.find(
    (entry) =>
      entry.userId !== userId && entry.lastSeenMessageId === lastMessage?.id,
  );

  if (lastMessage?.senderId === userId) {
    if (seenEntry && seenEntry.seenAt) {
      lastLogMessage = "Seen";
      timing = getTimeDifference(seenEntry.seenAt);
    } else {
      lastLogMessage = "Sent";
      timing = getTimeDifference(lastMessage?.sentAt);
    }
    messageColor = "text-gray-500";
  } else {
    switch (lastMessage?.type) {
      case "text":
        lastLogMessage = "Sent a message.";
        break;
      case "photo":
        lastLogMessage = "Sent a photo.";
        break;
      case "video":
        lastLogMessage = "Sent a video.";
        break;
      case "link":
        lastLogMessage = "Sent a link.";
        break;
      case "post":
        lastLogMessage = "Sent a post.";
        break;
      case "clip":
        lastLogMessage = "Sent a clip.";
        break;
      default:
        lastLogMessage = "Start chatting.";
        break;
    }
    timing = !messageStock
      ? ""
      : getTimeDifference(lastMessage?.sentAt).split(" ")[0];
    messageColor = seenBy?.some(
      (entry) =>
        entry.userId === userId && entry.lastSeenMessageId === lastMessage?.id,
    )
      ? "text-gray-500"
      : !messageStock
      ? "text-gray-500"
      : "text-white";
  }

  return { content: lastLogMessage, color: messageColor, timing };
};
