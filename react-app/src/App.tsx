import React, { useEffect, useRef, useState } from 'react';
import { profiles } from './bundle.config.json';
import './App.css';

import DosPlayer from "./dos-player";
import { Button, ButtonGroup, FormControl, Grid, InputLabel, MenuItem, Select } from '@material-ui/core';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { BundleZip } from './bundle';

enum Mode {
  singleFile,
  interactive
}

const bun = new BundleZip();

function App() {
  const [mode, setMode] = useState(Mode.singleFile);
  const [env, setEnv] = useState(0);
  const profile = profiles[env];
  const lang = profile.CodeLanguage;
  const [code, setCode] = useState<string>("");
  const [bundle, setBundle] = useState<Uint8Array | undefined>(undefined);

  useEffect(() => {
    bun.download(profiles[env].baseBundle).then(
      () => {
        bun.readFile(profiles[env].CodePath).then(
          text => {
            if (text) {
              setCode(text);
            }
          }
        )
        bun.getBundle().then(
          _bundle => setBundle(_bundle)
        )
      }
    )

  }, [env]);

  const execAction = async (id: number) => {
    const action = profile.actions[id];
    const _bundle = await bun.getBundle(action.command, { path: action.CodeDestination, text: code });
    if (_bundle)
      setBundle(_bundle);
  }

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} className="Control">
          <div style={{ float: 'left' }}>
            <FormControl>
              <InputLabel id="select-jsdos-bundle-label">environment</InputLabel>
              <Select labelId="select-jsdos-bundle" id="select-bundle" value={env}
                onChange={val => { setEnv(val.target.value as number) }}>
                {profiles.map((val, idx) => (
                  <MenuItem value={idx} key={val.label}>
                    {val.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <InputLabel id="select-mode-label">Mode</InputLabel>
              <Select id="select-mode" value={mode}
                onChange={val => { setMode(val.target.value as Mode) }}>
                <MenuItem value={Mode.singleFile}>
                  singleFile
                </MenuItem>
                <MenuItem value={Mode.interactive}>
                  interactive
                </MenuItem>
              </Select>
            </FormControl>
          </div>
          <div style={{ float: "right" }}>
            <ButtonGroup color="primary" aria-label="outlined primary button group">
              {
                profiles[env].actions.map((val, idx) => (
                  <Button key={val.label}
                    onClick={
                      e => {
                        execAction(idx)
                      }
                    }>
                    {val.label}
                  </Button>
                ))
              }
              <Button key="clean-editor-code"
                onClick={
                  e => {
                    setCode("")
                  }
                }>
                clean
              </Button>
            </ButtonGroup>
          </div>
        </Grid>
        <Grid item xs={6} className="Dosbox">
          <div style={{ alignContent: "center" }}>
            {
              bundle !== undefined ? <DosPlayer bundle={bundle} /> : <></>
            }
          </div>
        </Grid>
        <Grid item xs={6} className="Editor">
          <CodeEditor
            autoFocus
            value={code}
            language={lang}
            placeholder="Please enter your code."
            onChange={(evn) => setCode(evn.target.value)}
            minHeight={80}
            padding={15}
            style={{
              fontSize: 12,
              backgroundColor: "#f5f5f5",
              fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
            }}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default App;