import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TypeSelector from "../components/create/TypeSelector";
import MediaPreview from "../components/create/MediaPreview";
import SelectMedia from "../components/create/steps/SelectMedia";
import EditMedia from "../components/create/steps/EditMedia";
import AddDetails from "../components/create/steps/AddDetails";
import { createContent } from "../hooks/useContentUtils";

const Create = () => {
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState("Post");
  const [currentStep, setCurrentStep] = useState(1);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [track, setTrack] = useState({});
  const [collabs, setCollabs] = useState([]);

  const isValidMediaType = (type, mediaType) => {
    switch (type) {
      case "Post":
        return mediaType === "image";
      case "Clip":
        return mediaType === "video";
      default:
        return false;
    }
  };

  const [imageSettings, setImageSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
    rotation: 0,
    filterName: "Original",
  });

  const handleMediaSelect = (url, type) => {
    if (!isValidMediaType(selectedType, type)) {
      alert(
        `${selectedType}s only support ${
          selectedType === "Post" ? "images" : "videos"
        }`
      );
      return;
    }
    setMediaUrl(url);
    setMediaType(type);
    setCurrentStep(2);
  };

  const shareContent = () => {
    createContent(
      mediaUrl,
      selectedType === "Post" ? "posts" : "clips",
      caption,
      [],
      null,
      []
    ).then(({ content_id }) => {
      navigate(`/${selectedType === "Post" ? "p" : "c"}/${content_id}`);
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <TypeSelector
              selectedType={selectedType}
              setSelectedType={setSelectedType}
            />
            <br />
            <SelectMedia
              selectedType={selectedType}
              onMediaSelect={handleMediaSelect}
            />
          </>
        );
      case 2:
        return selectedType === "Clip" ? null : (
          <EditMedia
            mediaUrl={mediaUrl}
            onImageSettingsChange={setImageSettings}
          />
        );
      case 3:
        return <AddDetails caption={caption} setCaption={setCaption} hashtags={hashtags} setHashtags={setHashtags} track={track} setTrack={setTrack} collabs={collabs} setCollabs={setCollabs} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center mx-auto w-full min-h-screen md:p-6 bg-body-bg dark:bg-body-bg-dark">
      <div className="flex flex-col lg:flex-row max-w-7xl w-full gap-4 md:gap-6 lg:h-[calc(100vh-3rem)] h-screen">
        {/* Left Section - Preview */}
        <div className="flex-1 lg:min-w-1/2 lg:h-full h-1/3 w-full flex flex-col">
          <div className="flex flex-col h-full">
            <div className="flex-1 md:h-screen overflow-hidden md:rounded-xl bg-primary-bg dark:bg-primary-bg-dark shadow-lg">
              <MediaPreview
                type={mediaType}
                mediaUrl={mediaUrl}
                imageSettings={imageSettings}
              />
            </div>
          </div>
        </div>
        {/* Right Section - Steps */}
        <div className="lg:min-w-1/2 lg:h-full h-2/3 w-full">
          <div className="bg-primary-bg dark:bg-primary-bg-dark rounded-none md:rounded-xl p-4 shadow-lg border-t border-b md:border border-tertiary-bg dark:border-tertiary-bg-dark h-full flex flex-col">
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {renderStep()}
            </div>
            <div
              className={`flex justify-between mt-4 ${
                currentStep > 1 || mediaUrl ? "" : "hidden"
              } ${currentStep === 1 && mediaUrl ? "justify-end" : ""}`}
            >
              {currentStep > 1 && (
                <button
                  className="px-6 py-2 rounded-full cursor-pointer bg-secondary-bg dark:bg-secondary-bg-dark text-white dark:text-blue-100"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </button>
              )}
              {currentStep === 3 ? (
                <button
                  className="px-6 py-2 rounded-full cursor-pointer bg-blue-500 dark:bg-blue-600 text-white dark:text-blue-100"
                  onClick={shareContent}
                >
                  Share
                </button>
              ) : (
                <button
                  className="px-6 py-2 rounded-full cursor-pointer bg-blue-500 dark:bg-blue-600 text-white dark:text-blue-100"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
