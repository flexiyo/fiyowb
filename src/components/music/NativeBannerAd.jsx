import { useEffect } from "react";

export default function NativeBannerAd() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//pl27257123.profitableratecpm.com/25ffcd5a2f328754c0caef5eb753c5f9/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    const container = document.getElementById("container-25ffcd5a2f328754c0caef5eb753c5f9");

    // Clear old script if re-rendering
    if (container) {
      container.innerHTML = "";
      container.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full my-4 flex justify-center">
      <div id="container-25ffcd5a2f328754c0caef5eb753c5f9" className="h-18"></div>
    </div>
  );
}
