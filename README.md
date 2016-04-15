# GFE-GRB-H5

created by [ccforeverd](https://github.com/ccforeverd)

> 果仁宝公司微信H5端前端项目, 基于gulp的目录结构

> [重要]images文件夹规则: 普通命名文件为雪碧图, 带"_"前缀命名文件为静态图

> [重要]静态图转移规则: 比如factory/pages/index/images/_1.png, 编译后生成为build/images/index-1.png


### source

> H5独立资源, 文件夹如下

- font      字体
- images    页面公用图片
- include   页面公用模版
- js        H5单独使用的js模块,插件,库等
- scss      H5的样式管理和公用样式
- template  用于gulp模版生成


### factory

> H5主要开发目录, 文件夹如下

- pages       主页面, 有单独的url, 包含自己使用的分页
- views       分页面, 通过路由管理, 被引入到多个主页面
- dialogs     浮层
- components  组件


### build

> 只读文件夹, 生成本地编译后代码, 目录结构如下

- images  静态图片和雪碧图
- js      页面引用js
- css     页面引用css
- *.html  主页面


### public

> 只读文件夹, 生成线上编译后代码, 目录结构同build



