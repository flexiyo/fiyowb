import React, { useState } from "react";
import { Users, X, Hash } from "lucide-react";

const TrackInput = ({ track }) => {
  const { id, title, artists } = track;
  
  return (
    <div key={id} className="flex items-center p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 bg-white">
      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-4">
        <svg className="h-6 w-6 text-gray-500 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-300 truncate">{artists?.join(', ')}</p>
      </div>
      
      <div className="ml-4 flex-shrink-0">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const AddDetails = ({ caption, setCaption, hashtags, setHashtags, track, setTrack, collabs, setCollabs }) => {
  const [hashtag, setHashtag] = useState("");
  const [collaborator, setCollaborator] = useState("");
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
    if (collaborator.trim() && !collabs.includes(collaborator.trim())) {
      setCollabs([...collabs, collaborator.trim()]);
      setCollaborator("");
    }
  };

  const removeCollaborator = (collab) => {
    setCollabs(collabs.filter((c) => c !== collab));
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
            <TrackInput
              track={track}
              setTrack={setTrack}
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

        {collabs.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {collabs.map((collab) => (
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
