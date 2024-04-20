//Reference:https://mealiy62307.medium.com/node-js-node-js-%E7%88%AC%E8%9F%B2%E8%88%87-line-bot-b94356fcd59d
import { newPage, newBrowser } from './PageManager.js';
import { DcardPageManager } from './DcardManager.js';
import fs from "node:fs";
import { parse } from "csv";
const savedDir = "<save destination directory>";


const browser = await newBrowser(false);
const dcardPage = await newPage(browser);
const dcardManager = new DcardPageManager(dcardPage);
(async() => {
    let forum = "collegelife";
    let rows = new Set();
    let csvContent = [];
    fs
        .createReadStream(`${forum}_post.csv`)
        .pipe(parse())
        .on('data', async(row) => {
            rows.add(row)
        }).on('end', async() => {
            for (const row of rows) {
                await dcardManager.getPostContent(row[2], (result) => {
                    let content = removeImgTags(result);
                    content = content.replace(/\n/g, ' ');
                    csvContent.push([...row, content]);
                });
            }


            for (const str of csvContent) {
                console.log(str);
            }
            const csvString = stringify(csvContent); // Convert data to CSV string

            const stream = fs.createWriteStream(`${savedDir}\\${forum}_content.csv`, { flags: 'w' });
            // 寫入 BOM 字節序列
            stream.write('\uFEFF');

            stream.write(csvString); // Write the CSV string to the file
            stream.end();


            function stringify(arr) {
                return arr.map(innerArr => innerArr.join(',')).join('\n');
            }

        })
})();



function removeImgTags(text) {
    // 定義 img 標籤
    const imgTagRegex = /<img[^>]*>/g;

    // 使用 replace 方法將匹配到的 img 標籤替換為空字符串
    return text.replace(imgTagRegex, '');
}

function removeNewlines(text) {
    // 使用正則表達式將所有的 \n 替換為空字符串
    return text.replace(/\n/g, '');
}