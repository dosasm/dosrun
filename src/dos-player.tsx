import { useRef, useEffect, useState } from "react";
import { CommandInterface, CommandInterfaceEvents } from "emulators";
import { DosFactoryType, DosInstance } from "emulators-ui/dist/types/js-dos";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

declare const Dos: DosFactoryType;

/**manage the JSDos command interface */
class JsdosCi {
  static pathprefix = "/home/web_user/";
  ci?: CommandInterface;
  fs?: typeof FS;
  events?: CommandInterfaceEvents;
  setCi(ci: CommandInterface) {
    this.ci = ci;
    this.fs = (ci as any).module.FS;
    this.events = ci.events();
    this.events.onExit(() => {
      console.log("exited");
    });
    let stdout = "";
    this.events.onStdout((val) => {
      stdout += val;
      const re = /EDIT file (.*) at sideEditor/.exec(stdout);
      if (re?.length === 2) {
        console.log(re);
      }
      setTimeout(() => {
        if (stdout.length > 0) {
          console.log(stdout);
          stdout = "";
        }
      });
    });
    this.onGetCi();
  }
  onGetCi() {}
}

const jsdosCi = new JsdosCi();

interface PlayerProps {
  bundleUrl: string;
}

/**React component for JSDOS [jsdos document](https://js-dos.com/v7/build/docs/react) */
export default function DosPlayer(props: PlayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [dos, setDos] = useState<DosInstance | null>(null);

  useEffect(() => {
    if (rootRef === null || rootRef.current === null) {
      return;
    }

    const root = rootRef.current as HTMLDivElement;

    const instance = Dos(root, {
      emulatorFunction: "dosDirect",
    });

    setDos(instance);

    return () => {
      instance.stop();
    };
  }, [rootRef]);

  useEffect(() => {
    if (dos !== null) {
      dos.run(props.bundleUrl).then((ci) => jsdosCi.setCi(ci)); // ci is returned
    }
  }, [dos, props, props.bundleUrl]);

  return <div ref={rootRef} style={{ width: "100%", height: "100%" }}></div>;
}

/**render buttons for interaction*/
function JsdosButtons(props: any) {
  const [ciState, setCiState] = useState<boolean>(false);
  jsdosCi.onGetCi = () => {
    setCiState(true);
  };

  if (ciState) {
    const folderInfo = jsdosCi.fs?.readdir(JsdosCi.pathprefix);
    if (folderInfo && folderInfo.includes("README.txt")) {
      const text = jsdosCi.fs?.readFile("/home/web_user/README.txt", {
        encoding: "utf8",
      });
      const r = /```([\s\S]*?)```/g;
      let re = r.exec(text ? text : "");
      const cmds=[]
      while (text && re) {
        cmds.unshift(re[1]);
        re = r.exec(text ? text : "");
        console.log(re);
      }
      console.log(text);
      return <>
        {cmds.map(
        val=>{
          const strs=val.split('\n');
          return <Button key={val} style={{float:"right"}}>{strs[0]}</Button>
        }
      )}
      </>
    }
  }
  return <></>;
}

interface JSDosProps {
  getCode: () => string | undefined;
}

export function JSDos(props: JSDosProps) {
  //render jsdos bundle select
  const bundleUrls = [
    { value: "MASM_for_web.jsdos", name: "MASM" },
    { value: "TASM_for_web.jsdos", name: "TASM" },
    { value: "TurboC_for_web.jsdos", name: "turbo C" },
  ];
  const [bundle, setbundle] = useState<string>(bundleUrls[0].value);
  const bundleUrl = bundle.startsWith("http")
    ? bundle
    : document.location.pathname + "/" + bundle;
  const items = bundleUrls.map((val, idx) => (
    <MenuItem value={val.value} key={String(idx)}>
      {val.name}
    </MenuItem>
  ));
  const selectComponent = (
    <Select
      labelId="select-jsdos-bundle"
      id="jsdos-bundle-select"
      value={bundle}
      onChange={(val) =>
        typeof val.target.value === "string" && setbundle(val.target.value)
      }
    >
      {items}
    </Select>
  );

  return (
    <div>
      {selectComponent}
      <JsdosButtons></JsdosButtons>
      <DosPlayer bundleUrl={bundleUrl} />
    </div>
  );
}
