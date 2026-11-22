# TESTING — The Softcap Tree（手测清单）

Stage 7 手测清单（07 Part D + 四步法）。自动化门禁已全绿：static **101 PASS / 3 WARN / 0 FAIL**（三条 WARN 见 design-brief §9.1，均为用户裁定接受）、smoke 0 FAIL、sim 认证 **9.72 / 9.35 / 16.35 h**（dt 0.5 / 1 / 2）。下面只列 sim/smoke 覆盖不到、必须人眼确认的部分。

启动方式：`node tools/serve.js` → 打开 <http://127.0.0.1:8098>（no-store，改文件刷新即生效）。

## 1. Boot（新档）

- [ ] 打开页面无红字；F12 控制台无错误（boot 收集器 `window.__bootErrors` 为空）
- [ ] 树画布渲染 11 个节点，无 canvas 报错（drawTree 守卫）
- [ ] 顶部状态行显示 `Force wall: cap … — you are …% suppressed`；压过 50% 后出现橙色「(stress is pouring)」
- [ ] 侧栏 ac 成就节点 + 主树 st→th→…→ov 排布正常

## 2. 各层页签（逐个点开，注入档用 `tools/save-at-mf.js` 可直达中期）

- [ ] **st**：应力商店价格梯度可见；b11 共振按钮显示闭式买满数量；b12 锚帽有实时 cap 警示文案
- [ ] **th**：cap shop 10 个升级逐个可买（门槛未到时灰显有原因文案）；4 个里程碑进度条走动
- [ ] **pl / pt**：双柱互倚——买一方的抬帽升级后，另一方页签的 cap 起点数字立刻上涨
- [ ] **tw**：突破条只在被压制时充能（未被压制时条不涨）；满条触发突破，突破数持久（doReset 不清）
- [ ] **gr**：耦合井 u12/u13 可购买且同时抬高 th 与 strain 帽
- [ ] **in**：硬化 `harden[]` 数组增长；元帽 25 的警示文案随硬化率出现
- [ ] **nc**：静态层；meta 松绑三升级（u11/u12/u13）逐个买后，其他层抬升幅度可见变小（meta-compression）
- [ ] **mf**（注入档）：9 个调谐槽位共享 90 级点池；买一格其余格可用点变少；sellOne 有 5 级下限；Force 槽买满不加速（^1.4 只允许调弱——R8 教训）
- [ ] **ov**：阀门累计链 [2→1e6]；m8 后自声望包票生效；m11 触发终局屏（winText 两行中文/英文随语言切换）

## 3. 墙经济一致性（核心手感）

- [ ] Force 压过帽后，st 页签应力速率 > 0 且随压制比例增长
- [ ] 声望 th 后 Force 清零，压制裁 0%，应力停止积累——「墙即工资」成立
- [ ] Q3 检查：任何数字都不存在硬顶（长时间挂机帽仍在抬）

## 4. 选项页（Q6 节奏盘 + 语言）

- [ ] Options 里出现墙长输入框与预设按钮；填 15 → 顶部第二行显示 `pace ×3`；恢复 45 → ×1
- [ ] 输入 5 以下 / 10080 以上被 clamp；非法输入不崩
- [ ] 语言按钮切换全站文案，**包括顶部 overlay 的 "You have"/"(x/秒)"**（Vue 响应式绑定，无需刷新）
- [ ] 切语言后刷新页面，语言偏好保持（chinesemode 已入存档）

## 5. 存档往返

- [ ] F12 控制台 `window.save()` → localStorage 出现键 `the-softcap-tree-9g7d7c`
- [ ] 导出存档 → hard reset → 导入：层进度/突破数/流形槽位/语言/墙长全部 intact
- [ ] 离线收益提示出现且封顶 1 小时（offlineLimit）

## 6. 终局

- [ ] ov m11 达成 → 终局屏出现双语 winText（不是函数源码）、用时计时、"Play Again / Keep Going" 两按钮均可用
- [ ] Keep Going 后软上限继续生效（终局不清进度）

## 回归底线

改任何文件后重跑：`node tools/smoke.js`（0 FAIL）→ `node tools/simulate.js --dt 1`（与 §11 冻结值同量级）→ 浏览器 boot 无错误。
