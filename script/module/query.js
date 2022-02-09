/* 使用表格显示 SQL 查询结果 */

import { config } from '/appearance/themes/Dark+/script/module/config.js';
import { isKey } from '/appearance/themes/Dark+/script/utils/hotkey.js';

import {
    getBlockByID,
    updateBlock,
    insertBlock,
    sql,
} from '/appearance/themes/Dark+/script/utils/api.js';


async function query() {
    try {
        const layout__center = document.querySelector('.layout__center');

        let focus = layout__center.querySelector('div.fn__flex-1.protyle:not(.fn__none) div.protyle-wysiwyg.protyle-wysiwyg--attr')
        // console.log(focus);
        // 查找当前页面中所有用于查询的 SQL 语句
        let code_blocks = focus.querySelectorAll('div[data-node-id][data-type="NodeCodeBlock"][custom-type="query"]')
        for (var code_block of code_blocks) {
            // console.log(code_block);
            let id = code_block.getAttribute('data-node-id');
            // console.log(id);
            let sql_block = await getBlockByID(id);
            // console.log(sql_block);
            let sql_text = sql_block.content;
            // console.log(sql_text);
            let query_result = await sql(sql_text);
            // console.log(query_result);

            if (query_result.length <= 0) {
                window.alert("查询结果为空!\nThe query result is empty!");
                return;
            }

            let markdown = [];

            if (config.query.regs.blocks.test(sql_text)) { // 匹配指定正则的 SQL 查询
                let header = []; // 表头
                let align = []; // 对齐样式
                header.push('|    |');
                align.push('| -: |');
                for (let field of config.query.fields) { // 根据自定义字段列表，构造表头
                    header.push(` ${field} |`);
                    align.push(` ${config.query.align[field]} |`);
                }
                markdown.push(header.join(''));
                markdown.push(align.join(''));

                // REF [JS几种数组遍历方式以及性能分析对比 - 撒网要见鱼 - 博客园](https://www.cnblogs.com/dailc/p/6103091.html)
                for (let i = 1, len = query_result.length; i <= len; i++) {
                    // 每一条查询记录
                    let row = query_result[i - 1];
                    // console.log(row);

                    let row_markdown = [];
                    row_markdown.push(`| ${i} |`);
                    for (let field of config.query.fields) { // 根据自定义字段列表，构造表格
                        row_markdown.push(` ${config.query.handler[field](row)} |`);
                    }

                    markdown.push(row_markdown.join(''));
                }
            }
            else {
                let header = []; // 表头
                let align = []; // 对齐样式
                let header_row = query_result[0];
                let keys = Object.keys(header_row)
                header.push(`|    |`);
                align.push(`| -: |`);
                for (var key of keys) {
                    header.push(` ${key} |`);
                    align.push(` :- |`);
                }
                markdown.push(header.join('')); // 表头
                markdown.push(align.join('')); // 对齐样式

                for (let i = 1, len = query_result.length; i <= len; i++) {
                    // 每一条查询记录
                    // console.log(row);
                    let row = query_result[i - 1];
                    let row_markdown = [];
                    row_markdown.push(`| ${i} |`);
                    for (var key of keys) {
                        if (row[key] == '' || row[key] == null || row[key] == undefined) {
                            row_markdown.push(` |`);
                        }
                        else {
                            row_markdown.push(` \`${row[key]}\` |`);
                        }
                    }
                    markdown.push(row_markdown.join(''));
                }
            }

            markdown.push('{: custom-type="query-result"}');
            markdown = markdown.join('\n');
            // console.log(markdown);

            // 将查询结果渲染到页面中
            let next_block = code_block.nextElementSibling;
            // console.log(next_block);

            if (next_block
                && next_block.getAttribute('custom-type') == 'query-result'
                && next_block.getAttribute('data-type') == 'NodeTable'
            ) { // 若下一节点有查询结果
                // 更新查询结果节点
                let id = next_block.getAttribute('data-node-id');
                await updateBlock(
                    id,
                    'markdown',
                    markdown,
                );
            } else { // 若下一节点无查询结果
                // 创建查询结果节点
                await insertBlock(
                    id,
                    'markdown',
                    markdown,
                );
            }
        }
    }
    catch (err) {
        console.log(err);
        window.alert(`SQL 查询错误!\nThe SQL query error!\n${err}`);
    }
}

(() => {
    let body = document.querySelector('body');

    // 使用快捷键进行查询
    body.addEventListener('keydown', (e) => {
        // console.log(e);
        if (isKey(e, config.hotkeys.query)) {
            setTimeout(query(), 0)
        }
    });
})();
