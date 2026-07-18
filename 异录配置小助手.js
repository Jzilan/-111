/*
 * 诡事录配置小助手 v1.1
 * MVU最优配置 + 剧情/人物双控制器
 */
!(function () {
'use strict';

/* ===== 父窗口定位 ===== */
var GS_PARENT = (function () {
    try { if (window.parent && window.parent !== window && window.parent.document && window.parent.document.body) return window.parent; } catch (e) {}
    try { if (window.top && window.top !== window && window.top.document && window.top.document.body) return window.top; } catch (e) {}
    return window;
})();
var P = GS_PARENT;
delete P._gsConfigLoaded;
if (P._gsConfigLoaded) return;
P._gsConfigLoaded = true;

var GS_WB_NAME = '诡事录';

/* 清理旧实例 */
(function () {
    ['gs-bubble', 'gs-panel', 'gs-style'].forEach(function (id) { var el = P.document.getElementById(id); if (el) el.remove(); });
    if (typeof P._gsCleanup === 'function') { try { P._gsCleanup(); } catch (e) {} }
    delete P._gsCleanup;
})();

/* ===== runInParent ===== */
function runInParent(fnString) {
  return new Promise(function (resolve, reject) {
    var token = 'gs_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    function handler(e) {
      if (!e.detail || e.detail.token !== token) return;
      P.document.removeEventListener('gs-result', handler);
      if (e.detail.error) reject(new Error(e.detail.error));
      else resolve(e.detail.result);
    }
    P.document.addEventListener('gs-result', handler);
    var script = P.document.createElement('script');
    script.textContent = '(async function(){try{var r=await(' + fnString + ');document.dispatchEvent(new CustomEvent("gs-result",{detail:{token:"' + token + '",result:r}}))}catch(e){document.dispatchEvent(new CustomEvent("gs-result",{detail:{token:"' + token + '",error:e.message||String(e)}}))}})();';
    P.document.body.appendChild(script);
    script.remove();
  });
}

/* 世界书API */
function api_getWorldbook(name) {
  return runInParent('TavernHelper.getWorldbook(' + JSON.stringify(name) + ')');
}
function api_replaceWorldbook(name, modifierFn) {
  return runInParent('(async function(){var es=await TavernHelper.getWorldbook(' + JSON.stringify(name) + ');(' + modifierFn + ')(es);await TavernHelper.replaceWorldbook(' + JSON.stringify(name) + ',es);return await TavernHelper.getWorldbook(' + JSON.stringify(name) + ')})()');
}

/* ===== CSS (精简注入) ===== */
var CSS = P.document.createElement('style');
CSS.id = 'gs-style';
CSS.textContent = [
'#gs-bubble{position:fixed;top:50vh;left:14px;width:44px;height:44px;',
'background:linear-gradient(145deg,#1a0c0a,#0a0303);',
'border:1px solid rgba(200,154,62,.35);border-radius:14px;z-index:1000000;',
'cursor:pointer;display:flex;align-items:center;justify-content:center;',
'box-shadow:0 4px 20px rgba(0,0,0,.6),inset 0 1px 0 rgba(200,154,62,.04);',
'transition:box-shadow .25s,border-color .25s,transform .15s;user-select:none;touch-action:none}',
'#gs-bubble span{font-size:28px;font-weight:400;line-height:1;',
'font-family:STKaiti,楷体,serif;',
'background:linear-gradient(180deg,#e8d090,#c8302a 50%,#8a1020);',
'-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;',
'filter:drop-shadow(0 0 6px rgba(200,100,40,.3))}',
'#gs-bubble:hover{border-color:rgba(200,100,40,.7);box-shadow:0 0 20px rgba(200,100,40,.2),0 6px 24px rgba(0,0,0,.7);transform:translateY(-1px)}',
'#gs-bubble:hover span{filter:drop-shadow(0 0 12px rgba(200,100,40,.5))}',
'.gs-panel{position:fixed;z-index:1000001;width:320px;max-height:62vh;',
'background:linear-gradient(170deg,#1a0c0a,#0a0303);',
'border:1px solid rgba(200,154,62,.25);border-radius:12px;',
'box-shadow:0 8px 32px rgba(0,0,0,.7),0 0 16px rgba(200,100,40,.06);',
'display:flex;flex-direction:column;font-size:13px;color:#d4c4a8;',
'font-family:STKaiti,楷体,serif;',
'overflow:hidden;user-select:none;height:min(560px,62vh)!important}',
'.gs-header{display:flex;align-items:center;justify-content:space-between;',
'padding:12px 16px 10px;border-bottom:1px solid rgba(200,154,62,.2);cursor:move}',
'.gs-header-title{font-size:18px;font-weight:700;',
'background:linear-gradient(180deg,#e8d090,#c8302a);',
'-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:2px}',
'#gs-tabs{display:flex;gap:2px;padding:6px 8px 0;flex:none;',
'border-bottom:1px solid rgba(200,154,62,.18);background:rgba(10,3,3,.5)}',
'.gs-tab{flex:1;padding:8px 2px;font-size:12px;color:#b89060;background:transparent;',
'border:none;border-bottom:2px solid transparent;cursor:pointer;font-family:inherit;transition:.2s}',
'.gs-tab:hover{color:#e8d8b8}',
'.gs-tab.active{color:#e8d090;border-bottom-color:#c8302a;background:linear-gradient(180deg,rgba(200,48,42,.14),transparent)}',
'.gs-screen{display:none;height:100%;overflow-y:auto;padding:12px 14px}',
'.gs-screen.active{display:block}',
'.gs-section{background:rgba(200,100,40,.03);border:1px solid rgba(200,154,62,.15);border-radius:8px;padding:12px;margin-bottom:10px}',
'.gs-section-title{font-size:11px;font-weight:600;letter-spacing:1px;color:#c8a052;margin-bottom:10px}',
'.gs-btn{padding:7px 14px!important;border-radius:6px!important;cursor:pointer;',
'border:1px solid #4a3525!important;background:rgba(200,48,42,.06)!important;',
'color:#d4a0a0!important;font-size:12px;font-weight:500;font-family:inherit!important;transition:all .2s;letter-spacing:.3px}',
'.gs-btn:hover{background:rgba(200,48,42,.15)!important;border-color:#c8302a!important;color:#fff!important}',
'.gs-btn.primary{width:100%!important;display:block!important;',
'background:linear-gradient(160deg,#c8a052,#8a5a20)!important;',
'border:1px solid #c8a052!important;color:#0a0303!important;margin-top:6px;',
'padding:10px!important;font-size:13px;font-weight:700!important;letter-spacing:.5px;',
'box-shadow:0 2px 10px rgba(200,154,62,.15)!important;text-align:center!important}',
'.gs-btn.primary:hover{background:linear-gradient(160deg,#e8d090,#c8a052)!important;border-color:#e8d090!important;box-shadow:0 4px 16px rgba(200,154,62,.3)!important;color:#0a0303!important}',
'.gs-btn.xs{padding:4px 10px!important;font-size:11px;width:auto;border-radius:5px!important;',
'background:transparent!important;border-color:rgba(200,130,60,.3)!important;color:#c8a052!important;display:inline-block!important}',
'.gs-btn.xs:hover{border-color:#c8a052!important;color:#e8d090!important}',
'.gs-plot-row{display:flex;align-items:center;gap:6px;padding:3px 6px;border-radius:4px;cursor:pointer;font-size:11px;color:#b89060;margin-bottom:1px}',
'.gs-plot-row:hover{background:rgba(200,100,40,.06)}',
'.gs-plot-row input[type="checkbox"]{accent-color:#c8302a;margin:0}',
'.gs-toast{position:fixed;top:24px;left:50%;transform:translateX(-50%);background:rgba(20,10,8,.97)!important;border:1px solid rgba(200,154,62,.35)!important;border-radius:8px!important;padding:10px 24px!important;color:#c8a052!important;font-size:13px;font-weight:600;z-index:1000002;box-shadow:0 4px 20px rgba(0,0,0,.5);animation:gstin .3s ease,gstout .3s ease 2.2s forwards;letter-spacing:.3px;font-family:STKaiti,楷体,serif!important}',
'@keyframes gstin{from{opacity:0;transform:translateX(-50%) translateY(-12px)}}',
'@keyframes gstout{to{opacity:0;transform:translateX(-50%) translateY(-12px)}}',
'@media(max-width:768px){.gs-panel{width:clamp(260px,88vw,340px)!important}#gs-bubble{width:36px;height:36px}#gs-bubble span{font-size:22px}}'
].join('');
P.document.head.appendChild(CSS);

/* ===== HTML ===== */
var html = [
'<div id="gs-bubble" style="top:50vh;left:14px" title="诡事录配置小助手"><span>诡</span></div>',
'<div id="gs-panel" class="gs-panel" style="display:none;left:64px;top:40vh">',
'<div class="gs-header" id="gs-drag"><span class="gs-header-title">诡事录配置小助手</span>',
'<div style="display:flex;align-items:center;gap:4px">',
'<button class="gs-btn xs" id="gs-refresh">刷新</button>',
'<button class="gs-btn xs" id="gs-close" style="font-size:14px;padding:4px 8px!important">X</button></div></div>',
'<div id="gs-tabs"><button class="gs-tab active" data-screen="home">MVU配置</button>',
'<button class="gs-tab" data-screen="plot">剧情控制器</button></div>',
'<div style="flex:1;overflow:hidden">',

/* --- MVU Screen --- */
'<div class="gs-screen active" data-screen="home"><div class="gs-section">',
'<div class="gs-section-title">MVU插件配置</div>',
'<div id="gs-mvu-status" style="font-size:11px;color:#b89060;margin-bottom:8px;text-align:center;line-height:1.6"></div>',
'<button class="gs-btn primary" id="gs-mvu-optimize">一键最优配置</button>',
'<div style="font-size:10px;color:#6a4a30;margin-top:6px;text-align:center;line-height:1.5">额外模型解析 + 内置破限 + 四项通知全开 + 自动清理</div></div><div class="gs-section"><div class="gs-section-title">提示词模板配置</div><div id="gs-ejs-status" style="font-size:11px;color:#b89060;margin-bottom:8px;text-align:center;line-height:1.6"></div><button class="gs-btn primary" id="gs-ejs-optimize">一键最优配置</button><div style="font-size:10px;color:#6a4a30;margin-top:6px;text-align:center;line-height:1.5">一键配置EJS提示词模板为最优参数</div></div></div>',

/* --- Plot Screen --- */
'<div class="gs-screen" data-screen="plot">',

/* 剧情开关区域 */
'<div class="gs-section">',
'<div class="gs-section-title">剧情开关</div>',
'<div style="display:flex;gap:6px;margin-bottom:8px">',
'<button class="gs-btn" id="gs-plot-on" style="background:rgba(40,140,60,.12)!important;border-color:#2a6a30!important;color:#8ac8a0!important;flex:1;text-align:center!important">全部开启</button>',
'<button class="gs-btn" id="gs-plot-off" style="background:rgba(200,30,20,.12)!important;border-color:#8a1020!important;color:#e8a0a0!important;flex:1;text-align:center!important">全部关闭</button>',
'</div>',
'<div id="gs-plot-list" style="display:flex;flex-direction:column;gap:1px;max-height:140px;overflow-y:auto"></div>',
'<div style="display:flex;gap:6px;margin-top:8px">',
'<button class="gs-btn primary" id="gs-plot-apply" style="font-size:12px;flex:1">应用更改</button>',
'<button class="gs-btn xs" id="gs-plot-revert">重读</button>',
'</div>',
'</div>',

/* 人物开关区域 */
'<div class="gs-section">',
'<div class="gs-section-title">剧情人物开关</div>',
'<div style="display:flex;gap:6px;margin-bottom:8px">',
'<button class="gs-btn" id="gs-char-on" style="background:rgba(40,140,60,.12)!important;border-color:#2a6a30!important;color:#8ac8a0!important;flex:1;text-align:center!important">全部开启</button>',
'<button class="gs-btn" id="gs-char-off" style="background:rgba(200,30,20,.12)!important;border-color:#8a1020!important;color:#e8a0a0!important;flex:1;text-align:center!important">全部关闭</button>',
'</div>',
'<div id="gs-char-list" style="display:flex;flex-direction:column;gap:1px;max-height:140px;overflow-y:auto"></div>',
'<div style="display:flex;gap:6px;margin-top:8px">',
'<button class="gs-btn primary" id="gs-char-apply" style="font-size:12px;flex:1">应用更改</button>',
'<button class="gs-btn xs" id="gs-char-revert">重读</button>',
'</div>',
'</div>',

'<div id="gs-ctrl-status" style="font-size:10px;color:#6a4a30;margin-top:4px;text-align:center"></div>',
'</div></div></div>'
].join('');
P.document.body.insertAdjacentHTML('beforeend', html);

/* ===== DOM ===== */
var bubble = P.document.getElementById('gs-bubble');
var panel = P.document.getElementById('gs-panel');
var mvuStatusEl = P.document.getElementById('gs-mvu-status');
var plotListEl = P.document.getElementById('gs-plot-list');
var charListEl = P.document.getElementById('gs-char-list');
var ctrlStatusEl = P.document.getElementById('gs-ctrl-status');

/* ===== Toast ===== */
function showToast(msg) {
  var t = P.document.createElement('div');
  t.className = 'gs-toast';
  t.textContent = msg;
  P.document.body.appendChild(t);
  setTimeout(function () { t.remove(); }, 2500);
}

/* ===== MVU ===== */
function refreshMvuStatus() {
  try {
    var cfg = window.SillyTavern.extensionSettings.mvu_settings;
    if (!cfg) { mvuStatusEl.textContent = '无法读取MVU配置,请确认已安装MVU'; return; }
    var mode = cfg['更新方式'];
    var n = cfg['通知'] || {};
    var ok = n['MVU框架加载成功'] && n['变量初始化成功'] && n['变量更新出错'] && n['额外模型解析中'];
    mvuStatusEl.innerHTML = (mode === '额外模型解析' ? '&#9679;' : '&#9675;') + ' 更新方式: ' + (mode || '未知') + '<br>' + (ok ? '&#9679;' : '&#9675;') + ' 四项通知: ' + (ok ? '全部开启' : '未全部开启');
  } catch (e) { mvuStatusEl.textContent = '读取MVU配置出错'; }
}

var mvuOptimizeBtn = P.document.getElementById('gs-mvu-optimize');
if (mvuOptimizeBtn) mvuOptimizeBtn.addEventListener('click', function () {
  try {
    var cfg = window.SillyTavern.extensionSettings.mvu_settings;
    if (!cfg) { showToast('mvu_settings不存在,请确认已安装MVU'); return; }
    cfg['更新方式'] = '额外模型解析';
    cfg['通知'] = cfg['通知'] || {};
    cfg['通知']['MVU框架加载成功'] = true;
    cfg['通知']['变量初始化成功'] = true;
    cfg['通知']['变量更新出错'] = true;
    cfg['通知']['额外模型解析中'] = true;
    cfg['额外模型解析配置'] = cfg['额外模型解析配置'] || {};
    var em = cfg['额外模型解析配置'];
    em['模型来源'] = '自定义';
    em['破限方案'] = '使用内置破限';
    em['应答格式'] = '聊天消息';
    em['请求方式'] = '依次请求，失败后重试';
    em['请求次数'] = 1;
    em['启用自动请求'] = true;
    em['最大回复token数'] = 65535;
    em['温度'] = 1;
    em['频率惩罚'] = 0;
    em['存在惩罚'] = 0;
    em['top_p'] = 1;
    em['top_k'] = 0;
    cfg['自动清理变量'] = cfg['自动清理变量'] || {};
    cfg['自动清理变量']['启用'] = true;
    cfg['自动清理变量']['快照保留间隔'] = 50;
    cfg['自动清理变量']['要保留变量的最近楼层数'] = 20;
    cfg['自动清理变量']['触发恢复变量的最近楼层数'] = 10;
    cfg['兼容性'] = cfg['兼容性'] || {};
    cfg['兼容性']['更新到聊天变量'] = true;
    cfg['兼容性']['显示老旧功能'] = false;
    cfg['兼容性']['sandas不视为user消息'] = false;
    window.SillyTavern.saveSettingsDebounced();
    refreshMvuStatus();
    showToast('MVU最优配置已应用,即将刷新页面...');
    setTimeout(function () { window.parent.location.reload(); }, 1800);
  } catch (e) { showToast('MVU配置失败: ' + e.message); }
});

/* ===== 剧情控制器 —— 硬编码列表 ===== */
var PLOT_COMMENTS = [
  '诡事长线·总纲',
  '诡事长线·EJS阶段调度',
  '诡事长线·开眼救援',
  '诡事长线·日月遗事',
  '诡事长线·小剧情库',
  '诡事长线·终局与大事件',
  '诡事录·剧情审查铁律',
  '诡事录·剧情审查铁律'
];
var CHAR_COMMENTS = [
  '人物详情：沈砚',
  '人物详情：陆拾',
  '人物详情：欧阳月',
  '人物详情：江晚',
  '人物详情：贺秉文'
];

var _allEntries = [], _dirty = false;

async function loadAllEntries() {
  try {
    var wbName = GS_WB_NAME;
    try {
      var raw = window.TavernHelper.getCharWorldbookNames('current');
      if (!raw || (raw.primary !== wbName && (!raw.additional || raw.additional.indexOf(wbName) === -1))) {
        var all = window.TavernHelper.getWorldbookNames();
        if (all && all.indexOf(wbName) === -1) { /* fallback */ }
      }
    } catch (e) {}
    var entries = await api_getWorldbook(wbName);
    _allEntries = (entries || []).map(function (e) {
      return { uid: e.uid, comment: e.name || '', enabled: !!e.enabled };
    });
    _dirty = false;
  } catch (e) { _allEntries = []; _dirty = false; }
}

function findEntry(comment) {
  return _allEntries.find(function (e) { return e.comment === comment; });
}

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

function renderCheckboxes(containerEl, commentList) {
  if (!containerEl) return;
  var found = 0, enabled = 0;
  var html = '';
  commentList.forEach(function (c) {
    var e = findEntry(c);
    if (!e) { html += '<div style="font-size:10px;color:#8a4a30;padding:2px 6px">' + esc(c) + ' (未找到)</div>'; return; }
    found++;
    if (e.enabled) enabled++;
    html += '<label class="gs-plot-row"><input type="checkbox" data-uid="' + e.uid + '"' + (e.enabled ? ' checked' : '') + '><span>' + esc(c) + '</span></label>';
  });
  containerEl.innerHTML = html || '<div style="font-size:10px;color:#6a4a30;padding:4px">无匹配条目</div>';
  return { found: found, enabled: enabled };
}

function renderAllLists() {
  var pRes = renderCheckboxes(plotListEl, PLOT_COMMENTS);
  var cRes = renderCheckboxes(charListEl, CHAR_COMMENTS);
  if (ctrlStatusEl) {
    var pText = pRes ? ('剧情 ' + pRes.enabled + '/' + pRes.found) : '剧情 --';
    var cText = cRes ? ('人物 ' + cRes.enabled + '/' + cRes.found) : '人物 --';
    ctrlStatusEl.innerHTML = pText + ' ｜ ' + cText + (_dirty ? ' <span style="color:#c8302a">未保存</span>' : '');
  }
}

/* 剧情开关按钮 */
function setEnabled(commentList, val) {
  commentList.forEach(function (c) {
    var e = findEntry(c);
    if (e) e.enabled = val;
  });
  _dirty = true;
  renderAllLists();
}

var plotOnBtn = P.document.getElementById('gs-plot-on');
var plotOffBtn = P.document.getElementById('gs-plot-off');
var charOnBtn = P.document.getElementById('gs-char-on');
var charOffBtn = P.document.getElementById('gs-char-off');

if (plotOnBtn) plotOnBtn.addEventListener('click', function () { setEnabled(PLOT_COMMENTS, true); });
if (plotOffBtn) plotOffBtn.addEventListener('click', function () { setEnabled(PLOT_COMMENTS, false); });
if (charOnBtn) charOnBtn.addEventListener('click', function () { setEnabled(CHAR_COMMENTS, true); });
if (charOffBtn) charOffBtn.addEventListener('click', function () { setEnabled(CHAR_COMMENTS, false); });

/* checkbox 单个切换 */
function onCbChange(e) {
  var cb = e.target;
  if (cb && cb.dataset && cb.dataset.uid !== undefined) {
    var uid = Number(cb.dataset.uid);
    var it = _allEntries.find(function (x) { return x.uid === uid; });
    if (it) { it.enabled = cb.checked; _dirty = true; renderAllLists(); }
  }
}
if (plotListEl) plotListEl.addEventListener('change', onCbChange);
if (charListEl) charListEl.addEventListener('change', onCbChange);

/* 应用 & 重读 */
async function applyChanges() {
  try {
    var patch = {};
    _allEntries.forEach(function (e) { patch[String(e.uid)] = !!e.enabled; });
    var patchJson = JSON.stringify(patch);
    var fresh = await api_replaceWorldbook(GS_WB_NAME, 'function(es){var p=' + patchJson + ';es.forEach(function(e){if(p[String(e.uid)]!==undefined)e.enabled=p[String(e.uid)]})}');
    if (fresh) {
      _allEntries = (fresh || []).map(function (e) { return { uid: e.uid, comment: e.name || '', enabled: !!e.enabled }; });
    }
    _dirty = false; renderAllLists(); showToast('更改已应用');
  } catch (e) { showToast('应用失败: ' + e.message); }
}

var plotApplyBtn = P.document.getElementById('gs-plot-apply');
var charApplyBtn = P.document.getElementById('gs-char-apply');
var plotRevertBtn = P.document.getElementById('gs-plot-revert');
var charRevertBtn = P.document.getElementById('gs-char-revert');

if (plotApplyBtn) plotApplyBtn.addEventListener('click', applyChanges);
if (charApplyBtn) charApplyBtn.addEventListener('click', applyChanges);
if (plotRevertBtn) plotRevertBtn.addEventListener('click', function () { loadAllEntries().then(renderAllLists); showToast('已重读'); });
if (charRevertBtn) charRevertBtn.addEventListener('click', function () { loadAllEntries().then(renderAllLists); showToast('已重读'); });

/* ===== 面板交互 ===== */
bubble.addEventListener('click', function () {
  if (panel.style.display !== 'none') { panel.style.display = 'none'; return; }
  var pw = P.innerWidth || window.innerWidth;
  var rect = bubble.getBoundingClientRect();
  var left = rect.left, top = rect.bottom + 6;
  if (left + 320 > pw - 10) left = pw - 330;
  if (left < 10) left = 10;
  if (top + 560 > (P.innerHeight || window.innerHeight) - 10) top = rect.top - 566;
  if (top < 10) top = 10;
  panel.style.left = left + 'px';
  panel.style.top = top + 'px';
  panel.style.display = 'flex';
  refreshMvuStatus();
  loadAllEntries().then(renderAllLists);
});

var closeBtn = P.document.getElementById('gs-close');
if (closeBtn) closeBtn.addEventListener('click', function (e) { e.stopPropagation(); panel.style.display = 'none'; });
var refreshBtn = P.document.getElementById('gs-refresh');
if (refreshBtn) refreshBtn.addEventListener('click', function () { refreshMvuStatus(); loadAllEntries().then(renderAllLists); });

/* 标签切换 */
var gsTabsEl = P.document.getElementById('gs-tabs');
if (gsTabsEl) gsTabsEl.addEventListener('click', function (e) {
  var tab = e.target;
  while (tab && tab !== gsTabsEl && !(tab.classList && tab.classList.contains('gs-tab'))) tab = tab.parentElement;
  if (tab && tab.classList && tab.classList.contains('gs-tab') && tab.dataset.screen) {
    var sn = tab.dataset.screen;
    var tabs = gsTabsEl.querySelectorAll('.gs-tab');
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle('active', tabs[i].dataset.screen === sn);
    var screens = panel.querySelectorAll('.gs-screen');
    for (var j = 0; j < screens.length; j++) screens[j].classList.toggle('active', screens[j].dataset.screen === sn);
  }
});

/* 外部点击关闭 */
P.document.addEventListener('mousedown', function (e) {
  if (panel.style.display === 'none') return;
  if (panel.contains(e.target) || bubble.contains(e.target)) return;
  panel.style.display = 'none';
});
panel.addEventListener('mouseenter', function () { refreshMvuStatus(); loadAllEntries().then(renderAllLists); });

/* 气泡拖拽 */
var dragBub = false, bSX, bSY, bOL, bOT;
function getXY(e) {
  if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}
bubble.addEventListener('mousedown', function (e) {
  if (e.button !== 0) return; e.preventDefault();
  var pt = getXY(e); dragBub = true; bSX = pt.x; bSY = pt.y;
  bOL = bubble.offsetLeft; bOT = bubble.offsetTop;
  bubble.style.transition = 'none';
});
bubble.addEventListener('touchstart', function (e) {
  var pt = getXY(e); dragBub = true; bSX = pt.x; bSY = pt.y;
  bOL = bubble.offsetLeft; bOT = bubble.offsetTop;
  bubble.style.transition = 'none';
}, { passive: false });
P.document.addEventListener('mousemove', function (e) {
  if (!dragBub) return; e.preventDefault();
  var pt = getXY(e);
  bubble.style.left = (bOL + pt.x - bSX) + 'px';
  bubble.style.top = (bOT + pt.y - bSY) + 'px';
});
P.document.addEventListener('touchmove', function (e) {
  if (!dragBub) return; e.preventDefault();
  var pt = getXY(e);
  bubble.style.left = (bOL + pt.x - bSX) + 'px';
  bubble.style.top = (bOT + pt.y - bSY) + 'px';
}, { passive: false });
P.document.addEventListener('mouseup', function () { if (dragBub) { dragBub = false; } });
P.document.addEventListener('touchend', function () { if (dragBub) { dragBub = false; } });

/* 面板拖拽 */
var dragHandle = P.document.getElementById('gs-drag');
var dragPnl = false, pSX, pSY, pOL, pOT;
if (dragHandle) {
  dragHandle.addEventListener('mousedown', function (e) {
    if (e.button !== 0 || e.target.tagName === 'BUTTON') return;
    var pt = getXY(e); dragPnl = true; pSX = pt.x; pSY = pt.y;
    pOL = panel.offsetLeft; pOT = panel.offsetTop;
  });
  dragHandle.addEventListener('touchstart', function (e) {
    if (e.target.tagName === 'BUTTON') return;
    var pt = getXY(e); dragPnl = true; pSX = pt.x; pSY = pt.y;
    pOL = panel.offsetLeft; pOT = panel.offsetTop;
  }, { passive: false });
  P.document.addEventListener('mousemove', function (e) {
    if (!dragPnl) return; e.preventDefault();
    var pt = getXY(e);
    panel.style.left = (pOL + pt.x - pSX) + 'px';
    panel.style.top = (pOT + pt.y - pSY) + 'px';
  });
  P.document.addEventListener('touchmove', function (e) {
    if (!dragPnl) return; e.preventDefault();
    var pt = getXY(e);
    panel.style.left = (pOL + pt.x - pSX) + 'px';
    panel.style.top = (pOT + pt.y - pSY) + 'px';
  }, { passive: false });
  P.document.addEventListener('mouseup', function () { dragPnl = false; });
  P.document.addEventListener('touchend', function () { dragPnl = false; });
}

refreshMvuStatus();


/* ===== 提示词模板一键配置 ===== */
var EJS_OPTIMAL={enabled:true,generate_enabled:true,generate_loader_enabled:true,
render_enabled:true,render_loader_enabled:true,with_context_disabled:false,
debug_enabled:false,autosave_enabled:false,preload_worldinfo_enabled:true,
code_blocks_enabled:true,raw_message_evaluation_enabled:true,filter_message_enabled:true,
inject_loader_enabled:false,invert_enabled:true,depth_limit:-1,
compile_workers:false,sandbox:false};
function checkEjsTemplate(){
  try{
    var ejs=((window.SillyTavern||{}).extensionSettings||{}).EjsTemplate;
    var el=P.document.getElementById("gs-ejs-status");
    if(!el)return;
    if(!ejs){el.innerHTML="提示词模板未安装";return}
    var dis=(window.SillyTavern.extensionSettings.disabledExtensions||[]);
    if(dis.indexOf("third-party/ST-Prompt-Template")!==-1){el.innerHTML="提示词模板已禁用";return}
    var issues=[],keys=Object.keys(EJS_OPTIMAL);
    for(var i=0;i<keys.length;i++){if(ejs[keys[i]]!==EJS_OPTIMAL[keys[i]])issues.push(keys[i])}
    el.innerHTML=issues.length===0?"提示词模板配置最优":(issues.length+"项偏差");
  }catch(e){var ej=P.document.getElementById("gs-ejs-status");if(ej)ej.textContent="检测失败"}
}
function applyOptimalEjs(){
  try{
    var ejs=((window.SillyTavern||{}).extensionSettings||{}).EjsTemplate;
    if(!ejs){showToast("提示词模板未安装");return}
    var dis=(window.SillyTavern.extensionSettings.disabledExtensions||[]);
    if(dis.indexOf("third-party/ST-Prompt-Template")!==-1){showToast("提示词模板已禁用");return}
    var keys=Object.keys(EJS_OPTIMAL);
    for(var i=0;i<keys.length;i++){ejs[keys[i]]=EJS_OPTIMAL[keys[i]]}
    try{window.SillyTavern.saveSettingsDebounced()}catch(e){}
    checkEjsTemplate();
    showToast("提示词模板已设为最优,即将刷新...");
    setTimeout(function(){window.parent.location.reload()},2000);
  }catch(e){showToast("配置失败: "+e.message)}
}

})();