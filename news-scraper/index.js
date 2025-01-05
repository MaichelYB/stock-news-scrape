const puppeteer = require('puppeteer');
const setTimeout = require('node:timers/promises');

function extractItems() {
    /*  For extractedElements, you are selecting the tag and class,
        that holds your desired information,
        then choosing the disired child element you would like to scrape from.
        in this case, you are selecting the
        "<div class=blog-post />" from "<div class=container />" See below: */
    const extractedElements = document.querySelectorAll('ul.stream-items > li.stream-item.story-item');
    const items = [];
    for (let element of extractedElements) {
        items.push(element.querySelector('.subtle-link').href);
    }

    console.log(items)
    return items;
}

async function scrapeItems(
    page,
    extractItems,
    itemCount,
    scrollDelay = 8000,
  ) {
    let items = [];
    try {
      let previousHeight;
      while (items.length < itemCount) {
        items = await page.evaluate(extractItems);
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await page.waitForNetworkIdle();
      }
    } catch(e) {
        console.log(e);
        
    }
    return items;
}

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://finance.yahoo.com/quote/AAPL/latest-news/', { waitUntil: ['domcontentloaded'] });
    // Auto-scroll and extract desired items from the page. Currently set to extract ten items.
    const items = await scrapeItems(page, extractItems, 10);
    console.log(items)
    console.log(items.length)

    await browser.close();
})();