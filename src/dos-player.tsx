import React, { useRef, useEffect, useState } from "react";
import * as jsdos from "emulators";
import { DosFactoryType, DosInstance } from "emulators-ui/dist/types/js-dos";
import CreatableSelect from 'react-select/creatable';

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

export class JSDos extends React.Component {
  state: {
    bundleUrl: {
      value: string;
      label: string;
    };
    exit: boolean;
  };
  constructor(props: any) {
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
    if(val){
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
      setTimeout(() => {
        if (stdout.length > 0) {
          console.log(stdout);
          stdout = "";
        }
      });
    });
    //fs not work
    const fs = (ci as any).module.FS;
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
