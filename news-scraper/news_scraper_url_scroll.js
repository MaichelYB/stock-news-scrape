const puppeteer = require('puppeteer');
const fs = require('node:fs/promises');

var mapURLString = {};

// only get these stock first
var NASDAQ = ["MSFT", "TSLA", "GOOGL", "AMZN", "META"];

(async () => {
    for (let index = 0; index < NASDAQ.length; index++) {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        console.log("CURRENT SCRAPE: " + NASDAQ[index]);
        await page.goto('https://finance.yahoo.com/quote/'+NASDAQ[index]+'/latest-news', { waitUntil: ['domcontentloaded'] });
    
        await page.setViewport({
            width: 1200,
            height: 800
        });

        await autoScroll(page, 50);  // set limit to 50 scrolls
        
        const allInputValues = await page.$$eval('ul.stream-items > li.stream-item.story-item', elements =>
            elements.map(e => e.querySelector("a").href),
        );

        const allInputSummary = await page.$$eval('ul.stream-items > li.stream-item.story-item', elements =>
            elements.map(e => e.querySelector("a > p.clamp").innerText),
        );

        await browser.close();
        mapURLString[NASDAQ[index]] = [allInputValues, allInputSummary];
    }

    try {
        await fs.writeFile('./msgdata.json', JSON.stringify(mapURLString) , 'utf-8'); 
    } catch (err) {
        console.log(err);
    }
})();


async function autoScroll(page, maxScrolls){
    await page.evaluate(async (maxScrolls) => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 1000;
            var scrolls = 0;  // scrolls counter
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                scrolls++;  // increment counter

                // stop scrolling if reached the end or the maximum number of scrolls
                if(totalHeight >= scrollHeight - window.innerHeight || scrolls >= maxScrolls){
                    clearInterval(timer);
                    resolve();
                }
            }, 2000);
        });
    }, maxScrolls);  // pass maxScrolls to the function
}