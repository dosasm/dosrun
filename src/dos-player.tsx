import { useRef, useEffect, useState } from "react";
import * as jsdos from "emulators";
import { DosFactoryType, DosInstance } from "emulators-ui/dist/types/js-dos";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";

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
  onEdit?(path: string, body: string): any;
  runCode?():any;
  debugCode?():any;
  onGetCi?(ci: jsdos.CommandInterface): any;
}

export function JSDos(props: JSDosProps) {
  const bundleUrls = [
    { value: "MASM_for_web.jsdos", name: "MASM" },
    { value: "TASM_for_web.jsdos", name: "TASM" },
    { value: "TurboC_for_web.jsdos", name: "turbo C" },
  ];
  const [bundle, setbundle] = useState<string>(bundleUrls[0].value);

  const bundleUrl = bundle.startsWith("http")
    ? bundle
    : document.location.pathname + "/" + bundle;
  const getCi = (ci: jsdos.CommandInterface) => {
    //this.ci=ci;
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
  return (
    <div>
      <Select
        key="select jsdos bundle"
        onChange={(val) =>
          typeof val.target.value === "string" && setbundle(val.target.value)
        }
        value={bundle}
      >
        {bundleUrls.map((val, idx) => (
          <option value={val.value} key={String(idx)}>
            {val.name}
          </option>
        ))}
      </Select>
      <Button>Run</Button>
      <Button>Debug</Button>
      <DosPlayer bundleUrl={bundleUrl} onGetCi={getCi} />
    </div>
  );
}
