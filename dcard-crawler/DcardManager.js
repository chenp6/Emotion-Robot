import { navigateToPage } from './PageManager.js';
import { TimeoutError } from 'puppeteer';

import cheerio from 'cheerio';

export class DcardPageManager {

    constructor(page) {
        this.page = page;
        this.postsSet = new Set();
        this.postsSets = []
    }

    // query查詢字串/forums看板
    async getSearchResultPosts(query = "", forums = "", since = 0, cb) {

        let pageUrl = "";
        if (query != "") {
            pageUrl = `https://www.dcard.tw/search/posts?query=${query}&forums=${forums}&since=${since}`
        } else {
            pageUrl = `https://www.dcard.tw/f/${forums}`
        }


        await navigateToPage(this.page, pageUrl);


        // 等待1秒 等頁面資料載入後滾動
        setTimeout(async() => {
            this.scrollDownToGetPosts(0, cb, query);
        }, 1000)


    }



    // 滾動頁面獲取posts
    async scrollDownToGetPosts(bottomTime = 0, cb, query) {

        // 獲取滑動頁面前的滾動位置
        const prevScrollY = await this.page.evaluate(() => {
            return window.scrollY;
        });

        // 滾動卷軸
        await this.page.evaluate(() => {
            window.scrollTo(window.scrollY, window.scrollY + document.body.scrollHeight / 20);
        });



        // 獲取滑動頁面後的滾動位置
        const scrollY = await this.page.evaluate(() => {
            return window.scrollY;
        });

        await this.getCurrentScreenPosts(query);

        console.log("累計 " + this.postsSet.size + " 筆Posts" + "  " + bottomTime + " " + query);


        if (prevScrollY != scrollY) {
            //滑動前後有改變=不是最底部
            await this.scrollDownToGetPosts(0, cb, query)
        } else if (bottomTime <= 20) {
            // 最底端但滑動前後Set大小在20次以內改變
            bottomTime++;
            await this.scrollDownToGetPosts(bottomTime, cb, query)
        } else {
            // 超過5次一樣，代表最底部且結束
            if (typeof cb === 'function') {
                await cb(); // Assuming cb is an asynchronous function
            }
        }

    }

    async getCurrentScreenPosts(query) {
        const content = await this.page.content(); // 取得新頁面的內容
        const $ = cheerio.load(content);

        // 選擇所有post
        const elementsWithPostDataKey = $('[data-key] a[href*="/f/"][href*="/p/"] ');
        elementsWithPostDataKey.each(async(index, element) => {
            const dataKey = $(element).attr('href');
            this.postsSet.add(query + "," + dataKey);
        });
    }


    // cb : callback for each queries posts
    async getForumPostsByQueries(forum, queries, index = 0, since = 0, cb) {
        if (index >= queries.length) {
            if (typeof cb === 'function') {
                await cb(); // Assuming cb is an asynchronous function
            }
            return;
        }

        const term = queries[index];
        this.getSearchResultPosts(term, forum, since, () => {
            this.postsSets.push(new Set(this.postsSet));
            this.postsSet.clear();
            this.getForumPostsByQueries(forum, queries, index + 1, since, cb); // Recursive call with the next index
        });
    }


    getAllGatherPosts() {
        return this.postsSets;
    }


    clearGatherPosts() {
        this.postsSets = [];
    }



    async getPostContent(href = "/", cb) {

        await navigateToPage(this.page, `https://www.dcard.tw${href}`);
        try {
            await this.page.waitForNavigation();
        } catch (e) {
            if (e instanceof TimeoutError) {
                console.log("TimeoutError")
                await this.page.reload();
            }
        }
        const content = await this.page.content(); // 取得新頁面的內容
        const $ = cheerio.load(content);
        const postContentElements = $('div.d_m9_o2urrm.c1golu5u span');
        let postContent = [];
        postContentElements.each(async(index, element) => {
            let postContentSpan = $(element).text();

            postContent.push(postContentSpan);

            if (index == postContentElements.length - 1) { //最後一筆
                postContent = postContent.join('');
                cb(postContent);
            }
        });
    };

}