/**
 * 诡事录配置小助手 v1.6
 * MVU最优配置 + 提示词模板 + 剧情/人物双控制器
 * 
 * 使用方式:
 *   import { initGuishiluAssistant, applyOptimalMvu, applyOptimalEjs, EJS_OPTIMAL } from './guishilu-config-assistant.js';
 *   initGuishiluAssistant(window.parent);  // 在 SIllyTavern TavernHelper 中初始化
 */

const GS_WB_NAME = '诡事录';

/* ===== Toast ===== */
function showToast(msg, parentWindow) {
    const t = parentWindow.document.createElement('div');
    t.className = 'gs-toast';
    t.textContent = msg;
    parentWindow.document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
}

/* ===== runInParent ===== */
function runInParent(fnString, parentWindow) {
    return new Promise((resolve, reject) => {
        const token = 'gs_' + Date.now() + '_' + Math.random().toString(36).slice(2);
        function handler(e) {
            if (!e.detail || e.detail.token !== token) return;
            parentWindow.document.removeEventListener('gs-result', handler);
            if (e.detail.error) reject(new Error(e.detail.error));
            else resolve(e.detail.result);
        }
        parentWindow.document.addEventListener('gs-result', handler);
        const script = parentWindow.document.createElement('script');
        script.textContent = '(async function(){try{var r=await(' + fnString + ');document.dispatchEvent(new CustomEvent("gs-result",{detail:{token:"' + token + '",result:r}}))}catch(e){document.dispatchEvent(new CustomEvent("gs-result",{detail:{token:"' + token + '",error:e.message||String(e)}}))}})();';
        parentWindow.document.body.appendChild(script);
        script.remove();
    });
}

/* 世界书API */
function api_getWorldbook(name, parentWindow) {
    return runInParent('TavernHelper.getWorldbook(' + JSON.stringify(name) + ')', parentWindow);
}
function api_replaceWorldbook(name, modifierFn, parentWindow) {
    return runInParent('(async function(){var es=await TavernHelper.getWorldbook(' + JSON.stringify(name) + ');(' + modifierFn + ')(es);await TavernHelper.replaceWorldbook(' + JSON.stringify(name) + ',es);return await TavernHelper.getWorldbook(' + JSON.stringify(name) + ')})()', parentWindow);
}

/* ===== MVU 最优配置 ===== */
function refreshMvuStatus(mvuStatusEl, parentWindow) {
    try {
        const cfg = parentWindow.SillyTavern.extensionSettings.mvu_settings;
        if (!cfg) { mvuStatusEl.textContent = '无法读取MVU配置,请确认已安装MVU'; return; }
        const mode = cfg['更新方式'];
        const n = cfg['通知'] || {};
        const ok = n['MVU框架加载成功'] && n['变量初始化成功'] && n['变量更新出错'] && n['额外模型解析中'];
        mvuStatusEl.innerHTML = (mode === '额外模型解析' ? '&#9679;' : '&#9675;') + ' 更新方式: ' + (mode || '未知') + '<br>' + (ok ? '&#9679;' : '&#9675;') + ' 四项通知: ' + (ok ? '全部开启' : '未全部开启');
    } catch (e) { mvuStatusEl.textContent = '读取MVU配置出错'; }
}

export function applyOptimalMvu(parentWindow) {
    try {
        const cfg = parentWindow.SillyTavern.extensionSettings.mvu_settings;
        if (!cfg) { showToast('mvu_settings不存在,请确认已安装MVU', parentWindow); return false; }
        cfg['更新方式'] = '额外模型解析';
        cfg['通知'] = cfg['通知'] || {};
        cfg['通知']['MVU框架加载成功'] = true;
        cfg['通知']['变量初始化成功'] = true;
        cfg['通知']['变量更新出错'] = true;
        cfg['通知']['额外模型解析中'] = true;
        cfg['额外模型解析配置'] = cfg['额外模型解析配置'] || {};
        const em = cfg['额外模型解析配置'];
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
        parentWindow.SillyTavern.saveSettingsDebounced();
        showToast('MVU最优配置已应用,即将刷新页面...', parentWindow);
        setTimeout(() => { parentWindow.location.reload(); }, 1800);
        return true;
    } catch (e) { showToast('MVU配置失败: ' + e.message, parentWindow); return false; }
}

/* ===== 提示词模板配置 ===== */
export const EJS_OPTIMAL = {
    enabled: true, generate_enabled: true, generate_loader_enabled: true,
    render_enabled: true, render_loader_enabled: true, with_context_disabled: false,
    debug_enabled: false, autosave_enabled: false, preload_worldinfo_enabled: true,
    code_blocks_enabled: true, raw_message_evaluation_enabled: true, filter_message_enabled: true,
    inject_loader_enabled: false, invert_enabled: true, depth_limit: -1,
    compile_workers: false, sandbox: false
};

function checkEjsTemplate(ejsStatusEl, parentWindow) {
    try {
        const ejs = ((parentWindow.SillyTavern || {}).extensionSettings || {}).EjsTemplate;
        if (!ejsStatusEl) return;
        if (!ejs) { ejsStatusEl.innerHTML = "提示词模板未安装"; return; }
        const dis = (parentWindow.SillyTavern.extensionSettings.disabledExtensions || []);
        if (dis.indexOf("third-party/ST-Prompt-Template") !== -1) { ejsStatusEl.innerHTML = "提示词模板已禁用"; return; }
        const issues = [], keys = Object.keys(EJS_OPTIMAL);
        for (let i = 0; i < keys.length; i++) { if (ejs[keys[i]] !== EJS_OPTIMAL[keys[i]]) issues.push(keys[i]); }
        ejsStatusEl.innerHTML = issues.length === 0 ? "提示词模板配置最优" : (issues.length + "项偏差");
    } catch (e) { if (ejsStatusEl) ejsStatusEl.textContent = "检测失败"; }
}

export function applyOptimalEjs(parentWindow) {
    try {
        const ejs = ((parentWindow.SillyTavern || {}).extensionSettings || {}).EjsTemplate;
        if (!ejs) { showToast("提示词模板未安装", parentWindow); return false; }
        const dis = (parentWindow.SillyTavern.extensionSettings.disabledExtensions || []);
        if (dis.indexOf("third-party/ST-Prompt-Template") !== -1) { showToast("提示词模板已禁用", parentWindow); return false; }
        const keys = Object.keys(EJS_OPTIMAL);
        for (let i = 0; i < keys.length; i++) { ejs[keys[i]] = EJS_OPTIMAL[keys[i]]; }
        try { parentWindow.SillyTavern.saveSettingsDebounced(); } catch (e) {}
        showToast("提示词模板已设为最优,即将刷新...", parentWindow);
        setTimeout(() => { parentWindow.location.reload(); }, 2000);
        return true;
    } catch (e) { showToast("配置失败: " + e.message, parentWindow); return false; }
}

/* ===== 剧情控制器 ===== */
const PLOT_COMMENTS = [
    '诡事长线·总纲',
    '诡事长线·EJS阶段调度',
    '诡事长线·开眼救援',
    '诡事长线·日月遗事',
    '诡事长线·小剧情库',
    '诡事长线·终局与大事件',
    '诡事录·剧情审查铁律',
    '诡事录·剧情审查铁律'
];

const CHAR_COMMENTS = [
    '人物详情：沈砚',
    '人物详情：陆拾',
    '人物详情：欧阳月',
    '人物详情：江晚',
    '人物详情：贺秉文'
];

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

function findEntry(allEntries, comment) {
    return allEntries.find(e => e.comment === comment);
}

function renderCheckboxes(containerEl, commentList, allEntries) {
    if (!containerEl) return null;
    let found = 0, enabled = 0;
    let html = '';
    commentList.forEach((c) => {
        const e = findEntry(allEntries, c);
        if (!e) { html += '<div style="font-size:10px;color:#8a4a30;padding:2px 6px">' + esc(c) + ' (未找到)</div>'; return; }
        found++;
        if (e.enabled) enabled++;
        html += '<label class="gs-plot-row"><input type="checkbox" data-uid="' + e.uid + '"' + (e.enabled ? ' checked' : '') + '><span>' + esc(c) + '</span></label>';
    });
    containerEl.innerHTML = html || '<div style="font-size:10px;color:#6a4a30;padding:4px">无匹配条目</div>';
    return { found, enabled };
}

/* ===== CSS ===== */
const GS_CSS = [
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

/* ===== HTML 模板 ===== */
function getPanelHTML() {
    return [
        '<div id="gs-bubble" style="top:50vh;left:14px" title="诡事录配置小助手"><span>诡</span></div>',
        '<div id="gs-panel" class="gs-panel" style="display:none;left:64px;top:40vh">',
        '<div class="gs-header" id="gs-drag"><span class="gs-header-title">诡事录配置小助手</span>',
        '<div style="display:flex;align-items:center;gap:4px">',
        '<button class="gs-btn xs" id="gs-refresh">刷新</button>',
        '<button class="gs-btn xs" id="gs-close" style="font-size:14px;padding:4px 8px!important">X</button></div></div>',
        '<div id="gs-tabs"><button class="gs-tab active" data-screen="home">MVU配置</button>',
        '<button class="gs-tab" data-screen="plot">剧情控制器</button></div>',
        '<div style="flex:1;overflow:hidden">',
        '<div class="gs-screen active" data-screen="home"><div class="gs-section">',
        '<div class="gs-section-title">MVU插件配置</div>',
        '<div id="gs-mvu-status" style="font-size:11px;color:#b89060;margin-bottom:8px;text-align:center;line-height:1.6"></div>',
        '<button class="gs-btn primary" id="gs-mvu-optimize">一键最优配置</button>',
        '<div style="font-size:10px;color:#6a4a30;margin-top:6px;text-align:center;line-height:1.5">额外模型解析 + 内置破限 + 四项通知全开 + 自动清理</div></div><div class="gs-section"><div class="gs-section-title">提示词模板配置</div><div id="gs-ejs-status" style="font-size:11px;color:#b89060;margin-bottom:8px;text-align:center;line-height:1.6"></div><button class="gs-btn primary" id="gs-ejs-optimize">一键最优配置</button><div style="font-size:10px;color:#6a4a30;margin-top:6px;text-align:center;line-height:1.5">一键配置EJS提示词模板为最优参数</div></div></div>',
        '<div class="gs-screen" data-screen="plot">',
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
}

function getXY(e) {
    if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
}

/* ===== 核心初始化 ===== */
export function initGuishiluAssistant(parentWindow) {
    if (!parentWindow) {
        console.error('[诡事录配置小助手] parentWindow 未提供');
        return false;
    }

    const P = parentWindow;
    delete P._gsConfigLoaded;
    if (P._gsConfigLoaded) return false;
    P._gsConfigLoaded = true;

    /* 清理旧实例 */
    (() => {
        ['gs-bubble', 'gs-panel', 'gs-style'].forEach(id => { const el = P.document.getElementById(id); if (el) el.remove(); });
        if (typeof P._gsCleanup === 'function') { try { P._gsCleanup(); } catch (e) {} }
        delete P._gsCleanup;
    })();

    /* CSS */
    const cssEl = P.document.createElement('style');
    cssEl.id = 'gs-style';
    cssEl.textContent = GS_CSS;
    P.document.head.appendChild(cssEl);

    /* HTML */
    P.document.body.insertAdjacentHTML('beforeend', getPanelHTML());

    /* DOM */
    const bubble = P.document.getElementById('gs-bubble');
    const panel = P.document.getElementById('gs-panel');
    const mvuStatusEl = P.document.getElementById('gs-mvu-status');
    const ejsStatusEl = P.document.getElementById('gs-ejs-status');
    const plotListEl = P.document.getElementById('gs-plot-list');
    const charListEl = P.document.getElementById('gs-char-list');
    const ctrlStatusEl = P.document.getElementById('gs-ctrl-status');

    /* 状态 */
    let _allEntries = [], _dirty = false;

    async function loadAllEntries() {
        try {
            const entries = await api_getWorldbook(GS_WB_NAME, P);
            _allEntries = (entries || []).map(e => ({ uid: e.uid, comment: e.name || '', enabled: !!e.enabled }));
            _dirty = false;
        } catch (e) { _allEntries = []; _dirty = false; }
    }

    function renderAllLists() {
        const pRes = renderCheckboxes(plotListEl, PLOT_COMMENTS, _allEntries);
        const cRes = renderCheckboxes(charListEl, CHAR_COMMENTS, _allEntries);
        if (ctrlStatusEl) {
            const pText = pRes ? ('剧情 ' + pRes.enabled + '/' + pRes.found) : '剧情 --';
            const cText = cRes ? ('人物 ' + cRes.enabled + '/' + cRes.found) : '人物 --';
            ctrlStatusEl.innerHTML = pText + ' | ' + cText + (_dirty ? ' <span style="color:#c8302a">未保存</span>' : '');
        }
    }

    function setEnabled(commentList, val) {
        commentList.forEach(c => {
            const e = findEntry(_allEntries, c);
            if (e) e.enabled = val;
        });
        _dirty = true;
        renderAllLists();
    }

    /* MVU 按钮 */
    const mvuBtn = P.document.getElementById('gs-mvu-optimize');
    if (mvuBtn) mvuBtn.addEventListener('click', () => {
        applyOptimalMvu(P);
        refreshMvuStatus(mvuStatusEl, P);
    });

    /* EJS 按钮 */
    const ejsBtn = P.document.getElementById('gs-ejs-optimize');
    if (ejsBtn) ejsBtn.addEventListener('click', () => {
        applyOptimalEjs(P);
        checkEjsTemplate(ejsStatusEl, P);
    });

    /* 剧情/人物开关 */
    const plotOnBtn = P.document.getElementById('gs-plot-on');
    const plotOffBtn = P.document.getElementById('gs-plot-off');
    const charOnBtn = P.document.getElementById('gs-char-on');
    const charOffBtn = P.document.getElementById('gs-char-off');

    if (plotOnBtn) plotOnBtn.addEventListener('click', () => setEnabled(PLOT_COMMENTS, true));
    if (plotOffBtn) plotOffBtn.addEventListener('click', () => setEnabled(PLOT_COMMENTS, false));
    if (charOnBtn) charOnBtn.addEventListener('click', () => setEnabled(CHAR_COMMENTS, true));
    if (charOffBtn) charOffBtn.addEventListener('click', () => setEnabled(CHAR_COMMENTS, false));

    /* checkbox 单个切换 */
    function onCbChange(e) {
        const cb = e.target;
        if (cb && cb.dataset && cb.dataset.uid !== undefined) {
            const uid = Number(cb.dataset.uid);
            const it = _allEntries.find(x => x.uid === uid);
            if (it) { it.enabled = cb.checked; _dirty = true; renderAllLists(); }
        }
    }
    if (plotListEl) plotListEl.addEventListener('change', onCbChange);
    if (charListEl) charListEl.addEventListener('change', onCbChange);

    /* 应用 & 重读 */
    async function applyChanges() {
        try {
            const patch = {};
            _allEntries.forEach(e => { patch[String(e.uid)] = !!e.enabled; });
            const patchJson = JSON.stringify(patch);
            const fresh = await api_replaceWorldbook(GS_WB_NAME, 'function(es){var p=' + patchJson + ';es.forEach(function(e){if(p[String(e.uid)]!==undefined)e.enabled=p[String(e.uid)]})}', P);
            if (fresh) {
                _allEntries = (fresh || []).map(e => ({ uid: e.uid, comment: e.name || '', enabled: !!e.enabled }));
            }
            _dirty = false; renderAllLists(); showToast('更改已应用', P);
        } catch (e) { showToast('应用失败: ' + e.message, P); }
    }

    const plotApplyBtn = P.document.getElementById('gs-plot-apply');
    const charApplyBtn = P.document.getElementById('gs-char-apply');
    const plotRevertBtn = P.document.getElementById('gs-plot-revert');
    const charRevertBtn = P.document.getElementById('gs-char-revert');

    if (plotApplyBtn) plotApplyBtn.addEventListener('click', applyChanges);
    if (charApplyBtn) charApplyBtn.addEventListener('click', applyChanges);
    if (plotRevertBtn) plotRevertBtn.addEventListener('click', () => { loadAllEntries().then(renderAllLists); showToast('已重读', P); });
    if (charRevertBtn) charRevertBtn.addEventListener('click', () => { loadAllEntries().then(renderAllLists); showToast('已重读', P); });

    /* 面板交互 */
    bubble.addEventListener('click', () => {
        if (panel.style.display !== 'none') { panel.style.display = 'none'; return; }
        const pw = P.innerWidth || window.innerWidth;
        const rect = bubble.getBoundingClientRect();
        let left = rect.left, top = rect.bottom + 6;
        if (left + 320 > pw - 10) left = pw - 330;
        if (left < 10) left = 10;
        if (top + 560 > (P.innerHeight || window.innerHeight) - 10) top = rect.top - 566;
        if (top < 10) top = 10;
        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
        panel.style.display = 'flex';
        refreshMvuStatus(mvuStatusEl, P);
        checkEjsTemplate(ejsStatusEl, P);
        loadAllEntries().then(renderAllLists);
    });

    const closeBtn = P.document.getElementById('gs-close');
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); panel.style.display = 'none'; });

    const refreshBtn = P.document.getElementById('gs-refresh');
    if (refreshBtn) refreshBtn.addEventListener('click', () => {
        refreshMvuStatus(mvuStatusEl, P);
        checkEjsTemplate(ejsStatusEl, P);
        loadAllEntries().then(renderAllLists);
    });

    /* 标签切换 */
    const tabsEl = P.document.getElementById('gs-tabs');
    if (tabsEl) tabsEl.addEventListener('click', (e) => {
        let tab = e.target;
        while (tab && tab !== tabsEl && !(tab.classList && tab.classList.contains('gs-tab'))) tab = tab.parentElement;
        if (tab && tab.classList && tab.classList.contains('gs-tab') && tab.dataset.screen) {
            const sn = tab.dataset.screen;
            const tabs = tabsEl.querySelectorAll('.gs-tab');
            for (let i = 0; i < tabs.length; i++) tabs[i].classList.toggle('active', tabs[i].dataset.screen === sn);
            const screens = panel.querySelectorAll('.gs-screen');
            for (let j = 0; j < screens.length; j++) screens[j].classList.toggle('active', screens[j].dataset.screen === sn);
        }
    });

    /* 外部点击关闭 */
    P.document.addEventListener('mousedown', (e) => {
        if (panel.style.display === 'none') return;
        if (panel.contains(e.target) || bubble.contains(e.target)) return;
        panel.style.display = 'none';
    });

    panel.addEventListener('mouseenter', () => {
        refreshMvuStatus(mvuStatusEl, P);
        checkEjsTemplate(ejsStatusEl, P);
        loadAllEntries().then(renderAllLists);
    });

    /* 气泡拖拽 */
    let dragBub = false, bSX, bSY, bOL, bOT;
    bubble.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; e.preventDefault();
        const pt = getXY(e); dragBub = true; bSX = pt.x; bSY = pt.y;
        bOL = bubble.offsetLeft; bOT = bubble.offsetTop;
        bubble.style.transition = 'none';
    });
    bubble.addEventListener('touchstart', (e) => {
        const pt = getXY(e); dragBub = true; bSX = pt.x; bSY = pt.y;
        bOL = bubble.offsetLeft; bOT = bubble.offsetTop;
        bubble.style.transition = 'none';
    }, { passive: false });
    P.document.addEventListener('mousemove', (e) => {
        if (!dragBub) return; e.preventDefault();
        const pt = getXY(e);
        bubble.style.left = (bOL + pt.x - bSX) + 'px';
        bubble.style.top = (bOT + pt.y - bSY) + 'px';
    });
    P.document.addEventListener('touchmove', (e) => {
        if (!dragBub) return; e.preventDefault();
        const pt = getXY(e);
        bubble.style.left = (bOL + pt.x - bSX) + 'px';
        bubble.style.top = (bOT + pt.y - bSY) + 'px';
    }, { passive: false });
    P.document.addEventListener('mouseup', () => { dragBub = false; });
    P.document.addEventListener('touchend', () => { dragBub = false; });

    /* 面板拖拽 */
    const dragHandle = P.document.getElementById('gs-drag');
    let dragPnl = false, pSX, pSY, pOL, pOT;
    if (dragHandle) {
        dragHandle.addEventListener('mousedown', (e) => {
            if (e.button !== 0 || e.target.tagName === 'BUTTON') return;
            const pt = getXY(e); dragPnl = true; pSX = pt.x; pSY = pt.y;
            pOL = panel.offsetLeft; pOT = panel.offsetTop;
        });
        dragHandle.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            const pt = getXY(e); dragPnl = true; pSX = pt.x; pSY = pt.y;
            pOL = panel.offsetLeft; pOT = panel.offsetTop;
        }, { passive: false });
        P.document.addEventListener('mousemove', (e) => {
            if (!dragPnl) return; e.preventDefault();
            const pt = getXY(e);
            panel.style.left = (pOL + pt.x - pSX) + 'px';
            panel.style.top = (pOT + pt.y - pSY) + 'px';
        });
        P.document.addEventListener('touchmove', (e) => {
            if (!dragPnl) return; e.preventDefault();
            const pt = getXY(e);
            panel.style.left = (pOL + pt.x - pSX) + 'px';
            panel.style.top = (pOT + pt.y - pSY) + 'px';
        }, { passive: false });
        P.document.addEventListener('mouseup', () => { dragPnl = false; });
        P.document.addEventListener('touchend', () => { dragPnl = false; });
    }

    refreshMvuStatus(mvuStatusEl, P);
    checkEjsTemplate(ejsStatusEl, P);

    return true;
}

/* 清理 */
export function destroyGuishiluAssistant(parentWindow) {
    const P = parentWindow || window.parent;
    ['gs-bubble', 'gs-panel', 'gs-style'].forEach(id => { const el = P.document.getElementById(id); if (el) el.remove(); });
    delete P._gsConfigLoaded;
}
