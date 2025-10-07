import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Rounds from "./pages/Rounds";
import Courses from "./pages/Courses";
import Statistics from "./pages/Statistics";

function App() {
  const [currentTab, setCurrentTab] = useState("Home");

  const renderPage = () => {
    switch (currentTab) {
      case "Home":
        return <Home />;
      case "Rounds":
        return <Rounds />;
      case "Courses":
        return <Courses />;
      case "Statistics":
        return <Statistics />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar current={currentTab} onChange={setCurrentTab} />
      <div className="flex-1 w-full max-w-screen-xl mx-auto">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;