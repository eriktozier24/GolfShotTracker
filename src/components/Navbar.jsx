import { useState } from "react";

const tabs = ["Home", "Rounds", "Statistics", "Courses"];

export default function Navbar({ current, onChange }) {
  return (
    <div className="flex w-full bg-white shadow-md flex justify-around py-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${
            current === tab ? "bg-green-600 text-white" : "text-gray-600"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}