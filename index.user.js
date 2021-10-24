// ==UserScript==
// @name         agefans Enhance
// @namespace    https://github.com/IronKinoko/agefans-enhance
// @version      1.12.1
// @description  增强agefans播放功能，实现自动换集、无缝换集、画中画、历史记录、断点续播、显示视频源、获取当前页面全部视频等功能
// @author       IronKinoko
// @include      https://www.agefans.net/*
// @include      https://www.agefans.cc/*
// @include      https://www.agefans.vip/*
// @include      http://www.yhdm.so/v/*
// @include      http://www.yinghuacd.com/v/*
// @include      https://www.yhdmp.cc/vp/*
// @include      http://www.imomoe.live/player/*
// @resource     plyrCSS https://cdn.jsdelivr.net/npm/plyr@3.6.4/dist/plyr.min.css
// @require      https://cdn.jsdelivr.net/npm/jquery@1.12.4/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/plyr@3.6.4/dist/plyr.min.js
// @require      https://cdn.jsdelivr.net/npm/hls.js@1.0.9/dist/hls.min.js
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

(function() {
  'use strict';
  try {
    let plyrCSS = GM_getResourceText('plyrCSS')  
    GM_addStyle(plyrCSS)
  } catch(e) { /* empty */ }
})();


(function ($, Plyr, Hls) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var $__default = /*#__PURE__*/_interopDefaultLegacy($);
  var Plyr__default = /*#__PURE__*/_interopDefaultLegacy(Plyr);
  var Hls__default = /*#__PURE__*/_interopDefaultLegacy(Hls);

  var e = [],
      t = [];

  function n(n, r) {
    if (n && "undefined" != typeof document) {
      var a,
          s = !0 === r.prepend ? "prepend" : "append",
          d = !0 === r.singleTag,
          i = "string" == typeof r.container ? document.querySelector(r.container) : document.getElementsByTagName("head")[0];

      if (d) {
        var u = e.indexOf(i);
        -1 === u && (u = e.push(i) - 1, t[u] = {}), a = t[u] && t[u][s] ? t[u][s] : t[u][s] = c();
      } else a = c();

      65279 === n.charCodeAt(0) && (n = n.substring(1)), a.styleSheet ? a.styleSheet.cssText += n : a.appendChild(document.createTextNode(n));
    }

    function c() {
      var e = document.createElement("style");
      if (e.setAttribute("type", "text/css"), r.attributes) for (var t = Object.keys(r.attributes), n = 0; n < t.length; n++) e.setAttribute(t[n], r.attributes[t[n]]);
      var a = "prepend" === s ? "afterbegin" : "beforeend";
      return i.insertAdjacentElement(a, e), e;
    }
  }

  var css$6 = ".agefans-wrapper .nav_button {\n  cursor: pointer;\n}\n.agefans-wrapper .res_links {\n  word-break: break-all;\n  word-wrap: break-word;\n}";
  n(css$6,{});

  function renderHistroyStyle() {
    // add a tag visited style
    let styleDom = document.createElement('style');
    styleDom.innerHTML = `.movurl li a:visited { color: red; }`;
    document.head.appendChild(styleDom);
  }

  function detailModule() {
    renderHistroyStyle();
  }

  var css$5 = ".agefans-wrapper #history {\n  background: #202020;\n  border: 4px solid #303030;\n}\n.agefans-wrapper #history .history-list {\n  padding: 16px;\n  display: flex;\n  flex-wrap: wrap;\n}\n.agefans-wrapper #history .history-item {\n  width: 115px;\n  display: inline-block;\n  margin: 4px;\n}\n.agefans-wrapper #history .history-item img {\n  width: 100%;\n  border-radius: 2px;\n}\n.agefans-wrapper #history .history-item .desc .title {\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  font-size: 14px;\n  margin: 4px 0;\n}\n.agefans-wrapper #history .history-item .desc .position {\n  font-size: 14px;\n}";
  n(css$5,{});

  class History {
    constructor() {
      this.cacheKey = 'v-his';
    }

    get his() {
      return JSON.parse(localStorage.getItem(this.cacheKey) || '[]');
    }

    set his(value) {
      if (Array.isArray(value)) {
        localStorage.setItem(this.cacheKey, JSON.stringify(value.slice(0, 100)));
      }
    }

    getAll() {
      return this.his;
    }

    get(id) {
      return this.his.find(o => o.id === id);
    }

    setTime(id, time = 0) {
      const his = this.his;
      his.find(o => o.id === id).time = time;
      this.his = his;
    }

    log(item) {
      const his = this.his;
      his.unshift(item);
      this.his = his;
    }

    refresh(id, data) {
      const his = this.his;
      const index = his.findIndex(o => o.id === id);
      const item = his.splice(index, 1)[0];
      his.unshift(data || item);
      this.his = his;
    }

    has(id) {
      return Boolean(this.his.find(o => o.id === id));
    }

    logHistory() {
      var _location$pathname$ma;

      const id = (_location$pathname$ma = location.pathname.match(/\/play\/(\d*)/)) === null || _location$pathname$ma === void 0 ? void 0 : _location$pathname$ma[1];
      if (!id) return;
      const hisItem = {};
      hisItem.id = id;
      hisItem.title = $__default['default']('#detailname a').text();
      hisItem.href = location.href;
      hisItem.section = $__default['default']('li a[style*="color: rgb(238, 0, 0);"]').text();
      hisItem.time = 0;
      hisItem.logo = $__default['default']('#play_poster_img').attr('src');

      if (this.has(id)) {
        const oldItem = this.get(id);

        if (oldItem.href !== hisItem.href) {
          this.refresh(id, hisItem);
        } else {
          this.refresh(id);
        }
      } else {
        this.log(hisItem);
      }
    }

  }

  const his = new History();
  function parseTime(time = 0) {
    return `${Math.floor(time / 60).toString().padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`;
  }
  function renderHistoryList() {
    $__default['default']('#history').html('').append(() => {
      /** @type {any[]} */
      const histories = his.getAll();
      let html = '';
      histories.forEach(o => {
        html += `<a class="history-item" href="${o.href}">
        <img
          referrerpolicy="no-referrer"
          src="${o.logo}"
          alt="${o.title}"
          title="${o.title}"
        />
        <div class="desc">
          <div class="title">${o.title}</div>
          <div class="position">${o.section} ${parseTime(o.time)}</div>
        </div>
      </a>
      `;
      });
      return `<div class="history-list">${html || '<center>暂无数据</center>'}</div>`;
    });
  }

  function renderHistoryPage() {
    const currentDom = $__default['default']('.nav_button_current');
    $__default['default']('<div id="history"></div>').insertAfter('#container').hide();
    $__default['default'](`<a class="nav_button">历史</a>`).appendTo('#nav').on('click', e => {
      if ($__default['default']('#history').is(':visible')) {
        $__default['default']('#container').show();
        $__default['default']('#history').hide();
        changeActive(currentDom);
      } else {
        renderHistoryList();
        $__default['default']('#container').hide();
        $__default['default']('#history').show();
        changeActive($__default['default'](e.currentTarget));
      }
    });
    $__default['default']('.nav_button_current').on('click', e => {
      $__default['default']('#container').show();
      $__default['default']('#history').hide();
      changeActive(e.currentTarget);
    }).removeAttr('href');
  }

  function changeActive(dom) {
    $__default['default']('.nav_button_current').removeClass('nav_button_current');
    $__default['default'](dom).addClass('nav_button_current');
  }

  function historyModule() {
    renderHistoryPage();
    renderHistoryList();
  }

  var css$4 = "#k-player-wrapper {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  background: #000;\n  overflow: hidden;\n  --k-player-background-highlight: rgba(95, 95, 95, 0.65);\n  --k-player-background: rgba(0, 0, 0, 0.65);\n  --k-player-color: white;\n  --plyr-tooltip-background: var(--k-player-background);\n  --plyr-tooltip-color: var(--k-player-color);\n}\n#k-player-wrapper.k-player-widescreen {\n  position: fixed;\n  left: 0;\n  top: 0;\n  z-index: 100;\n}\n#k-player-wrapper .k-player-contianer {\n  width: 100%;\n  height: 100%;\n}\n#k-player-wrapper #k-player-loading,\n#k-player-wrapper #k-player-error {\n  position: absolute;\n  left: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 10;\n  font-size: 88px;\n  color: white;\n  pointer-events: none;\n  background: black;\n}\n#k-player-wrapper .k-player-center {\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n}\n#k-player-wrapper #k-player-header {\n  transform: translateY(0);\n  transition: transform 0.3s;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  padding: 8px;\n  text-align: right;\n}\n#k-player-wrapper #k-player-header .k-player-question-icon {\n  font-size: 24px;\n  width: 1em;\n  height: 1em;\n  color: white;\n  cursor: pointer;\n}\n#k-player-wrapper .plyr--hide-controls #k-player-header {\n  transform: translateY(-100%);\n}\n#k-player-wrapper .error-info {\n  text-align: center;\n  padding: 24px;\n  font-size: 18px;\n}\n#k-player-wrapper .plyr {\n  width: 100%;\n  height: 100%;\n}\n#k-player-wrapper video {\n  display: block;\n}\n#k-player-wrapper .plyr__next svg {\n  transform: scale(1.7);\n}\n#k-player-wrapper .plyr__widescreen svg {\n  transform: scale(1.3);\n}\n#k-player-wrapper .plyr--hide-cursor {\n  cursor: none;\n}\n#k-player-wrapper .plyr__control span:not(.plyr__tooltip) {\n  color: inherit;\n}\n#k-player-wrapper .plyr--hide-controls .k-player-progress {\n  opacity: 1;\n  transition: opacity 0.3s ease-in 0.2s;\n}\n#k-player-wrapper .k-player-fullscreen .k-player-progress {\n  display: none;\n}\n#k-player-wrapper .k-player-progress {\n  opacity: 0;\n  transition: opacity 0.2s ease-out;\n  height: 2px;\n  width: 100%;\n  position: absolute;\n  bottom: 0;\n}\n#k-player-wrapper .k-player-progress .k-player-progress-current {\n  position: absolute;\n  left: 0;\n  top: 0;\n  height: 100%;\n  z-index: 2;\n  background-color: #23ade5;\n}\n#k-player-wrapper .k-player-progress .k-player-progress-buffer {\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 1;\n  height: 100%;\n  background-color: var(--plyr-video-progress-buffered-background, rgba(255, 255, 255, 0.25));\n}\n#k-player-wrapper .plyr__controls .plyr__controls__item:first-child {\n  margin-right: 0;\n}\n#k-player-wrapper .plyr__controls .plyr__controls__item.plyr__progress__container {\n  position: absolute;\n  top: 15px;\n  left: 10px;\n  right: 10px;\n  --plyr-range-track-height: 2px;\n}\n#k-player-wrapper .plyr__controls .plyr__controls__item.plyr__progress__container .plyr__progress input[type=range]::-webkit-slider-thumb {\n  transform: scale(0);\n  transition: transform 0.2s ease;\n}\n#k-player-wrapper .plyr__controls .plyr__controls__item.plyr__progress__container:hover {\n  --plyr-range-track-height: 4px;\n}\n#k-player-wrapper .plyr__controls .plyr__controls__item.plyr__progress__container:hover .plyr__progress input[type=range] {\n  cursor: pointer;\n}\n#k-player-wrapper .plyr__controls .plyr__controls__item.plyr__progress__container:hover .plyr__progress input[type=range]::-webkit-slider-thumb {\n  transform: scale(1);\n}\n#k-player-wrapper .plyr__controls #k-speed {\n  width: 60px;\n  margin-left: auto;\n}\n\n.lds-spinner {\n  color: official;\n  display: inline-block;\n  position: relative;\n  width: 80px;\n  height: 80px;\n}\n\n.lds-spinner div {\n  transform-origin: 40px 40px;\n  animation: lds-spinner 1.2s linear infinite;\n}\n\n.lds-spinner div:after {\n  content: \" \";\n  display: block;\n  position: absolute;\n  top: 3px;\n  left: 37px;\n  width: 6px;\n  height: 18px;\n  border-radius: 20%;\n  background: #fff;\n}\n\n.lds-spinner div:nth-child(1) {\n  transform: rotate(0deg);\n  animation-delay: -1.1s;\n}\n\n.lds-spinner div:nth-child(2) {\n  transform: rotate(30deg);\n  animation-delay: -1s;\n}\n\n.lds-spinner div:nth-child(3) {\n  transform: rotate(60deg);\n  animation-delay: -0.9s;\n}\n\n.lds-spinner div:nth-child(4) {\n  transform: rotate(90deg);\n  animation-delay: -0.8s;\n}\n\n.lds-spinner div:nth-child(5) {\n  transform: rotate(120deg);\n  animation-delay: -0.7s;\n}\n\n.lds-spinner div:nth-child(6) {\n  transform: rotate(150deg);\n  animation-delay: -0.6s;\n}\n\n.lds-spinner div:nth-child(7) {\n  transform: rotate(180deg);\n  animation-delay: -0.5s;\n}\n\n.lds-spinner div:nth-child(8) {\n  transform: rotate(210deg);\n  animation-delay: -0.4s;\n}\n\n.lds-spinner div:nth-child(9) {\n  transform: rotate(240deg);\n  animation-delay: -0.3s;\n}\n\n.lds-spinner div:nth-child(10) {\n  transform: rotate(270deg);\n  animation-delay: -0.2s;\n}\n\n.lds-spinner div:nth-child(11) {\n  transform: rotate(300deg);\n  animation-delay: -0.1s;\n}\n\n.lds-spinner div:nth-child(12) {\n  transform: rotate(330deg);\n  animation-delay: 0s;\n}\n\n@keyframes lds-spinner {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}\n.script-info {\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n  width: 100%;\n}\n.script-info * {\n  box-sizing: border-box;\n}\n.script-info tbody tr td:first-child {\n  white-space: nowrap;\n  width: 77px;\n}\n.script-info td {\n  padding: 8px;\n  border-bottom: 1px solid #f1f1f1;\n  word-wrap: break-word;\n  word-break: break-all;\n}\n.script-info .info-title {\n  font-weight: 600;\n  padding-top: 24px;\n}\n.script-info a {\n  color: #1890ff;\n  padding: 4px 8px;\n  border-radius: 4px;\n  text-decoration: none;\n}\n.script-info a:hover {\n  text-decoration: underline;\n  background-color: #f1f1f1;\n}\n.script-info .shortcuts-wrap {\n  display: flex;\n  width: 100%;\n  margin: -8px;\n}\n.script-info .shortcuts-table {\n  flex: 1;\n}\n.script-info .key {\n  display: inline-block;\n  position: relative;\n  background: #333;\n  text-align: center;\n  color: #eee;\n  border-radius: 4px;\n  padding: 2px 0;\n  width: 56px;\n  box-sizing: border-box;\n  border: 1px solid #444;\n  box-shadow: 0 2px 0 1px #222;\n  border-bottom-color: #555;\n  user-select: none;\n}\n.script-info .carousel {\n  position: relative;\n  display: flex;\n  flex-wrap: nowrap;\n  overflow: hidden;\n}\n.script-info .carousel span {\n  display: block;\n  width: 100%;\n  height: 100%;\n  flex-basis: 100%;\n  flex-shrink: 0;\n  animation: carousel-3 6s infinite alternate;\n}\n\n@keyframes carousel-3 {\n  0% {\n    transform: translateX(0);\n  }\n  20% {\n    transform: translateX(0);\n  }\n  40% {\n    transform: translateX(-100%);\n  }\n  60% {\n    transform: translateX(-100%);\n  }\n  80% {\n    transform: translateX(-200%);\n  }\n  100% {\n    transform: translateX(-200%);\n  }\n}\n.k-popover {\n  position: relative;\n  display: inline-block;\n}\n.k-popover-overlay {\n  position: absolute;\n  display: none;\n  bottom: 100%;\n  left: 50%;\n  transform: translateX(-50%);\n  z-index: 100;\n  padding-bottom: 30px;\n}\n.k-popover-content {\n  background: var(--k-player-background);\n  border-radius: 4px;\n  overflow: hidden;\n}\n.k-popover:hover .k-popover-overlay {\n  display: block;\n}\n\n.k-menu {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  border-radius: 4px;\n  overflow: hidden;\n}\n.k-menu-item {\n  padding: 0 16px;\n  line-height: 36px;\n  height: 36px;\n  cursor: pointer;\n  width: 100%;\n  color: white;\n  transition: all 0.3s;\n}\n.k-menu-item:hover {\n  background: var(--k-player-background-highlight);\n}\n\n.k-menu-item.k-menu-active {\n  color: #1890ff;\n}\n\n.k-settings-list {\n  list-style: none;\n  margin: 0;\n  padding: 8px 8px;\n  text-align: left;\n}\n\n.k-settings-item {\n  width: 100%;\n  white-space: nowrap;\n  color: white;\n  display: flex;\n  align-items: center;\n}\n.k-settings-item input {\n  margin-right: 4px;\n}";
  n(css$4,{});

  const icons = `
<svg
xmlns="http://www.w3.org/2000/svg"
style="position: absolute; width: 0px; height: 0px; overflow: hidden"
aria-hidden="true"
>
  <symbol id="next" viewBox="0 0 22 22">
    <path
      d="M16 5a1 1 0 00-1 1v4.615a1.431 1.431 0 00-.615-.829L7.21 5.23A1.439 1.439 0 005 6.445v9.11a1.44 1.44 0 002.21 1.215l7.175-4.555a1.436 1.436 0 00.616-.828V16a1 1 0 002 0V6C17 5.448 16.552 5 16 5z"
    ></path>
  </symbol>

  <symbol
    id="widescreen"
    viewBox="0 0 88 88"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <clipPath id="__lottie_element_127">
        <rect width="88" height="88" x="0" y="0"></rect>
      </clipPath>
    </defs>
    <g clip-path="url(#__lottie_element_127)">
      <g
        transform="matrix(1,0,0,1,44,44)"
        opacity="1"
        style="display: block"
      >
        <g opacity="1" transform="matrix(1,0,0,1,0,0)">
          <path
            fill="rgb(255,255,255)"
            fill-opacity="1"
            d=" M-14,-20 C-14,-20 -26,-20 -26,-20 C-27.049999237060547,-20 -27.920000076293945,-19.18000030517578 -27.989999771118164,-18.149999618530273 C-27.989999771118164,-18.149999618530273 -28,-18 -28,-18 C-28,-18 -28,-6 -28,-6 C-28,-4.949999809265137 -27.18000030517578,-4.079999923706055 -26.149999618530273,-4.010000228881836 C-26.149999618530273,-4.010000228881836 -26,-4 -26,-4 C-26,-4 -22,-4 -22,-4 C-20.950000762939453,-4 -20.079999923706055,-4.820000171661377 -20.010000228881836,-5.849999904632568 C-20.010000228881836,-5.849999904632568 -20,-6 -20,-6 C-20,-6 -20,-12 -20,-12 C-20,-12 -14,-12 -14,-12 C-12.949999809265137,-12 -12.079999923706055,-12.819999694824219 -12.010000228881836,-13.850000381469727 C-12.010000228881836,-13.850000381469727 -12,-14 -12,-14 C-12,-14 -12,-18 -12,-18 C-12,-19.049999237060547 -12.819999694824219,-19.920000076293945 -13.850000381469727,-19.989999771118164 C-13.850000381469727,-19.989999771118164 -14,-20 -14,-20z M26,-20 C26,-20 14,-20 14,-20 C12.949999809265137,-20 12.079999923706055,-19.18000030517578 12.010000228881836,-18.149999618530273 C12.010000228881836,-18.149999618530273 12,-18 12,-18 C12,-18 12,-14 12,-14 C12,-12.949999809265137 12.819999694824219,-12.079999923706055 13.850000381469727,-12.010000228881836 C13.850000381469727,-12.010000228881836 14,-12 14,-12 C14,-12 20,-12 20,-12 C20,-12 20,-6 20,-6 C20,-4.949999809265137 20.81999969482422,-4.079999923706055 21.850000381469727,-4.010000228881836 C21.850000381469727,-4.010000228881836 22,-4 22,-4 C22,-4 26,-4 26,-4 C27.049999237060547,-4 27.920000076293945,-4.820000171661377 27.989999771118164,-5.849999904632568 C27.989999771118164,-5.849999904632568 28,-6 28,-6 C28,-6 28,-18 28,-18 C28,-19.049999237060547 27.18000030517578,-19.920000076293945 26.149999618530273,-19.989999771118164 C26.149999618530273,-19.989999771118164 26,-20 26,-20z M-22,4 C-22,4 -26,4 -26,4 C-27.049999237060547,4 -27.920000076293945,4.820000171661377 -27.989999771118164,5.849999904632568 C-27.989999771118164,5.849999904632568 -28,6 -28,6 C-28,6 -28,18 -28,18 C-28,19.049999237060547 -27.18000030517578,19.920000076293945 -26.149999618530273,19.989999771118164 C-26.149999618530273,19.989999771118164 -26,20 -26,20 C-26,20 -14,20 -14,20 C-12.949999809265137,20 -12.079999923706055,19.18000030517578 -12.010000228881836,18.149999618530273 C-12.010000228881836,18.149999618530273 -12,18 -12,18 C-12,18 -12,14 -12,14 C-12,12.949999809265137 -12.819999694824219,12.079999923706055 -13.850000381469727,12.010000228881836 C-13.850000381469727,12.010000228881836 -14,12 -14,12 C-14,12 -20,12 -20,12 C-20,12 -20,6 -20,6 C-20,4.949999809265137 -20.81999969482422,4.079999923706055 -21.850000381469727,4.010000228881836 C-21.850000381469727,4.010000228881836 -22,4 -22,4z M26,4 C26,4 22,4 22,4 C20.950000762939453,4 20.079999923706055,4.820000171661377 20.010000228881836,5.849999904632568 C20.010000228881836,5.849999904632568 20,6 20,6 C20,6 20,12 20,12 C20,12 14,12 14,12 C12.949999809265137,12 12.079999923706055,12.819999694824219 12.010000228881836,13.850000381469727 C12.010000228881836,13.850000381469727 12,14 12,14 C12,14 12,18 12,18 C12,19.049999237060547 12.819999694824219,19.920000076293945 13.850000381469727,19.989999771118164 C13.850000381469727,19.989999771118164 14,20 14,20 C14,20 26,20 26,20 C27.049999237060547,20 27.920000076293945,19.18000030517578 27.989999771118164,18.149999618530273 C27.989999771118164,18.149999618530273 28,18 28,18 C28,18 28,6 28,6 C28,4.949999809265137 27.18000030517578,4.079999923706055 26.149999618530273,4.010000228881836 C26.149999618530273,4.010000228881836 26,4 26,4z M28,-28 C32.41999816894531,-28 36,-24.420000076293945 36,-20 C36,-20 36,20 36,20 C36,24.420000076293945 32.41999816894531,28 28,28 C28,28 -28,28 -28,28 C-32.41999816894531,28 -36,24.420000076293945 -36,20 C-36,20 -36,-20 -36,-20 C-36,-24.420000076293945 -32.41999816894531,-28 -28,-28 C-28,-28 28,-28 28,-28z"
          ></path>
        </g>
      </g>
    </g>
  </symbol>

  <symbol
    id="widescreen-quit"
    viewBox="0 0 88 88"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <clipPath id="__lottie_element_132">
        <rect width="88" height="88" x="0" y="0"></rect>
      </clipPath>
    </defs>
    <g clip-path="url(#__lottie_element_132)">
      <g
        transform="matrix(1,0,0,1,44,44)"
        opacity="1"
        style="display: block"
      >
        <g opacity="1" transform="matrix(1,0,0,1,0,0)">
          <path
            fill="rgb(255,255,255)"
            fill-opacity="1"
            d=" M-14,-20 C-14,-20 -18,-20 -18,-20 C-19.049999237060547,-20 -19.920000076293945,-19.18000030517578 -19.989999771118164,-18.149999618530273 C-19.989999771118164,-18.149999618530273 -20,-18 -20,-18 C-20,-18 -20,-12 -20,-12 C-20,-12 -26,-12 -26,-12 C-27.049999237060547,-12 -27.920000076293945,-11.180000305175781 -27.989999771118164,-10.149999618530273 C-27.989999771118164,-10.149999618530273 -28,-10 -28,-10 C-28,-10 -28,-6 -28,-6 C-28,-4.949999809265137 -27.18000030517578,-4.079999923706055 -26.149999618530273,-4.010000228881836 C-26.149999618530273,-4.010000228881836 -26,-4 -26,-4 C-26,-4 -14,-4 -14,-4 C-12.949999809265137,-4 -12.079999923706055,-4.820000171661377 -12.010000228881836,-5.849999904632568 C-12.010000228881836,-5.849999904632568 -12,-6 -12,-6 C-12,-6 -12,-18 -12,-18 C-12,-19.049999237060547 -12.819999694824219,-19.920000076293945 -13.850000381469727,-19.989999771118164 C-13.850000381469727,-19.989999771118164 -14,-20 -14,-20z M18,-20 C18,-20 14,-20 14,-20 C12.949999809265137,-20 12.079999923706055,-19.18000030517578 12.010000228881836,-18.149999618530273 C12.010000228881836,-18.149999618530273 12,-18 12,-18 C12,-18 12,-6 12,-6 C12,-4.949999809265137 12.819999694824219,-4.079999923706055 13.850000381469727,-4.010000228881836 C13.850000381469727,-4.010000228881836 14,-4 14,-4 C14,-4 26,-4 26,-4 C27.049999237060547,-4 27.920000076293945,-4.820000171661377 27.989999771118164,-5.849999904632568 C27.989999771118164,-5.849999904632568 28,-6 28,-6 C28,-6 28,-10 28,-10 C28,-11.050000190734863 27.18000030517578,-11.920000076293945 26.149999618530273,-11.989999771118164 C26.149999618530273,-11.989999771118164 26,-12 26,-12 C26,-12 20,-12 20,-12 C20,-12 20,-18 20,-18 C20,-19.049999237060547 19.18000030517578,-19.920000076293945 18.149999618530273,-19.989999771118164 C18.149999618530273,-19.989999771118164 18,-20 18,-20z M-14,4 C-14,4 -26,4 -26,4 C-27.049999237060547,4 -27.920000076293945,4.820000171661377 -27.989999771118164,5.849999904632568 C-27.989999771118164,5.849999904632568 -28,6 -28,6 C-28,6 -28,10 -28,10 C-28,11.050000190734863 -27.18000030517578,11.920000076293945 -26.149999618530273,11.989999771118164 C-26.149999618530273,11.989999771118164 -26,12 -26,12 C-26,12 -20,12 -20,12 C-20,12 -20,18 -20,18 C-20,19.049999237060547 -19.18000030517578,19.920000076293945 -18.149999618530273,19.989999771118164 C-18.149999618530273,19.989999771118164 -18,20 -18,20 C-18,20 -14,20 -14,20 C-12.949999809265137,20 -12.079999923706055,19.18000030517578 -12.010000228881836,18.149999618530273 C-12.010000228881836,18.149999618530273 -12,18 -12,18 C-12,18 -12,6 -12,6 C-12,4.949999809265137 -12.819999694824219,4.079999923706055 -13.850000381469727,4.010000228881836 C-13.850000381469727,4.010000228881836 -14,4 -14,4z M26,4 C26,4 14,4 14,4 C12.949999809265137,4 12.079999923706055,4.820000171661377 12.010000228881836,5.849999904632568 C12.010000228881836,5.849999904632568 12,6 12,6 C12,6 12,18 12,18 C12,19.049999237060547 12.819999694824219,19.920000076293945 13.850000381469727,19.989999771118164 C13.850000381469727,19.989999771118164 14,20 14,20 C14,20 18,20 18,20 C19.049999237060547,20 19.920000076293945,19.18000030517578 19.989999771118164,18.149999618530273 C19.989999771118164,18.149999618530273 20,18 20,18 C20,18 20,12 20,12 C20,12 26,12 26,12 C27.049999237060547,12 27.920000076293945,11.180000305175781 27.989999771118164,10.149999618530273 C27.989999771118164,10.149999618530273 28,10 28,10 C28,10 28,6 28,6 C28,4.949999809265137 27.18000030517578,4.079999923706055 26.149999618530273,4.010000228881836 C26.149999618530273,4.010000228881836 26,4 26,4z M28,-28 C32.41999816894531,-28 36,-24.420000076293945 36,-20 C36,-20 36,20 36,20 C36,24.420000076293945 32.41999816894531,28 28,28 C28,28 -28,28 -28,28 C-32.41999816894531,28 -36,24.420000076293945 -36,20 C-36,20 -36,-20 -36,-20 C-36,-24.420000076293945 -32.41999816894531,-28 -28,-28 C-28,-28 28,-28 28,-28z"
          ></path>
        </g>
      </g>
    </g>
  </symbol>

  <symbol id="question" width="1em" height="1em" viewBox="0 0 22 22">
    <path fill="currentColor" d="M6 16l-3 3V5a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H6zm4-4v2h2v-2h-2zm2-.998c0-.34.149-.523.636-.925.022-.018.296-.24.379-.31a5.81 5.81 0 00.173-.152C13.705 9.145 14 8.656 14 8a3 3 0 00-5.698-1.314c-.082.17-.153.41-.213.72A.5.5 0 008.581 8h1.023a.5.5 0 00.476-.348.851.851 0 01.114-.244A.999.999 0 0112 8c0 1.237-2 1.16-2 3h2z"></path>
  </symbol>
</svg>

<template id="plyr__next">
  <button
    class="plyr__controls__item plyr__control plyr__next plyr__custom"
    type="button"
    data-plyr="next"
    aria-label="Next"
  >
    <svg focusable="false">
      <use xlink:href="#next"></use>
    </svg>
    <span class="plyr__tooltip">下一集(N)</span>
  </button>
</template>

<template id="plyr__widescreen">
  <button
    class="plyr__controls__item plyr__control plyr__widescreen plyr__custom"
    type="button"
    data-plyr="next"
    aria-label="widescreen"
  >
    <svg class="icon--not-pressed" focusable="false">
      <use xlink:href="#widescreen"></use>
    </svg>
    <svg class="icon--pressed" focusable="false">
      <use xlink:href="#widescreen-quit"></use>
    </svg>
    <span class="label--not-pressed plyr__tooltip">网页全屏(W)</span>
    <span class="label--pressed plyr__tooltip">退出网页全屏(W)</span>
  </button>
</template>
`;
  $__default['default']('body').append(icons);
  const loadingHTML = `
<div id="k-player-loading" style="display: none">
  <div class="k-player-center">
    <div class="lds-spinner">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>  
  </div>
</div>
`;
  const errorHTML = `
<div id="k-player-error" style="display: none">
  <div class="k-player-center">
    <div>视频加载失败</div><div class="error-info"></div>
  </div>
</div>`;
  const speedList = [0.5, 0.75, 1, 1.25, 1.5, 2, 4];
  const speedHTML = `
<div id="k-speed" class="plyr__controls__item k-popover">
  <span id="k-speed-text">倍速</span>
  <div class="k-popover-overlay">
    <div class="k-popover-content">
      <ul class="k-menu">
        ${[...speedList].reverse().map(speed => `<li class="k-menu-item k-speed-item" data-speed="${speed}">${speed}x</li>`).join('')}
      </ul>
    </div>
  </div>
</div>
`;
  const settingsHTML = `
<div id="k-settings" class="plyr__controls__item k-popover">
  <button type="button" class="plyr__control">
    <svg><use href="#plyr-settings" /></svg>
  </button>
  <div class="k-popover-overlay">
    <div class="k-popover-content">
      <ul class="k-settings-list">
        <li>
          <label class="k-settings-item">
            <input type="checkbox" name="autoNext" />
            自动下一集
          </label>
        </li>
        <li>
          <label class="k-settings-item">
            <input type="checkbox" name="continuePlay" />
            记忆播放位置
          </label>
        </li>
        <li>
          <label class="k-settings-item">
            <input type="checkbox" name="showProgress" />
            显示底部进度条
          </label>
        </li>
      </ul>
    </div>
  </div>
</div>
`;
  const scriptInfo = (video, githubIssueURL) => `
<table class="script-info">
  <tbody>
  <tr><td>脚本版本</td><td>${"1.12.1"}</td></tr>
  <tr>
    <td>脚本源码</td>
    <td>
      <a target="_blank" rel="noreferrer" href="https://github.com/IronKinoko/agefans-enhance">GitHub</a>
      <a target="_blank" rel="noreferrer" href="https://github.com/IronKinoko/agefans-enhance/releases">更新记录</a>
      </td>
  </tr>
  <tr>
    <td>报错/意见</td>
    <td>
      <a target="_blank" rel="noreferrer" href="${githubIssueURL}">GitHub Issues</a>
      <a target="_blank" rel="noreferrer" href="https://greasyfork.org/zh-CN/scripts/424023-agefans-enhance/feedback">Greasy Fork 反馈</a>
    </td>
  </tr>
  ${video ? `<tr><td colspan="2" class="info-title">视频信息</td></tr>
     <tr><td>视频链接</td><td>${video.src}</td></tr>
     <tr><td>视频信息</td><td>${video.videoWidth} x ${video.videoHeight}</td></tr>` : ''}
  <tr><td colspan="2" class="info-title">快捷键</td></tr>
  <tr>
    <td colspan="2">
      <div class="shortcuts-wrap">
        <table class="shortcuts-table">
          <tbody>
            <tr><td><span class="key">W</span></td><td>宽屏</td></tr>
            <tr><td><span class="key">F</span></td><td>全屏</td></tr>
            <tr><td><span class="key">←</span></td><td>步退5s</td></tr>
            <tr><td><span class="key">→</span></td><td>步进5s</td></tr>
            <tr><td><span class="key">Shift+←</span></td><td>步退30s</td></tr>
            <tr><td><span class="key">Shift+→</span></td><td>步进30s</td></tr>
            <tr><td><span class="key">Alt+←</span></td><td>步退60s</td></tr>
            <tr><td><span class="key">Altl+→</span></td><td>步进60s</td></tr>
            <tr><td><span class="key">Ctrl+←</span></td><td>步退90s</td></tr>
            <tr><td><span class="key">Ctrl+→</span></td><td>步进90s</td></tr>
          </tbody>
        </table>
        <table class="shortcuts-table">
          <tbody>
            <tr><td><span class="key">esc</span></td><td>退出全屏/宽屏</td></tr>
            <tr>
              <td>
                <span class="key carousel">
                  <span>[</span>
                  <span>P</span>
                  <span>PgUp</span>
                </span>
              </td>
              <td>上一集</td>
            </tr>
            <tr>
              <td>
                <span class="key carousel">
                  <span>]</span>
                  <span>N</span>
                  <span>PgDn</span>
                </span>
              </td>
              <td>下一集</td>
            </tr>
            <tr><td><span class="key">Z</span></td><td>原速播放</td></tr>
            <tr><td><span class="key">X</span></td><td>减速播放</td></tr>
            <tr><td><span class="key">C</span></td><td>加速播放</td></tr>
            <tr><td><span class="key">↑</span></td><td>音量+</td></tr>
            <tr><td><span class="key">↓</span></td><td>音量-</td></tr>
            <tr><td><span class="key">M</span></td><td>静音</td></tr>
            <tr><td><span class="key">?</span></td><td>脚本信息</td></tr>
          </tbody>
        </table>
      </div>
    </td>
  </tr>
  </tbody>
</table>
`;
  const issueBody = (src = '') => `# 文字描述
<!-- 如果有需要额外描述，或者提意见可以写在下面空白处 -->


# 网址链接
${window.location.href}

# 视频链接
${src}

# 环境
userAgent: ${navigator.userAgent}
脚本版本: ${"1.12.1"}
`;
  const progressHTML = `
<div class="k-player-progress">
  <div class="k-player-progress-current"></div>
  <div class="k-player-progress-buffer"></div>
</div>
`;

  function debounce(fn, delay = 300) {
    if (typeof fn !== 'function') {
      throw new TypeError('fn is not a function');
    }

    let timeID = null;
    return function (...rest) {
      if (timeID) {
        clearTimeout(timeID);
      }

      timeID = setTimeout(() => {
        timeID = null;
        fn.apply(this, rest);
      }, delay);
    };
  }

  var css$3 = ".k-modal {\n  position: fixed;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 1000;\n  text-align: left;\n  animation: fadeIn 0.3s ease forwards;\n  color: rgba(0, 0, 0, 0.85);\n}\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.k-modal * {\n  color: inherit;\n}\n.k-modal .k-modal-mask {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  top: 0;\n  background: rgba(0, 0, 0, 0.45);\n  cursor: pointer;\n}\n.k-modal .k-modal-wrap {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  top: 0;\n  overflow: auto;\n  text-align: center;\n  user-select: none;\n}\n.k-modal .k-modal-wrap::before {\n  content: \"\";\n  display: inline-block;\n  width: 0;\n  height: 100%;\n  vertical-align: middle;\n}\n.k-modal .k-modal-container {\n  margin: 20px 0;\n  display: inline-block;\n  vertical-align: middle;\n  text-align: left;\n  position: relative;\n  width: 520px;\n  min-height: 100px;\n  background: white;\n  border-radius: 2px;\n  user-select: text;\n}\n.k-modal .k-modal-header {\n  font-size: 16px;\n  padding: 16px;\n  border-bottom: 1px solid #f1f1f1;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.k-modal .k-modal-close {\n  cursor: pointer;\n  height: 55px;\n  width: 55px;\n  position: absolute;\n  right: 0;\n  top: 0;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  user-select: none;\n}\n.k-modal .k-modal-close * {\n  color: rgba(0, 0, 0, 0.45);\n  transition: color 0.15s ease;\n}\n.k-modal .k-modal-close:hover * {\n  color: rgba(0, 0, 0, 0.85);\n}\n.k-modal .k-modal-body {\n  padding: 16px;\n  font-size: 14px;\n}\n.k-modal .k-modal-footer {\n  padding: 10px 16px;\n  font-size: 14px;\n  border-top: 1px solid #f1f1f1;\n  display: flex;\n  justify-content: flex-end;\n}\n.k-modal .k-modal-btn {\n  user-select: none;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 32px;\n  border-radius: 2px;\n  border: 1px solid #1890ff;\n  background: #1890ff;\n  color: white;\n  min-width: 64px;\n  cursor: pointer;\n}";
  n(css$3,{});

  function modal({
    title,
    content,
    onClose,
    onOk
  }) {
    const store = {
      width: document.body.style.width,
      overflow: document.body.style.overflow
    };
    const ID = Math.random().toString(16).slice(2);
    $__default['default'](`
<div class="k-modal" role="dialog" id="${ID}">
  <div class="k-modal-mask"></div>
  <div class="k-modal-wrap">
    <div class="k-modal-container">
      <div class="k-modal-header">
        <div class="k-modal-title"></div>
        <a class="k-modal-close">
          <svg viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>
        </a>
      </div>
      <div class="k-modal-body">
      </div>
    </div>
  </div>
</div>`).appendTo('body'); // init css

    $__default['default']('body').css({
      width: `calc(100% - ${window.innerWidth - document.body.clientWidth}px)`,
      overflow: 'hidden'
    });
    $__default['default'](`#${ID} .k-modal-title`).append(title);
    $__default['default'](`#${ID} .k-modal-body`).append(content);
    $__default['default'](`#${ID} .k-modal-close`).on('click', () => {
      handleClose();
    });
    $__default['default'](`#${ID} .k-modal-container`).on('click', e => {
      e.stopPropagation();
    });
    $__default['default'](`#${ID} .k-modal-wrap`).on('click', () => {
      handleClose();
    });

    function reset() {
      $__default['default'](`#${ID}`).remove();
      $__default['default']('body').css(store);
      window.removeEventListener('keydown', fn, {
        capture: true
      });
    }

    function handleClose() {
      onClose === null || onClose === void 0 ? void 0 : onClose();
      reset();
    }

    function handleOk() {
      onOk();
      reset();
    }

    function fn(e) {
      if (['Escape', '?', '？'].includes(e.key)) {
        handleClose();
      }

      e.stopPropagation();
    }

    window.addEventListener('keydown', fn, {
      capture: true
    });

    if (onOk) {
      $__default['default'](`#${ID} .k-modal-container`).append(`
      <div class="k-modal-footer">
        <button class="k-modal-btn k-modal-ok">确 定</button>
      </div>
    `);
      $__default['default'](`#${ID} .k-modal-ok`).on('click', () => {
        handleOk();
      });
    }
  }

  function genIssueURL({
    title,
    body
  }) {
    const url = new URL(`https://github.com/IronKinoko/agefans-enhance/issues/new`);
    url.searchParams.set('title', title);
    url.searchParams.set('body', body);
    return url.toString();
  }

  var css$2 = "#k-player-message {\n  z-index: 999;\n  position: absolute;\n  left: 20px;\n  bottom: 60px;\n}\n#k-player-message .k-player-message-item {\n  display: block;\n  width: max-content;\n  padding: 8px 16px;\n  background: var(--k-player-background);\n  border-radius: 4px;\n  color: white;\n  font-size: 14px;\n  white-space: nowrap;\n  overflow: hidden;\n  box-sizing: border-box;\n  margin-top: 4px;\n}\n#k-player-message .k-player-message-item:hover {\n  background: var(--k-player-background-highlight);\n  transition: all 0.3s;\n}";
  n(css$2,{});

  class Message {
    constructor(selector) {
      this.$message = $__default['default']('<div id="k-player-message">');
      this.$message.appendTo($__default['default'](selector));
    }

    info(text, duration = 1500) {
      this.$message.empty();
      return new Promise(resolve => {
        $__default['default'](`<div class="k-player-message-item"></div>`).append(text).hide().appendTo(this.$message).fadeIn(150).delay(duration).fadeOut(150, function () {
          $__default['default'](this).remove();
          resolve();
        });
      });
    }

    destroy() {
      this.$message.empty();
    }

  }

  const SHIFT_KEY = '~!@#$%^&*()_+{}|:"<>?' + '～！@#¥%…&*（）——+「」｜：“《》？';
  /**
   * @param {string[]} keys
   * @param {(e:KeyboardEvent,key:string)=>void} cb
   */

  function keybind(keys, cb) {
    const ua = navigator.userAgent;

    if (!ua.includes('Mac OS')) {
      keys = keys.filter(key => !key.includes('meta'));
    }

    $__default['default'](window).on('keydown', e => {
      let keyArr = [];
      e.ctrlKey && keyArr.push('ctrl');
      e.metaKey && keyArr.push('meta');
      e.shiftKey && !SHIFT_KEY.includes(e.key) && keyArr.push('shift');
      e.altKey && keyArr.push('alt');

      if (!['Control', 'Meta', 'Shift', 'Alt'].includes(e.key)) {
        keyArr.push(e.key);
      }

      keyArr = [...new Set(keyArr)];
      const key = keyArr.join('+');

      if (keys.includes(key)) {
        cb(e, key);
      }
    });
  }

  const MediaErrorMessage = {
    1: '你中止了媒体播放',
    2: '一个网络错误导致媒体下载中途失败',
    3: '由于损坏问题或媒体使用了你的浏览器不支持的功能，媒体播放被中止了',
    4: '媒体无法被加载，要么是因为服务器或网络故障，要么是因为格式不被支持',
    5: '该媒体是加密的，我们没有解密的钥匙'
  };

  class KPlayer {
    /**
     * Creates an instance of KPlayer.
     * @param {stromg} selector
     * @param {Plyr.Options} opts
     */
    constructor(selector, opts) {
      const $wrapper = $__default['default']('<div id="k-player-wrapper"/>').replaceAll(selector);
      const $loading = $__default['default'](loadingHTML);
      const $error = $__default['default'](errorHTML);
      const $video = $__default['default']('<video id="k-player" />');
      const $progress = $__default['default'](progressHTML);
      const $header = $__default['default']('<div id="k-player-header"/>');
      $wrapper.append($video);
      this.plyr = new Plyr__default['default']('#k-player', {
        autoplay: true,
        keyboard: {
          global: true
        },
        controls: [// 'play-large', // The large play button in the center
        'play', // Play/pause playback
        'progress', // The progress bar and scrubber for playback and buffering
        'current-time', // The current time of playback
        'duration', // The full duration of the media
        'mute', // Toggle mute
        'volume', // Volume control
        // 'settings', // Settings menu
        'pip', // Picture-in-picture (currently Safari only)
        'fullscreen' // Toggle fullscreen
        ],
        storage: false,
        seekTime: 5,
        speed: {
          options: speedList
        },
        i18n: {
          restart: '重播',
          rewind: '快退 {seektime}s',
          play: '播放(空格键)',
          pause: '暂停(空格键)',
          fastForward: '快进 {seektime}s',
          seek: 'Seek',
          seekLabel: '{currentTime} / {duration}',
          played: '已播放',
          buffered: '已缓冲',
          currentTime: '当前时间',
          duration: '片长',
          volume: '音量',
          mute: '静音(M)',
          unmute: '取消静音(M)',
          enableCaptions: '显示字幕',
          disableCaptions: '隐藏字幕',
          download: '下载',
          enterFullscreen: '进入全屏(F)',
          exitFullscreen: '退出全屏(F)',
          frameTitle: '标题名称： {title}',
          captions: '字幕',
          settings: '设置',
          pip: '画中画',
          menuBack: '返回上级',
          speed: '倍速',
          normal: '1.0x',
          quality: '分辨率',
          loop: '循环',
          start: '开始',
          end: '结束',
          all: '全部',
          reset: '重置',
          disabled: '禁用',
          enabled: '启用',
          advertisement: '广告',
          qualityBadge: {
            2160: '4K',
            1440: 'HD',
            1080: 'HD',
            720: 'HD',
            576: 'SD',
            480: 'SD'
          }
        },
        tooltips: {
          controls: true,
          seek: true
        },
        ...opts
      });
      this.localConfigKey = 'kplayer';
      this.statusSessionKey = 'k-player-status';
      /**
       * @type {{speed:number,continuePlay:boolean,autoNext:boolean,showProgress:boolean}}
       */

      this.localConfig = {
        speed: 1,
        continuePlay: true,
        autoNext: true,
        showProgress: true
      };

      try {
        this.localConfig = Object.assign(this.localConfig, JSON.parse(window.localStorage.getItem(this.localConfigKey)));
      } catch (error) {
        /** empty */
      }

      this.$wrapper = $wrapper;
      this.$loading = $loading;
      this.$error = $error;
      this.$video = $video;
      this.$progress = $progress;
      this.$header = $header;
      this.$videoWrapper = $wrapper.find('.plyr');
      this.$videoWrapper.append($loading).append($error).append($progress).append($header);
      this.message = new Message(this.$videoWrapper);
      this.eventMap = {};
      this.isWideScreen = false;
      this.wideScreenBodyStyles = {};

      this._injectSettings();

      this._injectSpeed();

      this._injectQuestion();

      this._injectNext();

      this._injectSreen();

      this._initEvent();
      /** @private */


      this.isHoverControls = false;
      /** @private */

      this.hideCursorDebounced = debounce(() => {
        const dom = document.querySelector('.plyr');
        dom.classList.add('plyr--hide-cursor');
      }, 1000);
      /** @private */

      this.hideControlsDebounced = debounce(() => {
        const dom = document.querySelector('.plyr');
        if (!this.isHoverControls) dom.classList.add('plyr--hide-controls');
      }, 1000);
      const status = window.sessionStorage.getItem(this.statusSessionKey);

      if (status) {
        window.sessionStorage.removeItem(this.statusSessionKey);

        this._toggleWidescreen(JSON.parse(status));
      }
    }
    /** @private */


    _initEvent() {
      this.on('loadstart', () => {
        this.$loading.show();
        this.hideError();
      });
      this.on('canplay', () => {
        this.$loading.hide();
        this.plyr.play();
      });
      this.on('error', () => {
        const code = this.plyr.media.error.code;
        this.$loading.hide();
        this.showError(MediaErrorMessage[code] || this.src);

        if (code === 3) {
          const countKey = 'skip-error-retry-count' + window.location.search;
          let skipErrorRetryCount = parseInt(window.sessionStorage.getItem(countKey) || '0');

          if (skipErrorRetryCount < 3) {
            skipErrorRetryCount++;
            const duration = 2 * skipErrorRetryCount;
            this.message.info(`视频源出现问题，第${skipErrorRetryCount}次尝试跳过${duration}s错误片段`, 4000).then(() => {
              this.trigger('skiperror', 2 * skipErrorRetryCount);
            });
            window.sessionStorage.setItem(countKey, skipErrorRetryCount.toString());
          } else {
            this.message.info(`视频源出现问题，多次尝试失败，请手动跳过错误片段`, 4000).then(() => {
              this.trigger('skiperror', 0);
            });
            window.sessionStorage.removeItem(countKey);
          }
        } else {
          const $dom = $__default['default']('<div>视频播放失败，点击此处暂时关闭脚本功能，使用原生播放器观看</div>').css('cursor', 'pointer');
          $dom.on('click', () => {
            this.message.destroy();
            window.sessionStorage.setItem('stop-use', '1');
            window.location.reload();
          });
          this.message.info($dom, 10000);
        }
      });
      this.on('pause', () => {
        this.hideControlsDebounced();
      });
      this.on('enterfullscreen', () => {
        this.$videoWrapper.addClass('k-player-fullscreen');
      });
      this.on('exitfullscreen', () => {
        this.$videoWrapper.removeClass('k-player-fullscreen');
      });
      this.on('timeupdate', () => {
        this.$progress.find('.k-player-progress-current').css('width', this.currentTime / this.plyr.duration * 100 + '%');
        this.$progress.find('.k-player-progress-buffer').css('width', this.plyr.buffered * 100 + '%');
      });
      this.on('ended', () => {
        if (this.localConfig.autoNext) {
          this.trigger('next');
        }
      });
      keybind([// 进退 30s
      'shift+ArrowLeft', 'shift+ArrowRight', // 进退 60s
      'alt+ArrowLeft', 'alt+ArrowRight', // 进退 90s
      'ctrl+ArrowLeft', 'ctrl+ArrowRight', 'meta+ArrowLeft', 'meta+ArrowRight', // 下一集
      'n', ']', '】', 'PageDown', // 上一集
      'p', '[', '【', 'PageUp', // 切换网页全屏
      'w', // 关闭网页全屏
      'Escape', // 播放速度
      'z', 'x', 'c'], (e, key) => {
        switch (key) {
          case 'ctrl+ArrowLeft':
          case 'meta+ArrowLeft':
          case 'shift+ArrowLeft':
          case 'alt+ArrowLeft':
          case 'ctrl+ArrowRight':
          case 'meta+ArrowRight':
          case 'shift+ArrowRight':
          case 'alt+ArrowRight':
            {
              e.stopPropagation();
              e.preventDefault();
              const time = {
                'ctrl+ArrowLeft': 90,
                'meta+ArrowLeft': 90,
                'shift+ArrowLeft': 30,
                'alt+ArrowLeft': 60,
                'ctrl+ArrowRight': 90,
                'meta+ArrowRight': 90,
                'shift+ArrowRight': 30,
                'alt+ArrowRight': 60
              }[key];

              if (e.key === 'ArrowLeft') {
                this.currentTime = Math.max(0, this.currentTime - time);
                this.message.info(`步退${time}s`);
              } else {
                this.currentTime = Math.min(this.currentTime + time, this.plyr.duration);
                this.message.info(`步进${time}s`);
              }

              break;
            }

          case 'n':
          case ']':
          case '】':
          case 'PageDown':
            e.preventDefault();
            this.trigger('next');
            break;

          case 'p':
          case '[':
          case '【':
          case 'PageUp':
            e.preventDefault();
            this.trigger('prev');
            break;

          case 'w':
            if (this.plyr.fullscreen.active) break;

            this._toggleWidescreen();

            break;

          case 'Escape':
            if (this.plyr.fullscreen.active || !this.isWideScreen) break;

            this._toggleWidescreen(false);

            break;

          case 'z':
            this.speed = 1;
            break;

          case 'x':
          case 'c':
            {
              let idx = speedList.indexOf(this.speed);
              const newIdx = key === 'x' ? Math.max(0, idx - 1) : Math.min(speedList.length - 1, idx + 1);
              if (newIdx === idx) break;
              const speed = speedList[newIdx];
              this.speed = speed;
              break;
            }
        }
      });
      document.querySelectorAll('.plyr__controls .plyr__control').forEach(dom => {
        dom.addEventListener('click', e => {
          e.currentTarget.blur();
        });
      });
      const playerEl = document.querySelector('.plyr');
      playerEl.addEventListener('mousemove', () => {
        playerEl.classList.remove('plyr--hide-cursor');
        this.hideCursorDebounced();

        if (this.plyr.paused) {
          this.hideControlsDebounced();
        }
      });
      const controlsEl = document.querySelector('.plyr__controls');
      controlsEl.addEventListener('mouseenter', () => {
        this.isHoverControls = true;
      });
      controlsEl.addEventListener('mouseleave', () => {
        this.isHoverControls = false;
      });
    }
    /** @typedef {'prev'|'next'|'enterwidescreen'|'exitwidescreen'|'skiperror'} CustomEventMap */

    /**
     * @param {CustomEventMap | keyof Plyr.PlyrEventMap} event
     * @param {function} callback
     * @private
     */


    on(event, callback) {
      if (['prev', 'next', 'enterwidescreen', 'exitwidescreen', 'skiperror'].includes(event)) {
        if (!this.eventMap[event]) this.eventMap[event] = [];
        this.eventMap[event].push(callback);
      } else {
        this.plyr.on(event, callback);
      }
    }
    /**
     * @param {CustomEventMap} event
     * @param {*} [params]
     */


    trigger(event, params) {
      const fnList = this.eventMap[event] || [];
      fnList.forEach(fn => {
        fn(this, params);
      });
    }
    /** @private */


    _injectSettings() {
      this.$settings = $__default['default'](settingsHTML);
      this.$settings.find('[name=autoNext]').prop('checked', this.localConfig.autoNext).on('change', e => {
        const checked = e.target.checked;
        this.configSaveToLocal('autoNext', checked);
      });
      this.$settings.find('[name=showProgress]').prop('checked', this.localConfig.showProgress).on('change', e => {
        const checked = e.target.checked;
        this.configSaveToLocal('showProgress', checked);

        if (checked) {
          this.$progress.css('display', '');
        } else {
          this.$progress.css('display', 'none');
        }
      });

      if (!this.localConfig.showProgress) {
        this.$progress.css('display', 'none');
      }

      this.$settings.find('[name=continuePlay]').prop('checked', this.localConfig.continuePlay).on('change', e => {
        const checked = e.target.checked;
        this.configSaveToLocal('continuePlay', checked);
      });
      this.$settings.insertAfter('.plyr__controls__item.plyr__volume');
    }

    configSaveToLocal(key, value) {
      this.localConfig[key] = value;
      window.localStorage.setItem(this.localConfigKey, JSON.stringify(this.localConfig));
    }
    /** @private */


    _injectSpeed() {
      this.$speed = $__default['default'](speedHTML);
      const speedItems = this.$speed.find('.k-speed-item');
      const localSpeed = this.localConfig.speed;
      speedItems.each((_, el) => {
        const speed = +el.dataset.speed;

        if (speed === localSpeed) {
          el.classList.add('k-menu-active');
        }

        $__default['default'](el).on('click', () => {
          this.speed = speed;
        });
      });
      this.plyr.speed = localSpeed;
      this.$speed.find('#k-speed-text').text(localSpeed === 1 ? '倍速' : localSpeed + 'x');
      this.$speed.insertBefore('.plyr__controls__item.plyr__volume');
    }
    /** @private */


    _injectQuestion() {
      $__default['default'](`<svg class="k-player-question-icon"><use xlink:href="#question"/></svg>`).appendTo(this.$header).on('click', () => {
        showInfo();
      });
    }
    /** @private */


    _injectNext() {
      $__default['default']($__default['default']('#plyr__next').html()).insertBefore('.plyr__controls__item.plyr__progress__container').on('click', () => {
        this.trigger('next');
      });
    }
    /** @private */


    _injectSreen() {
      $__default['default']($__default['default']('#plyr__widescreen').html()).insertBefore('[data-plyr="fullscreen"]').on('click', () => {
        this._toggleWidescreen();
      });
    }
    /** @private */


    _toggleWidescreen(bool = !this.isWideScreen) {
      if (this.isWideScreen === bool) return;
      this.isWideScreen = bool;
      window.sessionStorage.setItem(this.statusSessionKey, JSON.stringify(this.isWideScreen));

      if (this.isWideScreen) {
        this.wideScreenBodyStyles = $__default['default']('body').css(['overflow']);
        $__default['default']('body').css('overflow', 'hidden');
        this.$wrapper.addClass('k-player-widescreen');
        $__default['default']('.plyr__widescreen').addClass('plyr__control--pressed');
      } else {
        $__default['default']('body').css(this.wideScreenBodyStyles);
        this.$wrapper.removeClass('k-player-widescreen');
        $__default['default']('.plyr__widescreen').removeClass('plyr__control--pressed');
      }

      this.trigger(this.isWideScreen ? 'enterwidescreen' : 'exitwidescreen');
    }
    /**
     * video src
     * @param {string} src
     */


    set src(src) {
      if (src.includes('.m3u8')) {
        if (!Hls__default['default'].isSupported()) throw new Error('不支持播放 hls 文件');
        const hls = new Hls__default['default']();
        hls.loadSource(src);
        hls.attachMedia(this.$video[0]);
      } else {
        this.$video.attr('src', src);
      }
    }

    get src() {
      return this.$video.attr('src');
    }

    set currentTime(value) {
      this.plyr.currentTime = value;
    }

    get currentTime() {
      return this.plyr.currentTime;
    }

    get speed() {
      return this.plyr.speed;
    }

    set speed(speed) {
      this.plyr.speed = speed;
      const speedItems = this.$speed.find('.k-speed-item');
      speedItems.each((_, el) => {
        if (speed === +el.dataset.speed) {
          el.classList.add('k-menu-active');
        } else {
          el.classList.remove('k-menu-active');
        }
      });
      this.$speed.find('#k-speed-text').text(speed === 1 ? '倍速' : speed + 'x');
      this.message.info(`视频速度：${speed}`);
      this.configSaveToLocal('speed', speed);
    }

    showError(text) {
      this.$error.show().find('.error-info').text(text);
    }

    hideError() {
      this.$error.hide();
    }

  }

  function addReferrerMeta() {
    if ($__default['default']('meta[name=referrer]').length === 0) {
      $__default['default']('head').append('<meta name="referrer" content="same-origin">');
    } else {
      const $meta = $__default['default']('meta[name=referrer]');
      $meta.attr('content', 'same-origin');
    }
  }
  function showInfo() {
    const video = $__default['default']('#k-player')[0];
    const githubIssueURL = genIssueURL({
      title: '🐛[Bug]',
      body: issueBody(video === null || video === void 0 ? void 0 : video.src)
    });
    modal({
      title: '脚本信息',
      content: scriptInfo(video, githubIssueURL)
    });
  }
  keybind(['?', '？'], e => {
    if (!document.fullscreenElement) {
      e.stopPropagation();
      e.preventDefault();
      showInfo();
    }
  });

  /**
   * @param {string} url
   * @param {number} [count=0]
   * @return {string}
   */
  function parseToURL(url, count = 0) {
    if (count > 4) throw new Error('url解析失败');

    try {
      url = new URL(url);
    } catch (error) {
      url = decodeURIComponent(url);
      url = parseToURL(url, ++count);
    }

    return url.toString();
  }

  function copyToClipboard(element) {
    var $temp = $__default['default']('<textarea>');
    $__default['default']('body').append($temp);
    $temp.val($__default['default'](element).text()).trigger('select');
    document.execCommand('copy');
    $temp.remove();
  }

  var css$1 = "#modal-form .row {\n  display: flex;\n  flex-wrap: wrap;\n  box-sizing: border-box;\n}\n#modal-form .row .col {\n  flex-basis: 20%;\n  padding: 4px 0;\n}\n#modal-form .mb8 {\n  margin-bottom: 8px;\n}\n\n.k-checkbox {\n  display: inline-flex;\n  align-items: center;\n}\n.k-checkbox input {\n  margin-right: 4px;\n}\n\n.flex-align-center {\n  display: flex;\n  align-items: center;\n}\n\n.k-alert {\n  margin-bottom: 16px;\n  box-sizing: border-box;\n  color: #000000d9;\n  font-size: 14px;\n  font-variant: tabular-nums;\n  line-height: 1.5715;\n  list-style: none;\n  font-feature-settings: \"tnum\";\n  position: relative;\n  display: flex;\n  align-items: center;\n  padding: 8px 15px;\n  word-wrap: break-word;\n  border-radius: 2px;\n}\n.k-alert .k-alert-icon {\n  margin-right: 8px;\n  display: inline-block;\n  color: inherit;\n  font-style: normal;\n  line-height: 0;\n  text-align: center;\n  text-transform: none;\n  vertical-align: -0.125em;\n  text-rendering: optimizeLegibility;\n  -webkit-font-smoothing: antialiased;\n}\n.k-alert .k-alert-content {\n  flex: 1;\n  min-width: 0;\n}\n\n.k-alert-info {\n  background-color: #e6f7ff;\n  border: 1px solid #91d5ff;\n}\n.k-alert-info .k-alert-icon {\n  color: #1890ff;\n}";
  n(css$1,{});

  function set(name, value, _in_days = 1) {
    var Days = _in_days;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + escape(value) + ';expires=' + exp.toGMTString() + ';path=/';
  }

  function get(name) {
    let reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
    let arr = document.cookie.match(reg);

    if (arr) {
      return decodeURIComponent(arr[2]);
    } else {
      return null;
    }
  }

  const Cookie = {
    get,
    set,
    remove: function (name) {
      set(name, '', 0);
    }
  };

  /**
   * agefans 安全机制：
   * 1. 从服务端获取cookie `t1` `k1`
   * 2. 本地根据规则生成cookie `t2` `k2`
   * 3. 获取链接时候生成cookie `fa_t` `fa_c`
   *
   * t1 t2 fa_t 均为时间，相差太多就报错超时
   * k1 k2 类似密钥
   * fa_c 不重要
   */

  /**
   * 获取视频链接的请求地址
   */

  function getPlayUrl(_url) {
    const _rand = Math.random();

    var _getplay_url = _url.replace(/.*\/play\/(\d+?)\?playid=(\d+)_(\d+).*/, '/_getplay?aid=$1&playindex=$2&epindex=$3') + '&r=' + _rand;
    /**
     * fa_t 取当前时间
     * fa_c 1-9之间随便取 固定1就行
     */


    Cookie.set('fa_t', Date.now(), 1);
    Cookie.set('fa_c', 1, 1);
    return _getplay_url;
  }
  /**
   * 因为agefans的安全策略，需要刷新下cookie才能正常访问
   *
   * 这个方法实现了 t1 k1 t2 k2 全部刷新
   */

  function updateCookie(href) {
    href = href ? location.origin + href : location.href;
    return new Promise((resolve, reject) => {
      const doneFn = () => {
        resolve();
        dom.remove();
      }; // DOMContentLoaded is faster than load


      const dom = document.createElement('iframe');
      dom.style.display = 'none';
      dom.src = href;
      document.body.append(dom);
      dom.contentWindow.addEventListener('DOMContentLoaded', doneFn);
      dom.contentWindow.addEventListener('load', doneFn);
      dom.contentWindow.addEventListener('error', reject);
    });
  }

  /**
   * @typedef {{title:string,href:string}} ATag
   */

  function insertBtn() {
    $__default['default'](`
  <div class="baseblock">
    <div class="blockcontent">
      <div id="wangpan-div" class="baseblock2">
        <div class="blocktitle flex-align-center">
          获取全部视频链接：
          <span id="status-xr7" class="flex-align-center"></span>
        </div>
        <div class="blockcontent">
          <a id="open-modal" class="res_links_a" style="cursor:pointer">获取全部视频链接</a>
          <span>｜</span>
          <a id="clean-all" class="res_links_a" style="cursor:pointer">清空</a>
          <span>｜</span>
          <a id="copy-text" class="res_links_a" style="cursor:pointer">复制内容</a>
          <span>｜</span>
          <a id="thunder-link" rel="noreferrer" target="_blank" class="res_links_a" style="cursor:pointer">导出迅雷链接</a>
          <div id="url-list" style="width:100%; max-height:400px; overflow:auto;"></div>
        </div>
      </div>
    </div>
  </div>
`).insertAfter($__default['default']('.baseblock:contains(网盘资源)'));
    $__default['default']('#copy-text').on('click', function () {
      copyToClipboard($__default['default']('#url-list'));
      $__default['default'](this).text('已复制');
      setTimeout(() => {
        $__default['default'](this).text('复制内容');
      }, 1000);
    });
    $__default['default']('#clean-all').on('click', () => {
      getAllVideoUrlList().forEach(o => {
        removeLocal(o.href);
      });
      showLocalURL();
    });
    $__default['default']('#open-modal').on('click', function () {
      modal({
        title: '选择需要的链接',
        content: insertModalForm(),
        onOk: () => {
          let list = [];
          $__default['default']('#modal-form .col input:checked').each((_, el) => {
            list.push({
              title: $__default['default'](el).data('title'),
              href: $__default['default'](el).attr('name')
            });
          });
          insertResult(list);
        }
      });
    });
    $__default['default']('#thunder-link').attr('href', () => {
      const map = getLocal();
      const list = getAllVideoUrlList();
      const tasks = [];
      const taskGroupName = $__default['default']('#detailname a').text();
      list.forEach(item => {
        if (map[item.href]) {
          tasks.push({
            url: map[item.href].url,
            baseName: `${item.title}.mp4`
          });
        }
      });
      const params = {
        taskGroupName,
        tasks
      };
      const baseURL = 'https://ironkinoko.github.io/agefans-enhance/thunder.html';
      const url = new URL(baseURL);
      url.searchParams.append('params', JSON.stringify(params));
      return url.toString();
    });
  }
  /**
   * @return {ATag[]}
   */


  function getAllVideoUrlList() {
    const $aTagList = $__default['default']('.movurl:visible li a');
    const aTags = [];
    $aTagList.each(function (index, aTag) {
      aTags.push({
        title: aTag.textContent,
        href: aTag.dataset.href
      });
    });
    return aTags;
  }

  function insertModalForm() {
    const list = getAllVideoUrlList();
    let $dom = $__default['default'](`
  <div id="modal-form">
    <div class="k-alert k-alert-info">
      <span class="k-alert-icon">
        <svg viewBox="64 64 896 896" focusable="false" data-icon="info-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"></path>
        </svg>
      </span>
      <div class="k-alert-content">
        <div class="k-alert-message">如果在1-2分钟内调用超过70多次，会被限流影响正常观看视频</div>
      </div>
    </div>
    <label class="k-checkbox">
      <input id="all-check" type="checkbox" checked/>全选
    </label>
    <ul class="row">
      ${list.map(aTag => `
        <li class="col">
          <label class="k-checkbox"><input type="checkbox" name="${aTag.href}" data-title="${aTag.title}" checked />${aTag.title}</label>
        </li>`).join('')}
    </ul>
  </div>
  `);
    $dom.find('.row .col input').on('change', () => {
      const length = list.length;
      const checkedLength = $dom.find('.row .col input:checked').length;
      $dom.find('.k-checkbox #all-check').prop('checked', length === checkedLength);
    });
    $dom.find('.k-checkbox #all-check').on('change', e => {
      $dom.find('.row .col input').prop('checked', e.currentTarget.checked);
    });
    return $dom;
  }

  function genUrlItem(title, content = '加载中...') {
    const contentHTML = content.startsWith('http') ? `<a href="${content}" download>${content}</a>` : content;
    return `<div>
  <div style="white-space: nowrap;">[${title}]</div>
  <div class="url" data-status='0' style="word-break:break-all; word-wrap:break-word;">
    ${contentHTML}
  </div>
</div>`;
  }

  const loadingIcon = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin-right:4px;" width="1em" height="1em" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
  <circle cx="50" cy="50" fill="none" stroke="#5699d2" stroke-width="10" r="40" stroke-dasharray="164.93361431346415 56.97787143782138">
    <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.6s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
  </circle>
</svg>`;
  /**
   * @param {ATag[]} list
   */

  async function insertResult(list) {
    const $parent = $__default['default']('#url-list');
    $parent.empty();
    $__default['default']('#status-xr7').hide().fadeIn(300).html(`${loadingIcon}<div>更新cookie中...</div>`);
    await updateCookie();
    $__default['default']('#status-xr7').text('更新完成').delay(1500).fadeOut(300);
    list.forEach(item => {
      let $dom = $__default['default'](genUrlItem(item.title)).appendTo($parent);
      let $msg = $dom.find('.url');

      async function _getUrl() {
        try {
          const vurl = await getVurl(item.href);
          saveLocal(item.href, vurl);
          $msg.html(`<a href="${vurl}" download>${vurl}</a>`);
          $msg.data('status', '1');
        } catch (error) {
          console.error(error);
          $msg.empty();
          $msg.data('status', '2');

          if (error instanceof AGEfansError) {
            $__default['default'](`<span>${error.message}</span>`).appendTo($msg);
          } else {
            $__default['default'](`<a style="cursor:pointer">加载错误，请重试</a>`).appendTo($msg).on('click', async () => {
              // 失败需要重试获取cookie
              await updateCookie();

              _getUrl();
            });
          }
        }
      }

      _getUrl();
    });
  }

  const PLAY_URL_KEY = 'play-url-key';
  /**
   * @param {string} [href]
   * @return {Record<string,{url:string}> | string | null}
   */

  function getLocal(href) {
    const map = JSON.parse(window.localStorage.getItem(PLAY_URL_KEY) || '{}');

    if (href) {
      const item = map[href];

      if (!(item !== null && item !== void 0 && item.time) || Date.now() - item.time > 24 * 60 * 60 * 1000) {
        return null;
      }

      return item.url;
    }

    return map;
  }

  function saveLocal(href, url) {
    const map = getLocal();
    map[href] = {
      url,
      time: Date.now()
    };
    window.localStorage.setItem(PLAY_URL_KEY, JSON.stringify(map));
  }
  function removeLocal(href) {
    const map = getLocal();
    delete map[href];
    window.localStorage.setItem(PLAY_URL_KEY, JSON.stringify(map));
  }
  function showLocalURL() {
    const list = getAllVideoUrlList();
    const $parent = $__default['default']('#url-list');
    $parent.empty();
    $__default['default'](list.map(item => {
      const vurl = getLocal(item.href);

      if (vurl) {
        return genUrlItem(item.title, vurl);
      } else {
        return '';
      }
    }).join('')).appendTo($parent);
  }

  class AGEfansError extends Error {
    constructor(message) {
      super(message);
      this.name = 'AGEfans Enhance Exception';
    }

  }

  async function getVurl(href) {
    const res = await fetch(getPlayUrl(href), {
      referrerPolicy: 'strict-origin-when-cross-origin'
    });
    const text = await res.text();

    if (text.includes('ipchk')) {
      throw new AGEfansError(`你被限流了，请5分钟后重试（${text}）`);
    }

    if (text.includes('timeout')) {
      throw new AGEfansError(`Cookie过期，请刷新页面重试（${text}）`);
    }

    const json = JSON.parse(text);
    return parseToURL(json.vurl);
  }

  async function getVurlWithLocal(href) {
    let vurl = getLocal(href);

    if (vurl) {
      return vurl;
    }

    await updateCookie(href);
    vurl = await getVurl(href);
    saveLocal(href, vurl);
    return vurl;
  }
  function initGetAllVideoURL() {
    insertBtn();
    showLocalURL();
  }

  function replacePlayer$3() {
    const dom = document.getElementById('age_playfram');

    const fn = () => {
      if (!dom.src) return;
      let url = new URL(dom.src);

      if (url.hostname.includes('agefans')) {
        let videoURL = url.searchParams.get('url');

        if (videoURL) {
          addReferrerMeta();
          initPlayer(parseToURL(videoURL));
          mutationOb.disconnect();
        }
      } else {
        const message = new Message('#ageframediv');
        message.info('这个视频似乎是第三方链接，并非由agefans自身提供，将使用默认播放器播放', 3000);
        mutationOb.disconnect();
      }
    };

    const mutationOb = new MutationObserver(fn);
    mutationOb.observe(dom, {
      attributes: true
    });
    fn();
  }

  function showCurrentLink(vurl) {
    const decodeVurl = parseToURL(vurl);
    const isSteaming = decodeVurl.includes('.m3u8');

    if ($__default['default']('#current-link').length) {
      $__default['default']('#current-link').text(decodeVurl);
      $__default['default']('#current-link').attr('href', decodeVurl);
      return;
    }

    $__default['default'](`
  <div class="baseblock">
    <div class="blockcontent">
      <div id="wangpan-div" class="baseblock2">
        <div class="blocktitle">本集链接：${isSteaming ? '(流媒体视频暂时不支持下载)' : ''}</div>
        <div class="blockcontent">
          <a class="res_links" id="current-link" download rel="noreferrer" href="${decodeVurl}">${decodeVurl}</a>
        </div>
      </div>
    </div>
  </div>
`).insertBefore($__default['default']('.baseblock:contains(网盘资源)'));
  }

  function gotoPrevPart() {
    const dom = getActivedom$2().parent().prev().find('a');

    if (dom.length) {
      switchPart$3(dom.data('href'), dom);
    }
  }

  function gotoNextPart() {
    const dom = getActivedom$2().parent().next().find('a');

    if (dom.length) {
      switchPart$3(dom.data('href'), dom);
    }
  }

  function getActivedom$2() {
    return $__default['default']("li a[style*='color: rgb(238, 0, 0)']");
  } // switch part retry count


  let retryCount = 0;
  let switchLoading = false;
  /**
   *
   * @param {string} href
   * @param {JQuery<HTMLAnchorElement>} $dom
   * @param {boolean} [push]
   */

  async function switchPart$3(href, $dom, push = true) {
    try {
      if (switchLoading === true) return;
      switchLoading = true;
      retryCount++;
      push && player$3.message.info(`即将播放${$dom.text()}`);
      const vurl = await getVurlWithLocal(href);
      push && player$3.message.destroy();
      const speed = player$3.plyr.speed;
      player$3.src = vurl;
      player$3.plyr.speed = speed;
      const $active = getActivedom$2();
      $active.css({
        color: '',
        border: ''
      });
      $dom.css({
        color: 'rgb(238, 0, 0)',
        border: '1px solid rgb(238, 0, 0)'
      });
      const title = document.title.replace($active.text(), $dom.text());
      push && history.pushState({}, title, href);
      document.title = title;
      showCurrentLink(vurl);
      showLocalURL();
      his.logHistory();
      retryCount = 0;
      switchLoading = false;
    } catch (error) {
      switchLoading = false;

      if (retryCount > 3) {
        console.error(error);
        window.location.href = href;
      } else {
        switchPart$3(href, $dom, push);
      }
    }
  }

  function initPlayPageStyle() {
    let dom = document.querySelector('.fullscn');
    dom.remove();
    let ageframediv = document.getElementById('ageframediv');
    let {
      width
    } = ageframediv.getBoundingClientRect();
    ageframediv.style.height = width / 16 * 9 + 'px';
  }

  function updateTime(time = 0) {
    var _location$pathname$ma;

    const id = (_location$pathname$ma = location.pathname.match(/\/play\/(\d*)/)) === null || _location$pathname$ma === void 0 ? void 0 : _location$pathname$ma[1];
    if (!id) return;
    his.setTime(id, Math.floor(time));
  }

  function videoJumpHistoryPosition() {
    var _location$pathname$ma2, _his$get;

    const id = (_location$pathname$ma2 = location.pathname.match(/\/play\/(\d*)/)) === null || _location$pathname$ma2 === void 0 ? void 0 : _location$pathname$ma2[1];
    if (!id) return;

    if (((_his$get = his.get(id)) === null || _his$get === void 0 ? void 0 : _his$get.time) > 3) {
      player$3.currentTime = his.get(id).time;
      player$3.message.info(`已自动跳转至历史播放位置 ${parseTime(his.get(id).time)}`);
    }
  }

  function addListener() {
    player$3.on('next', () => {
      gotoNextPart();
    });
    player$3.on('prev', () => {
      gotoPrevPart();
    });
    player$3.plyr.once('canplay', () => {
      if (player$3.localConfig.continuePlay) {
        videoJumpHistoryPosition();
      }
    });
    player$3.on('error', () => {
      removeLocal(getActivedom$2().data('href'));
    });
    player$3.on('timeupdate', () => {
      if (Math.floor(player$3.currentTime) % 3 === 0) {
        updateTime(player$3.currentTime);
      }
    });
    player$3.on('skiperror', (_, duration) => {
      if (duration === 0) {
        updateTime(0);
      } else {
        updateTime(player$3.currentTime + duration);
      }

      window.location.reload();
    });
    window.addEventListener('popstate', () => {
      const href = location.pathname + location.search;
      const $dom = $__default['default'](`[data-href='${href}']`);

      if ($dom.length) {
        switchPart$3(href, $dom, false);
      } else {
        window.location.reload();
      }
    });
  }

  function replaceHref() {
    $__default['default']('.movurl:visible li a').each(function () {
      const href = $__default['default'](this).attr('href');
      $__default['default'](this).removeAttr('href').attr('data-href', href).css('cursor', 'pointer').on('click', e => {
        e.preventDefault();
        switchPart$3(href, $__default['default'](this));
      });
    });
  }
  /** @type {KPlayer} */


  let player$3;

  function initPlayer(vurl) {
    player$3 = new KPlayer('#age_playfram');
    showCurrentLink(vurl);
    addListener();
    player$3.src = vurl;
    saveLocal(getActivedom$2().data('href'), vurl);
    showLocalURL();
  }

  function removeCpraid() {
    $__default['default']('#cpraid').remove();
  }

  function useOriginPlayer() {
    const message = new Message('#ageframediv');
    message.info('脚本功能已暂时禁用，使用原生播放器观看，右下角可启动脚本', 3000);
    const $dom = $__default['default'](`<span>启用脚本</span>`).css({
      color: '#60b8cc',
      cursor: 'pointer'
    }).on('click', () => {
      window.sessionStorage.removeItem('stop-use');
      window.location.reload();
    });
    $__default['default']('#wangpan-div .blocktitle').css({
      display: 'flex',
      justifyContent: 'space-between'
    }).append($dom);
  }

  function playModule$3() {
    removeCpraid();

    if (window.sessionStorage.getItem('stop-use') === '1') {
      useOriginPlayer();
      return;
    }

    his.logHistory();
    initPlayPageStyle();
    replaceHref();
    replacePlayer$3();
    initGetAllVideoURL();
  }

  function agefans() {
    if (self !== parent) return;
    $__default['default']('body').addClass('agefans-wrapper');

    historyModule(); // log page to history

    if (location.pathname.startsWith('/play')) {
      playModule$3();
    } // in detail pages show view history


    if (location.pathname.startsWith('/detail')) {
      detailModule();
    }
  }

  var css = ".yhdm-wrapper {\n  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;\n}\n.yhdm-wrapper .play,\n.yhdm-wrapper #playbox,\n.yhdm-wrapper .bofang,\n.yhdm-wrapper .pp .player {\n  height: 540px;\n}";
  n(css,{});

  /** @type {KPlayer} */

  let player$2;

  function replacePlayer$2() {
    const vurl = $__default['default']('#playbox').data('vid');
    player$2 = new KPlayer('.bofang iframe');
    player$2.src = vurl.split('$')[0];
  }

  function switchPart$2(next) {
    var _$$direction$1$find$;

    let directionRight = true;
    const re = /\/v\/\d+-(\d+)/;
    let prevID;
    Array.from($__default['default']('.movurls a')).forEach(a => {
      if (re.test(a.href)) {
        const [, id] = a.href.match(re);
        if (prevID) directionRight = +prevID < +id;
        prevID = id;
      }
    });
    let direction = ['prev', 'next'];
    if (!next) direction.reverse();
    if (!directionRight) direction.reverse();
    (_$$direction$1$find$ = $__default['default']('.movurls .sel')[direction[1]]().find('a')[0]) === null || _$$direction$1$find$ === void 0 ? void 0 : _$$direction$1$find$.click();
  }

  function initEvent$2() {
    player$2.on('prev', () => switchPart$2(false));
    player$2.on('next', () => switchPart$2(true));
  }

  function playModule$2() {
    $__default['default']('body').addClass('yhdm-wrapper');
    replacePlayer$2();
    initEvent$2();
  }

  /** @type {KPlayer} */

  let player$1;

  function replacePlayer$1() {
    const dom = document.getElementById('yh_playfram');

    const fn = () => {
      if (!dom.src) return;
      let url = new URL(dom.src);
      let videoURL = url.searchParams.get('url');

      if (videoURL) {
        player$1 = new KPlayer('#yh_playfram');
        player$1.src = parseToURL(videoURL);
        initEvent$1();
        mutationOb.disconnect();
      }
    };

    const mutationOb = new MutationObserver(fn);
    mutationOb.observe(dom, {
      attributes: true
    });
    fn();
  }

  function switchPart$1(next) {
    var _getActivedom$parent$;

    (_getActivedom$parent$ = getActivedom$1().parent()[next ? 'next' : 'prev']().find('a')[0]) === null || _getActivedom$parent$ === void 0 ? void 0 : _getActivedom$parent$.click();
  }

  function getActivedom$1() {
    return $__default['default'](".movurl:visible li a[style*='color: rgb(255, 255, 255)']");
  }

  function initEvent$1() {
    player$1.on('prev', () => switchPart$1(false));
    player$1.on('next', () => switchPart$1(true));
  }

  function playModule$1() {
    $__default['default']('body').addClass('yhdm-wrapper');
    $__default['default']('#ipchk_getplay').remove();
    $__default['default']('.fullscn').remove();
    replacePlayer$1();
  }

  /** @type {KPlayer} */

  let player;

  function replacePlayer() {
    const dom = document.getElementById('play2');

    const fn = () => {
      if (!dom.src) return;
      let url = new URL(dom.src);
      let videoURL = url.searchParams.get('vid');

      if (videoURL) {
        player = new KPlayer('#play2');
        player.src = parseToURL(videoURL);
        initEvent();
        mutationOb.disconnect();
      }
    };

    const mutationOb = new MutationObserver(fn);
    mutationOb.observe(dom, {
      attributes: true
    });
    fn();
  }

  function switchPart(next) {
    var _getActivedom$parent$;

    (_getActivedom$parent$ = getActivedom().parent()[next ? 'next' : 'prev']().find('a')[0]) === null || _getActivedom$parent$ === void 0 ? void 0 : _getActivedom$parent$.click();
  }

  function getActivedom() {
    return $__default['default'](`.movurls:visible li a[href='${location.pathname}']`);
  }

  function initEvent() {
    player.on('prev', () => switchPart(false));
    player.on('next', () => switchPart(true));
  }

  function playModule() {
    $__default['default']('body').addClass('yhdm-wrapper');
    $__default['default']('#adl').remove();
    $__default['default']('#adr').remove();
    $__default['default']('#adv').remove();
    $__default['default']('.fullscn').remove();
    replacePlayer();
  }

  function yhdm() {
    const href = window.location.href;

    if (href.includes('yhdm.so') || href.includes('yinghuacd.com')) {
      playModule$2();
    }

    if (href.includes('yhdmp.cc')) {
      playModule$1();
    }

    if (href.includes('imomoe.live')) {
      playModule();
    }
  }

  if (self === parent) {
    if (window.location.href.includes('agefans')) {
      agefans();
    }

    yhdm();
  }

}($, Plyr, Hls));
