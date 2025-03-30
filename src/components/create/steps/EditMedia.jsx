import React, { useState, useEffect } from "react";
import { Sliders, Palette, RotateCw, RefreshCw, Wand2 } from "lucide-react";

const AdjustmentSlider = ({
  label,
  value,
  defaultValue,
  min,
  max,
  step = 1,
  onChange,
  suffix = "",
}) => (
  <div className="space-y-2 py-1">
    <div className="flex justify-between items-center">
      <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {label}
      </label>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => onChange(defaultValue)}
          className={`text-xs ${
            value === defaultValue
              ? "text-gray-400 dark:text-gray-500"
              : "text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
          }`}
        >
          Reset
        </button>
        <span className="text-xs font-medium min-w-[2.5rem] text-right text-gray-900 dark:text-gray-100">
          {label === "Temperature"
            ? `${value > 0 ? "+" : ""}${value}`
            : `${value}${suffix}`}
        </span>
      </div>
    </div>
    <div className="relative h-7 flex items-center">
      <div className="absolute inset-0 flex items-center pointer-events-none">
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg w-full">
          <div
            className="h-full bg-blue-500 rounded-lg"
            style={{ width: `${((value - min) / (max - min)) * 100}%` }}
          />
        </div>
        {/* Circular handle */}
        <div
          className="absolute w-4 h-4 bg-white rounded-full shadow-md border-2 border-blue-500"
          style={{
            left: `calc(${((value - min) / (max - min)) * 100}% - 8px)`,
          }}
        />
      </div>
      <input
        type="range"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  </div>
);

const getFilterStyle = (customSettings) => {
  if (!customSettings) return {};

  const tempFilter =
    customSettings.temperature > 0
      ? `sepia(${customSettings.temperature}%) saturate(${
          100 + customSettings.temperature * 2
        }%)`
      : customSettings.temperature < 0
      ? `hue-rotate(${
          Math.abs(customSettings.temperature) * 0.5
        }deg) saturate(${100 + Math.abs(customSettings.temperature)}%)`
      : "";

  const sharpenFilter =
    customSettings.sharpen > 0
      ? `contrast(${100 + customSettings.sharpen * 0.5}%) brightness(${
          100 + customSettings.sharpen * 0.3
        }%)`
      : "";

  return {
    filter: `
      brightness(${customSettings.brightness || 100}%) 
      contrast(${customSettings.contrast || 100}%) 
      saturate(${customSettings.saturation || 100}%) 
      blur(${customSettings.blur || 0}px)
      grayscale(${customSettings.grayscale || 0}%)
      sepia(${customSettings.sepia || 0}%)
      hue-rotate(${customSettings.hueRotate || 0}deg)
      ${tempFilter}
      ${sharpenFilter}
    `,
    transform: `rotate(${customSettings.rotation || 0}deg)`,
    boxShadow:
      customSettings.vignette > 0
        ? `inset 0 0 ${customSettings.vignette * 3}px rgba(0,0,0,${
            (customSettings.vignette / 100) * 0.8
          })`
        : "none",
  };
};

const FiltersTab = ({ filters, selectedFilter, onFilterSelect, mediaUrl }) => (
  <div className="space-y-4">
    {/* Filters Grid */}
    <div className="grid grid-cols-4 gap-3 p-4">
      {filters.map((filter) => (
        <div key={filter.name} className="flex flex-col items-center">
          <button
            className={`overflow-hidden rounded-lg mb-1 w-full aspect-square relative cursor-pointer transition-all duration-200 ${
              selectedFilter === filter.name
                ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-primary-bg dark:ring-offset-primary-bg-dark"
                : "hover:ring-1 hover:ring-blue-500/30"
            }`}
            onClick={() => onFilterSelect(filter.name)}
          >
            <div
              className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
              style={
                filter.name !== "Original" ? getFilterStyle(filter.style) : {}
              }
            >
              <img
                src={mediaUrl}
                alt={filter.name}
                className="w-full h-full object-cover"
              />
            </div>
          </button>
          <span className="text-xs font-medium text-primary-text dark:text-primary-text-dark truncate w-full text-center">
            {filter.name}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const AdjustTab = ({ imageSettings, onSliderChange }) => (
  <div className="space-y-4">
    <div className="space-y-6 p-4">
      {[
        {
          name: "Brightness",
          key: "brightness",
          min: 0,
          max: 200,
          step: 1,
          default: 100,
        },
        {
          name: "Contrast",
          key: "contrast",
          min: 0,
          max: 200,
          step: 1,
          default: 100,
        },
        {
          name: "Saturation",
          key: "saturation",
          min: 0,
          max: 200,
          step: 1,
          default: 100,
        },
        {
          name: "Blur",
          key: "blur",
          min: 0,
          max: 5,
          step: 0.1,
          default: 0,
        },
      ].map((adjustment) => (
        <AdjustmentSlider
          key={adjustment.key}
          label={adjustment.name}
          value={imageSettings[adjustment.key]}
          defaultValue={adjustment.default}
          min={adjustment.min}
          max={adjustment.max}
          step={adjustment.step}
          onChange={(value) => onSliderChange(adjustment.key, value)}
        />
      ))}
    </div>
  </div>
);

const RotateTab = ({ rotation, onRotationChange }) => (
  <div className="space-y-4">
    <div className="space-y-6 p-4">
      <div className="flex justify-center gap-6 py-4">
        <button
          className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-all hover:scale-105 active:scale-95 text-gray-900 dark:text-gray-100"
          onClick={() => onRotationChange((rotation - 90) % 360)}
        >
          <RotateCw size={20} className="transform -scale-x-100" />
        </button>
        <button
          className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-all hover:scale-105 active:scale-95 text-gray-900 dark:text-gray-100"
          onClick={() => onRotationChange((rotation + 90) % 360)}
        >
          <RotateCw size={20} />
        </button>
      </div>
      <AdjustmentSlider
        label="Fine Rotation"
        value={rotation}
        defaultValue={0}
        min={0}
        max={360}
        onChange={(value) => onRotationChange(parseFloat(value))}
        suffix="°"
      />
    </div>
  </div>
);

const EditMedia = ({ onImageSettingsChange, mediaUrl }) => {
  const [activeTab, setActiveTab] = useState("filters");
  const [selectedFilter, setSelectedFilter] = useState("Original");

  const [imageSettings, setImageSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
    rotation: 0,
    vignette: 0,
    sharpen: 0,
    temperature: 0,
  });

  const tabs = [
    { id: "filters", icon: <Palette size={18} />, label: "Filters" },
    { id: "adjust", icon: <Sliders size={18} />, label: "Adjust" },
    { id: "rotate", icon: <RotateCw size={18} />, label: "Rotate" },
  ];

  const filters = [
    { name: "Original", style: {} },
    { name: "Vivid", style: { contrast: 120, saturation: 130, sharpen: 30 } },
    { name: "Mono", style: { grayscale: 100 } },
    { name: "Fade", style: { contrast: 90, brightness: 110, saturation: 80 } },
    {
      name: "Warm",
      style: { hueRotate: 30, saturation: 110, temperature: 30 },
    },
    {
      name: "Alien",
      style: { hueRotate: 200, saturation: 110, temperature: -30 },
    },
    { name: "Sepia", style: { sepia: 80 } },
    {
      name: "Dramatic",
      style: { contrast: 140, brightness: 90, vignette: 50 },
    },
    {
      name: "Cinematic",
      style: { contrast: 130, brightness: 90, vignette: 60 },
    },
    {
      name: "Neon",
      style: { contrast: 150, saturation: 160, brightness: 110 },
    },
    { name: "Black & White", style: { grayscale: 100, contrast: 120 } },
    {
      name: "Golden Hour",
      style: { warmth: 50, brightness: 110, saturation: 120 },
    },
    { name: "Muted", style: { contrast: 80, saturation: 70 } },
    { name: "Glossy", style: { brightness: 120, contrast: 110, sharpen: 20 } },
    { name: "Vintage", style: { sepia: 50, contrast: 90, warmth: 40 } },
    { name: "Film Grain", style: { contrast: 110, grain: 40, saturation: 90 } },
    {
      name: "Frosty",
      style: { hueRotate: 210, brightness: 95, contrast: 105 },
    },
    { name: "Desert", style: { hueRotate: 40, warmth: 60, contrast: 110 } },
    {
      name: "Mystic",
      style: { hueRotate: 270, brightness: 95, contrast: 120 },
    },
    {
      name: "Charcoal",
      style: { grayscale: 100, contrast: 110, brightness: 90 },
    },
  ];

  const applyFilter = (filterName) => {
    setSelectedFilter(filterName);
    const filter = filters.find((f) => f.name === filterName);

    if (filterName === "Original") {
      setImageSettings({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        hueRotate: 0,
        rotation: imageSettings.rotation,
        vignette: 0,
        sharpen: 0,
        temperature: 0,
      });
    } else {
      setImageSettings((prev) => ({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        hueRotate: 0,
        rotation: prev.rotation,
        vignette: 0,
        sharpen: 0,
        temperature: 0,
        ...filter.style,
      }));
    }
  };

  const handleSliderChange = (setting, value) => {
    setImageSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
    setSelectedFilter("Custom");
  };

  const resetSettings = () => {
    setImageSettings({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      hueRotate: 0,
      rotation: 0,
      vignette: 0,
      sharpen: 0,
      temperature: 0,
    });
    setSelectedFilter("Original");
  };

  useEffect(() => {
    if (onImageSettingsChange) {
      onImageSettingsChange({ ...imageSettings, filterName: selectedFilter });
    }
  }, [imageSettings, selectedFilter, onImageSettingsChange]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "filters":
        return (
          <FiltersTab
            filters={filters}
            selectedFilter={selectedFilter}
            onFilterSelect={applyFilter}
            imageSettings={imageSettings}
            mediaUrl={mediaUrl}
          />
        );
      case "adjust":
        return (
          <AdjustTab
            imageSettings={imageSettings}
            onSliderChange={handleSliderChange}
            mediaUrl={mediaUrl}
          />
        );
      case "rotate":
        return (
          <RotateTab
            rotation={imageSettings.rotation}
            onRotationChange={(value) => handleSliderChange("rotation", value)}
            imageSettings={imageSettings}
            mediaUrl={mediaUrl}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full max-h-full bg-white dark:bg-gray-950">
      {/* Header with title and reset button */}
      <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-gray-950 z-10 py-3 px-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Edit Image
        </h2>
        <button
          onClick={resetSettings}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded-full px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10"
        >
          <RefreshCw size={14} />
          Reset All
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className="flex flex-col items-center py-3 px-4 transition-all duration-200 text-sm font-medium cursor-pointer relative"
            onClick={() => setActiveTab(tab.id)}
          >
            <div
              className={`p-1.5 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {tab.icon}
            </div>
            <span
              className={`text-xs font-medium mt-0.5 transition-colors ${
                activeTab === tab.id
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
            </span>
            <div
              className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all transform origin-left ${
                activeTab === tab.id
                  ? "bg-blue-500 scale-x-100"
                  : "bg-transparent scale-x-0"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Content for the active tab - simplified with a single component */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-white dark:bg-gray-950">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default EditMedia;
