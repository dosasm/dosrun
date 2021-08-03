# DOSBox Interface

Node wapper for Dos emulators. 
Offer API and CLI for run following DOS environment emulator. 
**Still in development**

- [x] [JsDos v7](https://js-dos.com/v7/build/),[jsdos](https://js-dos.com/)
- [x] [DOSBox](https://www.dosbox.com/)
- [x] [dosbox-x](https://dosbox-x.com/)

## cli

- type `dbx j` to see jsdos shell
- download [digger.jsdos](https://cdn.dos.zone/original/2X/2/24b00b14f118580763440ecaddcc948f8cb94f14.jsdos) and type `dbx j digger.jsdos --port=3000` and open `localhost:3000` in browser to view jsdos
- type command like `dbx d -f'D:\Program Files (x86)\DOSBox-0.74-3' --mount c:. --run c: ver` to open DOSBox from the folder
- type `dbx --help` for more information.

## Api

see [api.ts](nodejs/src/api.ts)

## known bugs

- [ ] the `\x1b` escape charator missed in the emulator. Current fix is not very good
- [ ] Further work might help to work with the real file system

## Why I build this

As JS-Dos become two separate module named [emulators](https://www.npmjs.com/package/emulators) and [emulators-ui](https://www.npmjs.com/package/emulators-ui) in [v7.xx](https://js-dos.com/v7/), 
I think we can build a simple web app using [express](http://expressjs.com/) and [socket.io](https://socket.io/).
So I try to make this repo to run emluators in nodejs environment and emulators-ui in localhost browser.

## Compile

```sh
git clone <this repo>
cd <this repo>
yarn install
yarn build
```

## references

- [js-dos v7 node doc](https://js-dos.com/v7/build/docs/node)
- [js-dos github repo](https://github.com/caiiiycuk/js-dos)
