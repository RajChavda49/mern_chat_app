import React from "react";
import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <div className="w-full h-screen flex-col gap-2 flex items-center justify-center font-semibold text-4xl">
      <h1>Page Not Found</h1>
      <Link to="/">
        <button className="capitalize bg-green-400 rounded-lg duration-100 p-2 text-lg text-center font-semibold active:scale-95 hover:bg-green-600 transition text-white">
          Go to home
        </button>
      </Link>
    </div>
  );
};

export default PageNotFound;
