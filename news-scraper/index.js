const puppeteer = require('puppeteer');
const setTimeout = require('node:timers/promises');

function extractItems() {
    /*  For extractedElements, you are selecting the tag and class,
        that holds your desired information,
        then choosing the disired child element you would like to scrape from.
        in this case, you are selecting the
        "<div class=blog-post />" from "<div class=container />" See below: */
    const extractedElements = document.querySelectorAll('ul.pr-feed > li');
    const items = [];
    for (let element of extractedElements) {
        items.push(element.querySelector('h3 > .title').href);
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
      while (true) {
        value = await page.evaluate(extractItems);
        items.push(value);

        const pagination = await page.$$eval('.pagination');
        console.log(pagination.length);
        break;
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
    var i = 0;
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://investing.einnews.com/search/AAPL/?search%5B%5D=news&search%5B%5D=press&order=&search_feed_list=yes&search_market=yes&age=90&search_site=no', { waitUntil: ['domcontentloaded'] });
    
    // if h1 is human checker, click the human checker

    // Extracting a single element using a CSS selector
    const element = await page.$('h1'); // Example selector: h1

    // Extracting and logging the text content of the element
    const elementText = await page.evaluate(element => element.textContent, element);
    if (elementText.includes("you are human")){
      await page.click('a');
    }
    
    await page.waitForSelector('ul.pr-feed');

    const items = await scrapeItems(page, extractItems, 10);

    await page.waitForSelector('.pagination');
    console.log(items);

    // go to the next page
    // Query for an element handle.
    // const element = await page.waitForSelector('div > .pagination');
    // console.log(element)
    // Auto-scroll and extract desired items from the page. Currently set to extract ten items.
    // const items = await scrapeItems(page, extractItems, 10);
    // console.log(items)
    // console.log(items.length)

    await browser.close();
})();