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
}

export class JSDos extends React.Component {
  state: {
    bundleUrl: {
      value: string;
      label: string;
    };
    exit: boolean;
  };
  constructor(props: JSDosProps) {
    super(props);
    this.state = {
      bundleUrl: this.bundleUrls[0],
      exit: false,
    };
  }
  bundleUrls = [
    { value: "MASM_for_web.jsdos", label: "MASM" },
    { value: "TASM_for_web.jsdos", label: "TASM" },
    { value: "TurboC_for_web.jsdos", label: "turbo C" },
  ];
  onEdit(){

  }
  renderSelect() {
    let { bundleUrl } = this.state;

    return (
      <div>
        <CreatableSelect
          isClearable
          onChange={this.handleSelectChange.bind(this)}
          value={bundleUrl}
          options={this.bundleUrls}
        />
      </div>
    );
  }
  handleSelectChange(val: any) {
    if (val) {
      this.setState({
        bundleUrl: val,
      });
    }
  }
  getCi(ci: jsdos.CommandInterface) {
    //this.ci=ci;
    const events = ci.events();
    let stdout = "";
    events.onStdout((val) => {
      stdout += val;
      const re=/EDIT file (.*) at sideEditor/.exec(stdout)
      if(re?.length===3){
        console.log(re)
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
    (window as any).fs = fs;
    const text = fs.readFile("/home/web_user/README.txt", {
      encoding: "utf8",
    });
    console.log(text);
  }
  render() {
    let bundle = this.state.bundleUrl.value;
    if (!bundle.startsWith("http")) {
      bundle = document.location.pathname + "/" + bundle;
    }
    return (
      <div>
        {this.renderSelect()}
        <DosPlayer bundleUrl={bundle} onGetCi={this.getCi.bind(this)} />
      </div>
    );
  }
}
