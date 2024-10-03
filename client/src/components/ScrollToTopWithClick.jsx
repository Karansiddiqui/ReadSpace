import React, { useState, useEffect } from "react";

const ScrollTo = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const ScrollToTopWithClick = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-8 right-6 z-10 bg-[#9ac46a7e] dark:bg-[#d0ffa6ad] w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-200 ease-in-out ${
        isVisible ? "translate-x-0" : "translate-x-60"
      }`}
      onClick={ScrollTo}
      style={{ pointerEvents: isVisible ? "auto" : "none" }} 
    >
      <svg
        className="w-6 h-6 text-gray-800 dark:text-white"
        aria-hidden="true"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        color="black"
      >
        <path className="text-black" stroke="currentColor" d="m5 15 7-7 7 7" />
      </svg>
    </div>
  );
};

export default ScrollToTopWithClick;
