import React from "react";
import "./App.css";

import Editor from "@monaco-editor/react";

import { JSDos } from "./dos-player";

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
    const str = `; a simple hello  word sample
    .386
   DATA SEGMENT USE16
     MESG DB 'hello tasm',0AH,'$'
   DATA ENDS
   CODE SEGMENT USE16
          ASSUME CS:CODE,DS:DATA
     BEG: MOV    AX,DATA
          MOV    DS, AX
          MOV    CX,8
     LAST:MOV    AH,9
          MOV    DX, OFFSET MESG
          INT    21H
          LOOP   LAST
          MOV    AH,4CH
          INT    21H            	;BACK TO DOS
   CODE ENDS
   END  BEG
    `;
    return (
      <Editor height="90vh" defaultLanguage="assembly" defaultValue={str} />
    );
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
        <div style={{ float: "right", width: "50%", height: "400px" }}>
          {/* {this.renderEditor()} */}
        </div>
      </div>
    );
  }
}

export default App;
