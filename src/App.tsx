
import "./App.css";

import { JSDos } from "./dos-player";
import { EditPanel } from "./editPanel";

interface propsInterface {}

function App(props: propsInterface) {
  //change the style according to screen size
  const { height, width } = window.screen;
  const styles =
    height > width
      ? [{ width: "100%" }, { width: "100%" }]
      : [
          { float: "left", width: "50%" },
          { float: "right", width: "50%", height: "100%" },
        ];

  let code: string | undefined = undefined;

  return (
    <div>
      <div className="Dosbox" style={styles[0]}>
        <JSDos
          getCode={() => code}
        />
      </div>
      <div style={styles[1]}>
        <EditPanel
          onValueChange={(val) => {
            code = val;
          }}
        />
      </div>
    </div>
  );
}

export default App;
