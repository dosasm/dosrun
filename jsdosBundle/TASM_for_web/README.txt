This bundle is a package of TASM Tools
Turbo Assembler(TASM)

# script for Run Code

```Run
tasm test.asm
tlink test.obj
test.exe
```

# script for Debug Code

```Debug
tasm /zi test.asm
tlink /v/3 test.obj
TD test.exe
```

# script for show list

```list
tasm /la test.asm
```