# `docs.yui.kim` 文档笔记专栏
> 真咲唯的文档笔记专栏，展示不隐私的实时更新笔记
> 
> 构建版本：`0.0.3` 内容版本：`0.0.2` 最后修改时间：`2026-05-16` 审核人：`MasakiYui`
## 项目结构
```bash
docs.yui.kim/
├── assets/            # 图标资源
├── css/
│   └── style.css      # 样式文件
├── docs/              # 面包屑导航展示的文档
│   ├── archive
│   ├── CHANGELOG.md
│   ├── home.md        # 首页
│   ├── Languages
│   ├── QuickRef
│   └── Tools  
├── my-favicon/         # 自定义图标文件
├── LICENSE             # 许可证文件
├── index.html          # 主页
├── js/
│   ├── main.js         # 交互逻辑
│   └── structure.js    # 文件路径配置
└── README.md           # 项目说明
```
## 文档路径配置 `structure.js`
### 进入`/js/structure.js`操作
所有修改均在`const DOC_STRUCTURE = {};`中进行
### md文件
```javascript
{
    name: '[文件实际名称]',
    type: 'file',
    title: '[文件实际名称] (注释或者翻译)',
    icon: '[图标引用路径]'
}
```
### 文件夹
```javascript
{
    name: '[文件夹实际名称]',
    type: 'folder',
    title: '/ [文件夹实际名称] (注释或翻译)',
    icon: '[图标引用路径]',
    children: [
        {
            [按照 md文件 或者 文件夹 的格式继续往里塞]
        }
    ]
}
```
## 部署说明
1. **本地部署**：直接打开 `index.html` 即可使用
2. **服务器部署**：上传到 Web 服务器即可
3. **修改文档**：按照[这里的说明](#文档路径配置-structurejs)修改路径
## 相关项目
- [yui.kim](https://yui.kim) - 导航主页
## 许可证
本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。
## 致谢
- 设计灵感来自终端命令行界面
- 图标来源：[Remix Icon](https://remixicon.com/)、[svgl](https://svgl.app/)
- 感谢所有贡献者和用户反馈
---
**Made with by Masakiyui | [yui.kim](https://yui.kim)**
