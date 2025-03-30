import React, { useState, useEffect } from "react";
import { Users, X, Hash, PlusCircle, Music } from "lucide-react";

const AddDetails = ({ caption, setCaption }) => {
  const [hashtag, setHashtag] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [collaborator, setCollaborator] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const maxCaptionChars = 500;

  const handleCaptionChange = (e) => {
    const text = e.target.value;
    if (text.length <= maxCaptionChars) {
      setCaption(text);
    }
  };

  const addHashtag = () => {
    if (hashtag.trim() && !hashtags.includes(hashtag.trim())) {
      setHashtags([...hashtags, hashtag.trim()]);
      setHashtag("");
    }
  };

  const removeHashtag = (tag) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  const addCollaborator = () => {
    if (collaborator.trim() && !collaborators.includes(collaborator.trim())) {
      setCollaborators([...collaborators, collaborator.trim()]);
      setCollaborator("");
    }
  };

  const removeCollaborator = (collab) => {
    setCollaborators(collaborators.filter((c) => c !== collab));
  };

  const handleHashtagInput = (e) => {
    const value = e.target.value;
    setHashtag(value);
    if (value.endsWith(" ")) {
      addHashtag();
    }
  };

  const handleCollaboratorInput = (e) => {
    const value = e.target.value;
    setCollaborator(value);
    if (value.endsWith(" ")) {
      addCollaborator();
    }
  };

  const handleKeyDown = (e, action) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-primary-text dark:text-primary-text-dark">
        Add Details
      </h2>

      <div className="space-y-6">
        {/* Caption Field */}
        <textarea
          className="w-full p-3 border rounded-lg bg-secondary-bg dark:bg-secondary-bg-dark border-tertiary-bg dark:border-tertiary-bg-dark text-primary-text dark:text-primary-text-dark focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          rows="5"
          placeholder="Write a caption..."
          value={caption || ""}
          onChange={handleCaptionChange}
        />

        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Hash
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-3 border rounded-lg bg-secondary-bg dark:bg-secondary-bg-dark border-tertiary-bg dark:border-tertiary-bg-dark text-primary-text dark:text-primary-text-dark focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Type a hashtag and hit Space"
              value={hashtag}
              onChange={handleHashtagInput}
              onKeyDown={(e) => handleKeyDown(e, addHashtag)}
            />
          </div>
        </div>

        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {hashtags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium transition-all hover:bg-blue-100 dark:hover:bg-blue-800/50"
              >
                <span>#{tag}</span>
                <button
                  onClick={() => removeHashtag(tag)}
                  className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors"
                  aria-label={`Remove hashtag ${tag}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Music
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-3 border rounded-lg bg-secondary-bg dark:bg-secondary-bg-dark border-tertiary-bg dark:border-tertiary-bg-dark text-primary-text dark:text-primary-text-dark focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Add music track"
              disabled
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Users
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-3 border rounded-lg bg-secondary-bg dark:bg-secondary-bg-dark border-tertiary-bg dark:border-tertiary-bg-dark text-primary-text dark:text-primary-text-dark focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Add a collaborator and hit Space"
              value={collaborator}
              onChange={handleCollaboratorInput}
              onKeyDown={(e) => handleKeyDown(e, addCollaborator)}
            />
          </div>
        </div>

        {collaborators.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {collaborators.map((collab) => (
              <div
                key={collab}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full text-sm font-medium transition-all hover:bg-purple-100 dark:hover:bg-purple-800/50"
              >
                <span>@{collab}</span>
                <button
                  onClick={() => removeCollaborator(collab)}
                  className="p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full transition-colors"
                  aria-label={`Remove collaborator ${collab}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddDetails;
