import React, { useEffect, useState } from "react";
import { profiles } from "./bundle.config.json";
import "./App.css";

import DosPlayer from "./dos-player";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { BundleZip } from "./bundle";
import { ActionButtons } from "./actionButtons";

// enum Mode {
//   singleFile,
//   interactive,
// }

const bun = new BundleZip();

function App() {
  // const [mode, setMode] = useState(Mode.singleFile);
  let params = (new URL(document.location.toString())).searchParams;
  const baseState = {
    env: 0,
    code: "",
    envBaseCode: true
  };
  if (params.has('env')) {
    const idx = profiles.findIndex(val => val.label === params.get('env')?.replace(/[ |_|-]/, ' '));
    if (idx >= 0) {
      baseState.env = idx;
    }
  }

  const [env, setEnv] = useState(baseState.env);
  const profile = profiles[env];
  const lang = profile.CodeLanguage;
  const [code, setCode] = useState<string>(baseState.code);
  const [bundle, setBundle] = useState<Uint8Array | undefined>(undefined);

  useEffect(() => {
    bun.download(profile.baseBundle).then(
      async () => {
        const params = (new URL(document.location.toString())).searchParams;
        let text = undefined;

        //read sample file in the bundle or use param
        if (params.has('code')) {
          text = params.get('code') as string;
        }
        else {
          text = await bun.readFile(profile.CodePath);
        }

        //set editor code and exec command for the code
        let setBundled = false;
        if (text) {
          setCode(text);
          //exec command for exec param
          if (params.has('exec')) {
            const idx = profile.actions.findIndex(val => val.label.toLowerCase() === params.get('exec')?.toLowerCase());
            if (idx >= 0) {
              const action = profile.actions[idx];
              const _bundle = await bun.getBundle(action.command, {
                path: action.CodeDestination,
                text,
              });
              setBundle(_bundle);
              setBundled = true;
            }
          }
        }
        if (setBundled === false) {
          const _bundle = await bun.getBundle();
          setBundle(_bundle);
        }
      }
    );
  }, [profile, baseState.envBaseCode]);

  const execAction = async (id: number) => {
    const action = profile.actions[id];
    const _bundle = await bun.getBundle(action.command, {
      path: action.CodeDestination,
      text: code,
    });
    if (_bundle) setBundle(_bundle);
  };

  //change the style according to screen size
  const { height, width } = window.screen;

  const formControl = () => {
    return <div style={{ float: "left" }}>
      <FormControl>
        <InputLabel id="select-jsdos-bundle-label">
          environment
        </InputLabel>
        <Select
          labelId="select-jsdos-bundle"
          id="select-bundle"
          value={env}
          onChange={(val) => {
            setEnv(val.target.value as number);
          }}
        >
          {profiles.map((val, idx) => (
            <MenuItem value={idx} key={val.label}>
              {val.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* <FormControl>
        <InputLabel id="select-mode-label">Mode</InputLabel>
        <Select
          id="select-mode"
          value={mode}
          onChange={(val) => {
            setMode(val.target.value as Mode);
          }}
        >
          <MenuItem value={Mode.singleFile}>singleFile</MenuItem>
          <MenuItem value={Mode.interactive}>interactive</MenuItem>
        </Select>
      </FormControl> */}
    </div>
  }

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} className="Control">
          {formControl()}
          <div style={{ float: 'right' }}>
            <ActionButtons
              baseOptions={["clean"]}
              options={profile.actions.map(val => val.label)}
              onClick={idx => idx < 0 ? setCode("") : execAction(idx)}
            ></ActionButtons>
          </div>
        </Grid>
        <Grid item xs={height > width ? 12 : 6} className="Dosbox">
          <div style={{ alignContent: "center" }}>
            {bundle !== undefined ? <DosPlayer bundle={bundle} /> : <></>}
          </div>
        </Grid>
        <Grid item xs={height > width ? 12 : 6} className="Editor">
          <CodeEditor
            autoFocus
            value={code}
            language={lang}
            placeholder="Please enter your code."
            onChange={(evn) => setCode(evn.target.value.replace(/\n/g, '\r\n'))}
            minHeight={80}
            padding={15}
            style={{
              fontSize: 12,
              backgroundColor: "#f5f5f5",
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default App;
