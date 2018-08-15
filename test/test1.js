const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost/teimeta/teimeta.html');
  await page.pdf({path: 'hn.pdf', format: 'A4'});

  browser.close();
})();

/*
require('../temp-page/lib.js');

readXmlOddCss('http://localhost/test2.xml', 'http://localhost/media.odd', null,
  function (h) {
    var el = document.getElementById('teimeta');
    el.innerHTML = h;
    finalize();
  });

function saveTheData() {
  console.log(generateXml());
}

setTimeout(saveTheData, 4000);

*/