const puppeteer = require("puppeteer");

(async () => {

  // Extract partners on the page, recursively check the next page in the URL pattern
  const extractPartners = async url => {
    
    // Scrape the data we want
    const page = await browser.newPage();
    await page.goto(url);
    const partnersOnPage = await page.evaluate(() =>
      Array.from(document.querySelectorAll("div.book-list-wrapper")).map(compact => ({
        title: compact.querySelector("p.book-title").innerText.trim(),
        logo: compact.querySelector(".book-img img").src
      }))
    );
    await page.close();

    // Recursively scrape the next page
    if (partnersOnPage.length < 1) {
      // Terminate if no partners exist
      return partnersOnPage
    } else {
      // Go fetch the next page ?page=X+1
      const nextPageNumber = parseInt(url.match(/page=(\d+)$/)[1], 10) + 1;
      const nextUrl = `https://www.rokomari.com/search?term=bag%20&page=${nextPageNumber}`;

      return partnersOnPage.concat(await extractPartners(nextUrl))
    }
  };

  const browser = await puppeteer.launch();
  const firstUrl =
    "https://www.rokomari.com/search?term=bag%20&page=1";
  const partners = await extractPartners(firstUrl);

  // Todo: Update database with partners
  console.log(partners);

  await browser.close();

})();