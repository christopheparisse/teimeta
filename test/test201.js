const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost/temp-page/teimeta.html');
  await page.pdf({path: 'test201.pdf', format: 'A4'});

  browser.close();
})();