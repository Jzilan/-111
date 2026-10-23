# 异录静态资源

从《异录 Remake：纵横四海》卡内引用及内嵌资源提取，供更新后的角色卡远程加载。原仓库其他脚本不变。

- 原图恢复 346 个；内置音乐 10 首；字体文件 1322 个；样式表 7 个。
- 另提取地图内嵌资源 10 个（纹理、HDRI、模型）。
- 四张失效的次选立绘使用同角色已有立绘；其余 17 张失效图片使用明确占位，其中四个手机入口使用通用手机图标。占位不是原图恢复。
- 原有 25 首失效 Catbox 曲目属于遗留默认数据；不影响当前十首内置曲目和用户自己导入的音乐。
- `manifest.json` 记录原地址、相对路径、大小、SHA-256 和缺失状态。发布卡固定使用资源提交版本；CSS 与 SVG 通过 jsDelivr 读取本仓库，其他文件通过 GitHub Raw 读取。
- 此目录不含账号凭据、聊天记录、用户上传头像或私人草稿。资源权利归原作者；保留卡内作者信息。

## 内置音乐署名

Floating Cities、Light Awash、Space X-plorers、Equatorial Complex、Soaring、Space 1990、Peaceful Desolation、New Direction、The Sky of our Ancestors、Lost Frontier。

作者 Kevin MacLeod，来源 [Incompetech](https://incompetech.com/)，按原卡标注的 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 保留署名；音频内容未修改，仅迁移存放地址。字体与图标样式保留原文件内说明和源地址。

## 未能取回的原文件

| 原地址 | 下载结果 | 处理 |
| --- | --- | --- |
| https://cdn.myfollo.xyz/2026/08/28/6a9157c295856.png | HTTP 401 | 原图不可取回；显示缺图提示 |
| https://cdn.myfollo.xyz/2026/08/28/6a9157bf4f64f.png | HTTP 401 | 原图不可取回；显示缺图提示 |
| https://picui.ogmua.cn/s1/2026/06/05/6a21b67d196bc.webp | HTTP 404 | 原图不可取回；显示缺图提示 |
| https://picui.ogmua.cn/s1/2026/06/05/6a21b67f8e558.webp | HTTP 404 | 原图不可取回；显示缺图提示 |
| https://picui.ogmua.cn/s1/2026/06/05/6a21b67f856e8.webp | HTTP 404 | 原图不可取回；显示缺图提示 |
| https://img.myfollo.xyz/i/2026/06/14/6a2e3fe87e00c.png | HTTP 502 | 同角色另一张现存立绘（非原图） |
| https://img.myfollo.xyz/i/2026/06/14/6a2e458475641.png | HTTP 502 | 同角色另一张现存立绘（非原图） |
| https://img.myfollo.xyz/i/2026/06/14/6a2e45723d04f.png | HTTP 502 | 同角色另一张现存立绘（非原图） |
| https://img.myfollo.xyz/i/2026/06/14/6a2e488272495.png | HTTP 502 | 同角色另一张现存立绘（非原图） |
| https://cdn.myfollo.xyz/2026/09/01/6a964ef38a3f5.png | HTTP 401 | 原图不可取回；显示缺图提示 |
| https://cdn.myfollo.xyz/2026/09/01/6a964ef08ca5a.png | HTTP 401 | 原图不可取回；显示缺图提示 |
| https://cdn.myfollo.xyz/2026/09/01/6a964eea73341.png | HTTP 401 | 原图不可取回；显示缺图提示 |
| https://cdn.myfollo.xyz/2026/09/01/6a964eea80296.png | HTTP 401 | 原图不可取回；显示缺图提示 |
| https://cdn.myfollo.xyz/2026/09/01/6a964eef65d29.png | HTTP 401 | 原图不可取回；显示缺图提示 |
| https://cdn.myfollo.xyz/2026/09/01/6a964ef0eb0ab.png | HTTP 401 | 原图不可取回；显示缺图提示 |
| https://cdn.myfollo.xyz/2026/08/31/6a950be75ef92.png | HTTP 401 | 原图不可取回；使用手机图标 |
| https://cdn.myfollo.xyz/2026/09/01/6a964eeacab23.png | HTTP 401 | 原图不可取回；显示缺图提示 |
| https://cdn.myfollo.xyz/2026/08/31/6a950be580788.png | HTTP 401 | 原图不可取回；使用手机图标 |
| https://cdn.myfollo.xyz/2026/08/31/6a953b0b502d0.png | HTTP 401 | 原图不可取回；使用手机图标 |
| https://cdn.myfollo.xyz/2026/08/31/6a950be738c2a.png | HTTP 401 | 原图不可取回；使用手机图标 |
| https://files.catbox.moe/3420bl.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/743jsi.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/7dw7ap.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/zx01oj.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/wv5h2s.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/ms4bkd.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/zipm4q.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/77bcql.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/q85nld.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/t8a2t3.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/mwmsfs.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/iq4gp4.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/78ewdt.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/2z7gw8.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/je7m32.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/42xbhu.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/dyxukt.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/1xd69s.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/yvl6y4.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/xvb9h2.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/ms9sq7.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/2cin5o.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/2kafzb.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/8i9f9c.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/lq2yf0.mp3 | HTTP 404 | 遗留歌单已移除；现用十首曲目保留 |
| https://files.catbox.moe/qa67b.gif | HTTP 404 | 原图不可取回；显示缺图提示 |
