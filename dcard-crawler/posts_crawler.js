//Reference:https://mealiy62307.medium.com/node-js-node-js-%E7%88%AC%E8%9F%B2%E8%88%87-line-bot-b94356fcd59d
import { newPage, newBrowser } from './PageManager.js';
import { DcardPageManager } from './DcardManager.js';
import fs from "node:fs";
const savedDir = "<save destination directory>";


(async() => {

    const savePostsIntoFile = (forum, posts, filename = forum) => {
        let csvArr = []
        for (const post of posts) {
            let arr = Array.from(post, item => [forum + "," + item]);
            console.log(arr)
            csvArr = csvArr.concat(arr);
        }


        const csvString = stringify(csvArr); // Convert data to CSV string

        const stream = fs.createWriteStream(`${savedDir}\\${filename}.csv`, { flags: 'w', encoding: 'utf8' });

        // 寫入 BOM 字節序列
        stream.write('\uFEFF');

        stream.write(csvString); // Write the CSV string to the file
        stream.end();

        function stringify(arr) {
            return arr.map(innerArr => innerArr.join(',')).join('\n');
        }

    };

    const browser1 = await newBrowser(false);

    const dcardPage1 = await newPage(browser1);

    const dcardManager1 = new DcardPageManager(dcardPage1);

    // 心情版上 [查詢詞:"研究所"、"大學"、"課業壓力"、"畢業發展"、"人際狀況"、"經濟狀況"、"家庭影響"] 
    dcardManager1.getForumPostsByQueries("mood", ["研究所", "大學", "課業壓力", "畢業發展", "人際狀況", "經濟狀況", "家庭影響"], 0, 0, async() => {
        await savePostsIntoFile("mood", dcardManager1.getAllGatherPosts(), "mood");
        console.log("完成mood");
        dcardManager1.clearGatherPosts();
    })


    // 研究所版上 [查詢詞:"壓力","課業壓力","畢業發展","人際關係","經濟狀況","家庭狀況"] query=壓力&forum=graduate_school
    const browser2 = await newBrowser(false);

    const dcardPage2 = await newPage(browser2);

    const dcardManager2 = new DcardPageManager(dcardPage2);
    dcardManager2.getForumPostsByQueries("graduate_school", ["壓力", "課業壓力", "畢業發展", "人際關係", "經濟狀況", "家庭狀況"], 0, 0, async() => {
        await savePostsIntoFile("collegelife", dcardManager2.getAllGatherPosts(), "graduate_school");
        console.log("完成graduate_school");
        dcardManager2.clearGatherPosts();
    });

    // 大學生活版上 [查詢詞:"壓力","課業壓力","畢業發展","人際關係","經濟狀況","家庭狀況"]query=壓力&forum=collegelife
    const browser3 = await newBrowser(false);

    const dcardPage3 = await newPage(browser3);

    const dcardManager3 = new DcardPageManager(dcardPage3);

    dcardManager3.getForumPostsByQueries("collegelife", ["壓力", "課業壓力", "畢業發展", "人際關係", "經濟狀況", "家庭狀況"], 0, 0, async() => {
        await savePostsIntoFile("collegelife", dcardManager3.getAllGatherPosts(), "collegelife");
        console.log("完成collegelife");
        dcardManager3.clearGatherPosts();
    });


})();