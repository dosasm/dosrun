::label: debug
::debug assembly code

tasm /zi %1.asm
tlink /v/3 %1.obj
TD %1.exe