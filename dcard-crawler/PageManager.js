import puppeteer from 'puppeteer';


export async function newBrowser(headless) {
    const browser = await puppeteer.launch({ headless: headless }); // 啟動瀏覽器，headless 設定為 false 可以看到瀏覽器運作的情況，true 為無頭瀏覽器
    return browser;
}



export async function newPage(browser) {

    const page = await browser.newPage();

    return page;
}




export async function navigateToPage(page, url) {
    await page.goto(url);
}