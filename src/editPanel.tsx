import React from "react";
import Editor from "react-simple-code-editor";

export function EditPanel() {
  const helloworld=`; a simple hello  word sample
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
  console.log(code)
  return (
    <Editor
      value={code}
      onValueChange={(code) => setCode(code)}
      highlight={(code) => code}
      padding={10}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 12,
      }}
    />
  );
}
