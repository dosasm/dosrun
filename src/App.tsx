import { CommandInterface } from "emulators";
import React from "react";
import "./App.css";

import { JSDos } from "./dos-player";
import { EditPanel } from "./editPanel";

interface propsInterface {}

let ci: CommandInterface | undefined = undefined;

function App(props: propsInterface) {
  const { height, width } = window.screen;
  //const [ci, setCi] = useState<CommandInterface | undefined>(undefined);
  const fs = ci ? ((ci as any).module.fs as typeof FS) : undefined;
  if (fs) {
    const text = fs.readFile("/home/web_user/README.txt", {
      encoding: "utf8",
    });
    console.log(text);
  }

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
        <JSDos
          onGetCi={(val) => {
            ci = val;
          }}
        />
      </div>
      <div style={styles[1]}>
        <EditPanel />
      </div>
    </div>
  );
}

export default App;
