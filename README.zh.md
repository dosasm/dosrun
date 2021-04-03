# 在web端JSDos环境下运行代码

> 该小项目旨在实现在web端实现模拟DOS环境运行代码，
> 主要用于实现汇编代码的运行和调试，
> 依赖开源项目[jsdos](https://js-dos.com/v7/build/)

## 主要功能

- 在JSDos里面输入任意想要的DOS命令，目前可以选择MASM、TASM、Turbo C环境，
- (未实现，因为有CORS policy问题)也可以使用其他[jsdos](https://js-dos.com/v7/build/docs/jsdos-bundle) 包
- (未实现)在DOSBox中输入`code+文件名`从而在侧边编辑器打开
- (未实现)在侧边编辑器中编辑和新建任意文件
- (未实现)一键运行调试