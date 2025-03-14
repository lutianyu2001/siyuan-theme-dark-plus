/**
 * 默认块属性注入
 * Author: Sky Lu
 * Date: 2025-03-14
 * GitHub: https://github.com/lutianyu2001
 * Email: lutianyu2001@gmail.com
 */

import { config } from './config.js';

/**
 * 为指定块注入默认属性
 * @param {HTMLElement} block DOM 元素
 * @param {boolean} isDocument 是否为文档块
 */
function injectDefaultAttrs(block, isDocument = false) {
    // 检查是否启用了默认属性功能
    if (!config.theme.blockattrs.defaults.enable) return;

    // 获取块类型
    const type = isDocument ? 'NodeDocument' : block.getAttribute('data-type');
    if (!type) return;

    // 获取默认属性
    const defaultAttrs = config.theme.blockattrs.defaults.attributes[type];
    if (!defaultAttrs) return;

    // 注入默认属性
    Object.entries(defaultAttrs).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            block.setAttribute(`custom-${key}`, value);
        }
    });
}

/**
 * 延迟处理编辑器, 避免在编辑器未完全加载时处理导致属性注入失败
 * @param {HTMLElement} protyle 编辑器元素
 * @param {number} delay 延迟时间（毫秒）
 */
function delayProcessEditor(protyle, delay) {
    setTimeout(() => {
        // console.log('delayProcessEditor', protyle, delay);
        processEditor(protyle);
    }, delay);
}

/**
 * 处理编辑器中的所有块
 * @param {HTMLElement} protyle 编辑器元素
 */
function processEditor(protyle) {
    if (!protyle) return;

    // 获取编辑区域
    const wysiwyg = protyle.querySelector('.protyle-wysiwyg');
    if (wysiwyg) {
        // 注入文档属性
        injectDefaultAttrs(wysiwyg, true);

        // 处理所有子块
        wysiwyg.querySelectorAll('[data-node-id][data-type]').forEach(block => {
            injectDefaultAttrs(block, false);
        });
    }
}

/**
 * 等待DOM加载完成
 * @param {HTMLElement} element 要检查的元素
 * @returns {Promise<boolean>} 是否加载成功
 */
function waitForDOM(element) {
    return new Promise((resolve) => {
        // 如果元素已经包含必要的子元素，直接返回 true
        if (element.querySelector('.protyle-wysiwyg')) {
            resolve(true);
            return;
        }

        // 创建观察器
        const observer = new MutationObserver((mutations, obs) => {
            // 检查是否已经加载完成
            if (element.querySelector('.protyle-wysiwyg')) {
                obs.disconnect();
                resolve(true);
            }
        });

        // 配置观察器
        observer.observe(element, {
            childList: true,
            subtree: true
        });

        // 设置超时
        setTimeout(() => {
            observer.disconnect();
            resolve(false);
        }, 5000); // 5 秒超时
    });
}

/**
 * 观察编辑器变化
 */
function observeEditor() {
    // 创建 MutationObserver 实例
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // 处理新添加的节点
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // 检查是否是新打开的文档
                    if (node.classList?.contains('fn__flex-1') && 
                        node.classList?.contains('protyle')) {
                        // 等待DOM加载完成后处理
                        waitForDOM(node).then(success => {
                            // console.log('waitForDOM', success);
                            if (success) {
                                // console.log('processEditor', node);
                                delayProcessEditor(node, config.theme.blockattrs.defaults.delay);
                            }
                        });
                    }
                    // 检查是否是新添加的块
                    else if (node.hasAttribute('data-node-id') && 
                             node.hasAttribute('data-type')) {
                        injectDefaultAttrs(node, false);
                    }
                }
            });
        });
    });

    // 配置观察器
    const observerConfig = {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-node-id', 'data-type']
    };

    // 开始观察文档区域
    const layoutContent = document.querySelector('.layout__center');
    if (layoutContent) {
        observer.observe(layoutContent, observerConfig);
    }

    // 处理已打开的文档
    document.querySelectorAll('.fn__flex-1.protyle').forEach(protyle => {
        waitForDOM(protyle).then(success => {
            if (success) {
                // console.log('processEditor', protyle);
                delayProcessEditor(protyle, config.theme.blockattrs.defaults.delay);
            }
        });
    });
}

// 导出模块
export default {
    injectDefaultAttrs,
    processEditor,
    observeEditor
};
