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
    return (
      <JSDos
        onGetfs={(fs) => {
          (window as any).fs = fs;
        }}
      />
    );
  }
  renderEditor() {
    return <EditPanel />;
  }
  render() {
    const { height, width } = window.screen;
    const styles =
      height > width
        ? [{ width: "100%" }, { width: "100%" }]
        : [
            { float: "left", width: "50%" },
            { float: "right", width: "50%", height: "100%" },
          ];
    return (
      <div>
        <div className="Dosbox" style={styles[0]}>
          {this.renderDosPlayer()}
        </div>
        <div style={styles[1]}>{this.renderEditor()}</div>
      </div>
    );
  }
}

export default App;
