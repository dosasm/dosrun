import React from 'react';
import './App.css';

import './App.css';

import DosPlayer from "./dos-player";

function App() {
  return (
    <div className="App" style={{ width: "640px", height: "400px" }}>
        <DosPlayer bundleUrl="digger.jsdos" />
    </div>
  );
}

export default App;
