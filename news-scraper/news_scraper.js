const puppeteer = require('puppeteer');
const fs = require('node:fs');

var jsonData = {};
var mapStories = {};

try {
  const data = fs.readFileSync('msgdata.json', 'utf8');
  var jsonData = JSON.parse(data);
} catch (err) {
  console.error(err);
  return;
}

(async () => {
    for (var elem in jsonData) {
        console.log(elem);
        var allStories = [];
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        for (var index in jsonData[elem][0]) {
            url = jsonData[elem][0][index];
            try {
                await page.goto(url, { waitUntil: ['domcontentloaded'] });
    
                const textsFromAllP = await page.$$eval('p', ps => ps.map(p => p.innerText));
                const story = textsFromAllP.join(" ")

                const cleanedText = story
                    .replace(/[^\w\s]/gi, '') // Remove special characters (keeps alphanumeric and spaces)
                    .replace(/\s+/g, ' ')     // Replace multiple spaces with a single space
                    .trim();                  // Remove leading and trailing spaces

                allStories.push(cleanedText);
            } catch (error) {
                continue;
            }
        }
        await browser.close();
        mapStories[elem] = {}
        mapStories[elem]["news"] = allStories;
        mapStories[elem]["summary"] = jsonData[elem][1];
    }

    try {
        await fs.writeFileSync('./story-msg.json', JSON.stringify(mapStories), 'utf-8'); 
    } catch (err) {
        console.log(err);
    }
})();
