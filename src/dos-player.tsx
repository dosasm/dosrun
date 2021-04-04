import { useRef, useEffect, useState } from "react";
import * as jsdos from "emulators";
import { DosFactoryType, DosInstance } from "emulators-ui/dist/types/js-dos";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

declare const Dos: DosFactoryType;

interface PlayerProps {
  bundleUrl: string;
  onGetCi?(ci: jsdos.CommandInterface): any;
}

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
      dos.run(props.bundleUrl).then((ci) => {
        if (props.onGetCi) {
          props.onGetCi(ci);
        }
      }); // ci is returned
    }
  }, [dos, props, props.bundleUrl]);

  return (
    <div
      ref={rootRef}
      style={{ width: "100%", height: "100%" }}
      tabIndex={0}
    ></div>
  );
}

interface JSDosProps {
  getCode: () => string | undefined;
  onGetCi?(ci: jsdos.CommandInterface): any;
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

  //get the control interface
  let ci:jsdos.CommandInterface|undefined=undefined;
  const getCi = (_ci: jsdos.CommandInterface) => {
    ci=_ci;
    const events = ci.events();
    events.onExit(() => {
      console.log("exited");
    });
    let stdout = "";
    events.onStdout((val) => {
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
    if (props.onGetCi) {
      props.onGetCi(ci);
    }
  };

  //run and debug the code
  const onRun = () => {
    const code = props.getCode();
    console.log(code);
  };
  const onDebug = () => {
    const code = props.getCode();
    console.log(code);
  };

  return (
    <div>
      {selectComponent}
      <Button onClick={onRun}>Run</Button>
      <Button onClick={onDebug}>Debug</Button>
      <DosPlayer bundleUrl={bundleUrl} onGetCi={getCi} />
    </div>
  );
}
