import React from "react";
import "./App.css";

import { JSDos } from "./dos-player";
import { EditPanel } from "./editPanel";

class App extends React.Component {
  constructor(prop: {} | Readonly<{}>) {
    super(prop);
    this.state = {
      selectVal: "",
    };
  }

  renderDosPlayer() {
    return <JSDos />;
  }
  renderEditor() {
    return <EditPanel/>;
  }
  render() {
    return (
      <div>
        <div
          className="Dosbox"
          style={{ float: "left", width: "640px", height: "400px" }}
        >
          {this.renderDosPlayer()}
        </div>
        <div style={{ float: "right", width: "50%", height: "100%" }}>
          {this.renderEditor()}
        </div>
      </div>
    );
  }
}

export default App;
