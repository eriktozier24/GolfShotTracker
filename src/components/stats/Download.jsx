import React, { useState, useEffect } from "react";
import { getAllShots } from "../../utils/db";

export default function DownloadSection() {
  const [shots, setShots] = useState([]);

  useEffect(() => {
    getAllShots().then(setShots);
  }, []);

  const downloadCSV = () => {
    if (!shots.length) return;

    // Convert shots to CSV string
    const headers = Object.keys(shots[0]);
    const csvRows = [
      headers.join(","), // header row
      ...shots.map((s) =>
        headers.map((h) => JSON.stringify(s[h] ?? "")).join(",")
      ),
    ];
    const csvString = csvRows.join("\n");

    // Trigger download
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shots.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Download</h2>
    <div className="p-4 w-[50vw] m-auto rounded-lg shadow bg-white flex flex-col">
      <p className="text-sm text-gray-600 mb-4">
        Export all your shot data to CSV for external analysis.
      </p>
      <button
        onClick={downloadCSV}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Download Shots CSV
      </button>
    </div>
    </div>
  );
}
