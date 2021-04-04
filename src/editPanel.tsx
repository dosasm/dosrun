import React, { useState } from "react";
import Editor from "react-simple-code-editor";

interface editorProps {
  onValueChange?(val: string): any;
}

/**stop the dosbox from receiving keyevent
 * NOTE: this function should be unique
 */
const stop = function (event: any) {
  event.stopPropagation();
};

export function EditPanel(props: editorProps) {
  const [key, setKey] = useState<{ up: number; down: number }>({
    up: 0,
    down: 0,
  });

  //set Editer value and get the current value
  const helloworld = `; a simple hello  word sample
  .386
  DATA SEGMENT USE16
  MESG DB 'hello tasm',0AH,'$'
  DATA ENDS
  CODE SEGMENT USE16
  ASSUME CS:CODE,DS:DATA
  BEG: MOV    AX,DATA
  MOV    DS, AX
  MOV    CX,8
  LAST:MOV    AH,9
  MOV    DX, OFFSET MESG
  INT    21H
  LOOP   LAST
  MOV    AH,4CH
  INT    21H            	;BACK TO DOS
  CODE ENDS
  END  BEG
  `;
  const [code, setCode] = React.useState(helloworld);
  if (props.onValueChange) {
    props.onValueChange(code);
  }

  const option = true;
  return (
    <Editor
      autoFocus={true}
      //https://github.com/caiiiycuk/js-dos/issues/129
      onFocus={(e: any) => {
        if (key.up === 0) {
          document.addEventListener("keyup", stop, option);
          key.up++;
        }
        if (key.down === 0) {
          document.addEventListener("keydown", stop, option);
          key.down++;
        }
        setKey(key);
      }}
      onBlur={(e: any) => {
        while (key.up > 0) {
          document.removeEventListener("keyup", stop, option);
          key.up--;
        }
        while (key.down > 0) {
          document.removeEventListener("keydown", stop, option);
          key.down--;
        }
        setKey(key);
      }}
      value={code}
      onValueChange={(code) => {
        setCode(code);
        if (props.onValueChange) {
          props.onValueChange(code);
        }
      }}
      highlight={(code) => code}
      padding={10}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 12,
      }}
    />
  );
}
