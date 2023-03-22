# react

- 用tag 18.2.0 的代码
- 开sourcemap
- 注释4个插件

```sh
yarn build "react/index,react-dom/index" --type=UMD
```

packages/react-dom/src/client/ReactDOMLegacy.js render中打上断点

launch.json
type msedge/chrome

- 调用

搜索排除文件

```
__tests__/**,*.new.js,*.html,*.min.js,*.development.js
```

## reference

<https://juejin.cn/post/7169046885859082277> npm link 方式
<https://juejin.cn/post/7126501202866470949> 修改sourcemap生成路径，还得放到挡墙workspace

FiberRootNode > FiberNode
