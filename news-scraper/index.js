const puppeteer = require('puppeteer');
const fs = require('node:fs/promises');

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

(async () => {
    var allItem = [];
    var i = 0;
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto('https://investing.einnews.com/search/AAPL/?search%5B%5D=news&search%5B%5D=press&order=date&search_feed_list=yes&search_market=yes&age=90', { waitUntil: ['domcontentloaded'] });
    
    // if h1 is human checker, click the human checker

    // Extracting a single element using a CSS selector
    const element = await page.$('h1'); // Example selector: h1

    // Extracting and logging the text content of the element
    const elementText = await page.evaluate(element => element.textContent, element);
    if (elementText.includes("you are human")){
      await page.click('a');
    }
    
    await page.waitForSelector('ul.pr-feed');
    
    const items = await page.evaluate(extractItems);
    await allItem.push(items);

    // go to the next page
    // Query for an element handle.
    for (let index = 1; index < 10; index++) {
      const page = await browser.newPage();
      var baseURL = "https://investing.einnews.com"
      var searchURL = "/search/AAPL/?search%5B%5D=news&search%5B%5D=press&order=date&search_feed_list=yes&search_market=yes&age=90&page=" + (index+1);
      
      await page.goto(baseURL + searchURL, { waitUntil: ['domcontentloaded'] });
      await page.waitForSelector('ul.pr-feed');

      const items = await page.evaluate(extractItems);
      await allItem.push(items);
    }

    await browser.close();
    try {
      await fs.writeFile('test.txt', allItem.toString());
    } catch (err) {
      console.log(err);
    }
})();