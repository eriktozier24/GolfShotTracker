import { useState, useEffect } from "react";

import RoundViewer from "../components/stats/RoundViewer";
import StrokesGainedSummary from "../components/stats/StrokesGainedSummary";
import ClubAnalysis from "../components/stats/ClubAnalysis";
import Download from "../components/stats/Download"

export default function Statistics() {
  const [tab, setTab] = useState("rounds");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
            className={`px-4 py-2 rounded-lg transition-colors ${
            tab === "rounds"
                ? "bg-green-600 text-white font-semibold shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setTab("rounds")}
        >
            Round Viewer
        </button>
        <button
            className={`px-4 py-2 rounded-lg transition-colors ${
            tab === "sg"
                ? "bg-green-600 text-white font-semibold shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setTab("sg")}
        >
            Strokes Gained Summary
        </button>
        <button
            className={`px-4 py-2 rounded-lg transition-colors ${
            tab === "clubs"
                ? "bg-green-600 text-white font-semibold shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setTab("clubs")}
        >
            Club Analysis
        </button>
        <button
            className={`px-4 py-2 rounded-lg transition-colors ${
            tab === "download"
                ? "bg-green-600 text-white font-semibold shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setTab("download")}
        >
            Download
        </button>
        </div>



      {/* Active View */}
      {tab === "rounds" && <RoundViewer />}
      {tab === "sg" && <StrokesGainedSummary />}
      {tab === "clubs" && <ClubAnalysis />}
      {tab === "download" && <Download />}
    </div>
  );
}