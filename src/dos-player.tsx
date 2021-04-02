import React, { useRef, useEffect, useState } from "react";
import * as jsdos from "emulators";
import { DosFactoryType, DosInstance } from "emulators-ui/dist/types/js-dos";
import CreatableSelect from "react-select/creatable";

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

  return <div ref={rootRef} style={{ width: "100%", height: "100%" }}></div>;
}

interface JSDosProps {
  onEdit?(path: string, body: string): any;
  onGetfs?(fs: typeof FS): any;
}

export function  JSDos (props:JSDosProps) {
  const bundleUrls = [
    { value: "MASM_for_web.jsdos", label: "MASM" },
    { value: "TASM_for_web.jsdos", label: "TASM" },
    { value: "TurboC_for_web.jsdos", label: "turbo C" },
  ];
  const [bundle,setbundle]=useState<{value:string,label:string}>(bundleUrls[0]);
  
  const renderSelect=()=> {
    return (
      <div>
        <CreatableSelect
          isClearable
          onChange={val=>val && setbundle(val)}
          value={bundle}
          options={bundleUrls}
        />
      </div>
    );
  }
  const bundleUrl=bundle.value.startsWith("http")?bundle.value:document.location.pathname + "/" + bundle.value;
  const getCi=(ci: jsdos.CommandInterface)=> {
    //this.ci=ci;
    const events = ci.events();
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
    //fs only works with direct
    //readfile
    const fs = (ci as any).module.FS as typeof FS;
    if(props.onGetfs){
      props.onGetfs(fs)
    }
    const text = fs.readFile("/home/web_user/README.txt", {
      encoding: "utf8",
    });
    console.log(text);
  }
  return (
    <div>
      {renderSelect()}
      <DosPlayer bundleUrl={bundleUrl} onGetCi={getCi} />
    </div>
  );
}