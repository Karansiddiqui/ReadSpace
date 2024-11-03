import React from "react";

export const ReactSpinner = () => {
  return (
    <div className="w-full h-[750px] flex justify-center items-center">
      <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-green-400 border-t-transparent"></div>
    </div>
  );
};
