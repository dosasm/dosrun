import React, { useState } from 'react';
import { profiles } from './bundle.config.json';
import './App.css';

import DosPlayer from "./dos-player";
import { Button, ButtonGroup, FormControl, Grid, InputLabel, MenuItem, Select } from '@material-ui/core';
import CodeEditor from '@uiw/react-textarea-code-editor';

enum Mode {
  singleFile,
  interactive
}

function ControlPanel() {
  const [mode, setMode] = useState(Mode.singleFile);
  const [env, setEnv] = useState(0);
  return <>
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
          profiles[env].actions.map(val => (
            <Button key={val.label}>
              {val.label}
            </Button>
          ))
        }
      </ButtonGroup>
    </div>
  </>
}

function App() {
  const [code, setCode] = React.useState(
    `;hello`
  );
  return (
    <>

      <Grid container spacing={3} style={{ width: '98%' }}>
        <Grid item xs={12}>
          <ControlPanel />
        </Grid>
        <Grid item xs={6}>
          <DosPlayer bundleUrl="/bundles/empty.jsdos" />
        </Grid>
        <Grid item xs={6}>
          <CodeEditor
            value={code}
            language="asm6502"
            placeholder="Please enter your code."
            onChange={(evn) => setCode(evn.target.value)}
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