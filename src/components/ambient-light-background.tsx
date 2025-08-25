
'use client';

import { useEffect } from 'react';

// This component is specifically designed to load and initialize
// the ambient light background script on the client side.
export function AmbientLightBackground() {

  useEffect(() => {
    // Check if the script has already been loaded to avoid duplicates
    if (document.getElementById('ambient-light-bg-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'ambient-light-bg-script';
    script.src = '/AmbientLightBg.module.js'; // The script is in the public folder
    script.async = true;

    script.onload = () => {
      // The script is now loaded, we can safely initialize the effect.
      // The script you provided seems to export a class under the name `AmbientLightBg`.
      // We need to access it via the window object if it's attached globally.
      if (window.Color4Bg && window.Color4Bg.AmbientLightBg) {
        new window.Color4Bg.AmbientLightBg({
          dom: "ambient-background-container", // Target the container div
          // A soft, light palette that complements your site's theme
          colors: ["#F0F4F8", "#D9E2EC", "#BCCCDC", "#AABBCB", "#8C9BAB", "#6F7B8B"],
          loop: true,
        });
      } else {
        console.error("AmbientLightBg script loaded, but the class is not available on the window object.");
      }
    };

    script.onerror = () => {
        console.error("Failed to load the AmbientLightBg.module.js script.");
    };

    document.body.appendChild(script);

    // Cleanup function to remove the script when the component unmounts
    return () => {
      const existingScript = document.getElementById('ambient-light-bg-script');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount

  // This is the container div that the script will use to inject the canvas
  return <div id="ambient-background-container" className="absolute inset-0 w-full h-full" />;
}

// Add a type declaration for the custom property on the window object
// to satisfy TypeScript's type checking.
declare global {
  interface Window {
    Color4Bg?: {
        AmbientLightBg: new (options: any) => any;
    };
  }
}
