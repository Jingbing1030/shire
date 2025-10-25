// ==UserScript==
// @name         H2O-RSS
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  信息流主页，ai还是太好用了你知道吗
// @author       景冰
// @match        https://www.shireyishunjian.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @connect      shireyishunjian.com
// @require      https://raw.githubusercontent.com/Jingbing1030/shire/refs/heads/main/1.js
// @icon         https://www.shireyishunjian.com/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    // 工具函数：自动配色
    function getColorByName(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        let hue = Math.abs(hash) % 360;
        return `hsl(${hue},65%,54%)`;
    }

    // 默认源（首次加载不可删除，可禁用，仅写URL）
    const DEFAULT_SOURCES = [
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=7&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=0&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=5&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=7&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=47&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=78&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=83&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=85&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=87&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=180&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=251&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=263&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=265&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=295&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=296&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=299&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=301&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=302&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=303&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=304&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=306&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=456&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=463&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=471&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=488&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=489&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=490&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=497&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=499&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=504&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=510&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=513&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=514&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=515&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=516&auth=",
        "https://www.shireyishunjian.com/main/forum.php?mod=rss&fid=517&auth="
    ];

    // 样式
    GM_addStyle(`
        .rss-injection-container {
            max-width: 1200px;
            margin: 30px auto;
            padding: 0 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .rss-header {display:none;}
        .rss-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        .rss-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            position: relative;
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .rss-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.12);
        }
        .rss-card.read {
            opacity: 0.85;
            background: #fafbfc;
        }
        .rss-card.read:after {
            content: "已读";
            position: absolute;
            top: 12px;
            right: 12px;
            background: #27ae60;
            color: white;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;
            z-index: 2;
        }
        .card-category {
            padding: 10px 18px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            z-index: 2;
        }
        .card-category span {
            margin-left: 10px;
        }
        .card-content {
            padding: 18px;
            cursor: pointer;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }
        .card-title {
            font-size: 19px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #2c3e50;
            line-height: 1.4;
        }
        .card-excerpt {
            color: #5c6770;
            font-size: 15px;
            line-height: 1.5;
            margin-bottom: 15px;
            flex-grow: 1;
        }
        .card-meta {
            display: flex;
            justify-content: space-between;
            color: #7f8c8d;
            font-size: 14px;
            padding-top: 12px;
            border-top: 1px solid #f0f2f5;
        }
        .card-author {display:flex;align-items:center;}
        .card-date {display:flex;align-items:center;}
        .loading {
            text-align: center;
            padding: 30px;
            color: #7f8c8d;
        }
        .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        @keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
        .empty-state {
            text-align: center;
            padding: 50px 20px;
            color: #7f8c8d;
            grid-column: 1 / -1;
        }
        .rss-stats {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            color: #7f8c8d;
            font-size: 14px;
        }
        #rss-hamburger {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 1001;
            width: 50px;
            height: 50px;
            background: none;
            border: none;
            outline: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #rss-hamburger .hamburger-icon {width:32px;height:32px;display:block;}
        #rss-hamburger .close-icon {font-size:32px;color:#e74c3c;}
        #rss-side-menu {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1100;
            width: 340px;
            height: 100vh;
            background: #fff;
            box-shadow: 2px 0 20px rgba(44,62,80,0.12);
            padding: 0;
            transition: transform 0.3s cubic-bezier(0.7,0,0.3,1);
            transform: translateX(-100%);
            display: flex;
            flex-direction: column;
        }
        #rss-side-menu.open {transform:translateX(0);}
        #rss-side-menu-header {
            display:flex;align-items:center;
            padding:18px 24px;
            border-bottom:1px solid #f0f2f5;
            font-size:20px;font-weight:700;color:#3498db;
        }
        #rss-side-menu-body {flex:1;overflow-y:auto;padding:16px 24px;}
        #rss-side-menu-footer {
            padding:18px 24px;border-top:1px solid #f0f2f5;
            text-align:center;font-size:13px;color:#7f8c8d;
        }
        .rss-setting-group {margin-bottom:18px;}
        .rss-setting-group label {
            font-weight:600;display:block;margin-bottom:8px;
        }
        .rss-source-list {padding:0;list-style:none;}
        .rss-source-list li {
            margin-bottom:8px;
            border-left:4px solid #3498db;
            padding-left:8px;
            font-size:15px;
            display:flex;
            align-items:center;
            justify-content:space-between;
        }
        .rss-source-delete-btn {
            margin-left:10px;
            font-size:16px;
            color:#e74c3c;
            background:none;
            border:none;
            cursor:pointer;
            font-weight:bold;
            width:28px;
            height:28px;
            text-align:center;
            border-radius:50%;
        }
        .rss-source-delete-btn:hover {background:#fee;}
        .rss-source-disabled {
            color:#aaa !important;
            text-decoration:line-through;
            font-weight:400;
        }
        .rss-source-default {
            opacity:0.85;
        }
        .rss-source-name {
            cursor:pointer;
            transition:color 0.2s;
            user-select:none;
        }
        #rss-side-menu-close {
            position:absolute;top:8px;right:10px;z-index:1200;
            background:none;border:none;font-size:32px;color:#e74c3c;cursor:pointer;
        }
        @media (max-width: 768px) {
            .rss-grid {grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));}
            #rss-side-menu {width:90vw;}
        }
    `);

    // 侧边菜单相关
    function injectHamburger(updateSettingsMenu) {
        const mzlogo = document.querySelector('html body#portal.pg_index div.header.cl div.mzlogo');
        if (mzlogo) {
            mzlogo.innerHTML = '';
            mzlogo.style.position = 'relative';
            mzlogo.style.zIndex = '1000';
            const hamburgerBtn = document.createElement('button');
            hamburgerBtn.id = 'rss-hamburger';
            hamburgerBtn.innerHTML = `
                <span class="hamburger-icon">
                    <svg viewBox="0 0 32 32" width="32" height="32">
                        <rect y="7" width="32" height="4" rx="2" fill="#3498db"></rect>
                        <rect y="15" width="32" height="4" rx="2" fill="#3498db"></rect>
                        <rect y="23" width="32" height="4" rx="2" fill="#3498db"></rect>
                    </svg>
                </span>
            `;
            hamburgerBtn.style.zIndex = '1001';
            mzlogo.appendChild(hamburgerBtn);

            const menu = document.createElement('div');
            menu.id = 'rss-side-menu';
            menu.innerHTML = `
                <div id="rss-side-menu-header">
                    <span>内容与脚本设置</span>
                </div>
                <div id="rss-side-menu-body"></div>
                <div id="rss-side-menu-footer">
                     RSS 注入器 v1.0（？） &copy; YourName
                </div>
                <button id="rss-side-menu-close" title="关闭菜单">×</button>
            `;
            document.body.appendChild(menu);

            hamburgerBtn.onclick = function(e) {
                e.stopPropagation();
                menu.classList.add('open');
                hamburgerBtn.style.display = 'none';
                mzlogo.style.zIndex = '1100';
                updateSettingsMenu(menu.querySelector('#rss-side-menu-body'));
            };

            menu.querySelector('#rss-side-menu-close').onclick = function(e) {
                e.stopPropagation();
                menu.classList.remove('open');
                hamburgerBtn.style.display = '';
                mzlogo.style.zIndex = '1000';
            };

            document.addEventListener('click', function(e) {
                if (menu.classList.contains('open')) {
                    if (!menu.contains(e.target) && e.target !== hamburgerBtn) {
                        menu.classList.remove('open');
                        hamburgerBtn.style.display = '';
                        mzlogo.style.zIndex = '1000';
                    }
                }
            });
        }
    }

    // 自动获取RSS源名称
    function fetchRssName(url) {
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                onload: function(response) {
                    try {
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(response.responseText, "text/xml");
                        const channel = xmlDoc.querySelector('channel');
                        const title = channel?.querySelector('title')?.textContent;
                        resolve(title || url);
                    } catch {
                        resolve(url);
                    }
                },
                onerror: function() { resolve(url);}
            });
        });
    }

    // 初始化用户源列表（首次加载自动获取源名）
    async function initUserSources() {
        let sources = GM_getValue('rss_sources', null);
        if (!sources) {
            let arr = [];
            for (let url of DEFAULT_SOURCES) {
                let name = await fetchRssName(url);
                arr.push({url, name, isDefault:true});
            }
            GM_setValue('rss_sources', arr);
            GM_setValue('rss_disabled', []);
        }
    }

    // 侧边菜单设置内容
    function updateSettingsMenu(bodyEl) {
        let rssSources = GM_getValue('rss_sources', []);
        let disabledRss = GM_getValue('rss_disabled', []);
        let readItems = GM_getValue('read_items', {});

        let sourceHtml = `
            <div class="rss-setting-group">
                <label>RSS源管理：</label>
                <ul class="rss-source-list">
                    ${rssSources.map((s,i)=>{
                        let isDisabled = disabledRss.indexOf(i)!==-1;
                        let color = getColorByName(s.name);
                        let nameClass = "rss-source-name";
                        if(isDisabled) nameClass += " rss-source-disabled";
                        if(s.isDefault) nameClass += " rss-source-default";
                        return `
                        <li style="border-left-color:${color}">
                            <span class="${nameClass}" data-index="${i}" style="color:${isDisabled?"#aaa":color}">
                                ${s.name}
                            </span>
                            ${
                                s.isDefault?""
                                :`<button class="rss-source-delete-btn" data-index="${i}" title="删除">×</button>`
                            }
                        </li>
                        `;
                    }).join('')}
                </ul>
                <div style="margin-top:10px;">
                    <input type="text" id="rss-add-url" placeholder="新源URL" style="width:55%;margin-right:3px;">
                    <button id="rss-add-btn">添加</button>
                </div>
            </div>
        `;

        let controlHtml = `
            <div class="rss-setting-group">
                <label>管理与帮助：</label>
                <button id="rss-clear-read" style="margin-bottom:8px;">让你的已读标签全部消失掉咪</button>
                <button id="rss-reload-now" style="margin-bottom:8px;margin-left:8px;">刷新全部内容</button>
                <button id="rss-reset-all" style="margin-bottom:8px;margin-left:8px;background:#f6eaea;color:#e74c3c;">点一下重置脚本设置</button>
                <div style="margin-top:8px;font-size:13px;color:#888;">
                    点击这个源名可禁用/启用源，灰色加删除线表示禁用。X号删除用户自定义源。默认源不可删除的，仅可禁用的。
                </div>
            </div>
        `;

        bodyEl.innerHTML = sourceHtml + controlHtml;

        // 禁用/启用源
        bodyEl.querySelectorAll('.rss-source-name').forEach(el => {
            el.onclick = function() {
                let idx = parseInt(this.dataset.index);
                let disabled = GM_getValue('rss_disabled', []);
                if (disabled.indexOf(idx)!==-1) {
                    disabled = disabled.filter(d=>d!==idx);
                } else {
                    disabled.push(idx);
                }
                GM_setValue('rss_disabled', disabled);
                updateSettingsMenu(bodyEl);
            };
        });
        // 删除自定义源
        bodyEl.querySelectorAll('.rss-source-delete-btn').forEach(el=>{
            el.onclick = function() {
                let idx = parseInt(this.dataset.index);
                let arr = GM_getValue('rss_sources', []);
                arr.splice(idx, 1);
                GM_setValue('rss_sources', arr);
                let disabled = GM_getValue('rss_disabled', []).filter(i=>i!==idx).map(i=>i>idx?i-1:i);
                GM_setValue('rss_disabled', disabled);
                updateSettingsMenu(bodyEl);
            };
        });
        // 添加新源
        bodyEl.querySelector('#rss-add-btn').onclick = async function() {
            let url = bodyEl.querySelector('#rss-add-url').value.trim();
            if (!url) return alert('baka！源URL不能为空的咪');
            let name = await fetchRssName(url);
            let arr = GM_getValue('rss_sources', []);
            arr.push({url, name, isDefault:false});
            GM_setValue('rss_sources', arr);
            updateSettingsMenu(bodyEl);
        };

        // 清除已读
        let clearReadBtn = bodyEl.querySelector('#rss-clear-read');
        if (clearReadBtn) {
            clearReadBtn.onclick = function() {
                GM_setValue('read_items', {});
                alert('已清除所有已读记录，下次刷新页面生效');
            };
        }
        // 刷新
        let reloadBtn = bodyEl.querySelector('#rss-reload-now');
        if (reloadBtn) {
            reloadBtn.onclick = function() {
                GM_setValue('rss_last_items', []);
                window.location.reload();
            };
        }
        // 重置
        let resetBtn = bodyEl.querySelector('#rss-reset-all');
        if (resetBtn) {
            resetBtn.onclick = function() {
                if (confirm('确定要重置所有脚本设置吗喵？这会删除所有自定义RSS源和已读记录！')) {
                    GM_setValue('rss_sources', null);
                    GM_setValue('rss_disabled', []);
                    GM_setValue('read_items', {});
                    GM_setValue('rss_last_items', []);
                    window.location.reload();
                }
            };
        }
    }

    // 主函数
    async function initRSSInjection() {
        if (!window.location.href.includes('https://www.shireyishunjian.com/main/index.php')) return;
        await initUserSources();
        injectHamburger(updateSettingsMenu);

        const container = document.createElement('div');
        container.className = 'rss-injection-container';
        container.innerHTML = `
            <div class="rss-grid" id="rss-content-grid"></div>
            <div class="loading" id="rss-loading">
                <div class="loading-spinner"></div>
                <div>正在加载最新内容喵...</div>
            </div>
            <div class="rss-stats">
                <div id="rss-stats-info">正在获取数据喵...</div>
                <div>到底了吗喵</div>
            </div>
        `;
        const targetElement = document.querySelector('.foot_height');
        if (targetElement) {
            targetElement.appendChild(container);
        } else {
            document.body.insertBefore(container, document.body.firstChild);
        }
        const contentGrid = document.getElementById('rss-content-grid');
        const loadingIndicator = document.getElementById('rss-loading');
        const statsInfo = document.getElementById('rss-stats-info');
        let currentPage = 1;
        let itemsPerPage = 12;
        let allItems = [];
        let displayedItems = [];
        let readItems = GM_getValue('read_items', {});

        // 加载数据
        function loadRSSData() {
            let rssSources = GM_getValue('rss_sources', []);
            let disabledRss = GM_getValue('rss_disabled', []);
            let activeSources = rssSources.filter((s,i)=>disabledRss.indexOf(i)===-1);

            loadingIndicator.style.display = 'block';
            statsInfo.textContent = "正在获取内容...";

            const promises = activeSources.map(source => {
                return new Promise((resolve) => {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: source.url,
                        onload: function(response) {
                            try {
                                const parser = new DOMParser();
                                const xmlDoc = parser.parseFromString(response.responseText, "text/xml");
                                const channel = xmlDoc.querySelector('channel');
                                const channelTitle = channel?.querySelector('title')?.textContent || source.name;
                                const channelLink = channel?.querySelector('link')?.textContent || source.url;
                                const items = channel?.querySelectorAll("item") || [];
                                const parsedItems = Array.from(items).map(item => ({
                                    title: item.querySelector("title")?.textContent || "无标题",
                                    link: item.querySelector("link")?.textContent || "#",
                                    description: item.querySelector("description")?.textContent || "",
                                    pubDate: item.querySelector("pubDate")?.textContent || new Date().toISOString(),
                                    author: item.querySelector("author")?.textContent || "？作者",
                                    category: channelTitle,
                                    channelLink: channelLink,
                                    sourceName: source.name
                                }));
                                resolve(parsedItems);
                            } catch (e) {
                                resolve([]);
                            }
                        },
                        onerror: function() {resolve([]);}
                    });
                });
            });

            Promise.all(promises).then(results => {
                allItems = results.flat();
                // 随机排序
                allItems.sort(() => Math.random() - 0.5);
                GM_setValue('rss_last_items', allItems);

                loadingIndicator.style.display = 'none';
                renderItems();

                statsInfo.textContent = `已加载 ${allItems.length} 条内容，来自 ${activeSources.length} 个源`;
            });
        }

        function renderItems() {
            contentGrid.innerHTML = '';
            displayedItems = allItems.slice(0, currentPage * itemsPerPage);
            if (displayedItems.length === 0) {
                contentGrid.innerHTML = `
                    <div class="empty-state">
                        <div>📭</div>
                        <h3>暂无内容</h3>
                        <p>没有获取到任何内容，请检查设置</p>
                        <button class="filter-btn" style="margin-top: 15px;" id="retry-loading">重新加载</button>
                    </div>
                `;
                document.getElementById('retry-loading').onclick = loadRSSData;
                return;
            }
            displayedItems.forEach(item => {
                const isRead = readItems[item.link] === true;
                const date = moment(item.pubDate).format('YYYY-MM-DD HH:mm');
                const excerpt = item.description.replace(/<[^>]+>/g, '').substring(0, 100) + '...';
                const color = getColorByName(item.category);

                const card = document.createElement('div');
                card.className = `rss-card ${isRead ? 'read' : ''}`;
                card.innerHTML = `
                    <div class="card-category" style="background: ${color}12; color: ${color}; border-bottom: 1px solid ${color}20;">
                        <span>${item.category}</span>
                    </div>
                    <div class="card-content">
                        <div class="card-title">${item.title}</div>
                        <div class="card-excerpt">${excerpt}</div>
                        <div class="card-meta">
                            <div class="card-author">
                                <span>${item.author}</span>
                            </div>
                            <div class="card-date">${date}</div>
                        </div>
                    </div>
                `;
                card.querySelector('.card-category').onclick = function(e) {
                    e.stopPropagation();
                    if (item.channelLink) window.open(item.channelLink, '_blank');
                };
                card.onclick = function() {
                    readItems[item.link] = true;
                    GM_setValue('read_items', readItems);
                    card.classList.add('read');
                    window.open(item.link, '_blank');
                };
                contentGrid.appendChild(card);
            });
            if (allItems.length > displayedItems.length) {
                loadingIndicator.style.display = 'block';
                statsInfo.textContent = `已显示 ${displayedItems.length}/${allItems.length} 条内容，继续滚动加载更多`;
            } else {
                loadingIndicator.style.display = 'none';
                statsInfo.textContent = `已显示全部 ${allItems.length} 条内容`;
            }
        }

        // 无限滚动
        let isScrolling = false;
        window.addEventListener('scroll', () => {
            if (isScrolling) return;
            isScrolling = true;
            setTimeout(() => {
                const scrollPosition = window.scrollY;
                const windowHeight = window.innerHeight;
                const bodyHeight = document.body.offsetHeight;
                const threshold = 200;
                if (bodyHeight - scrollPosition - windowHeight < threshold) {
                    currentPage++;
                    renderItems();
                }
                isScrolling = false;
            }, 200);
        });

        loadRSSData();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRSSInjection);
    } else {
        initRSSInjection();
    }
})();