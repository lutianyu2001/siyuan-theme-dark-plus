function loadScript(url) {
    let script = document.createElement('script');
    script.setAttribute('type', 'module');
    script.setAttribute('src', url);
    document.getElementsByTagName('head')[0].appendChild(script);
}

(() => {
    loadScript("/appearance/themes/Dark+/script/module/blockattrs.js");
    loadScript("/appearance/themes/Dark+/script/module/copy.js");
    loadScript("/appearance/themes/Dark+/script/module/goto.js");
    loadScript("/appearance/themes/Dark+/script/module/reload.js");
    loadScript("/appearance/themes/Dark+/script/module/style.js");
    loadScript("/appearance/themes/Dark+/script/module/timestamp.js");

    // loadScript("/appearance/themes/Dark+/script/test/listener.js");
})();
