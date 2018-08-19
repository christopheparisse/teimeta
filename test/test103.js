const fs = require('fs');
var diff = require('./diff.js');

// From Ben N.
function stripBOM(content) {
  // Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
  // because the buffer-to-string conversion in `fs.readFileSync()`
  // translates it to FEFF, the UTF-16 BOM.
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

console.log('compare open and save of the same XML without changes');
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost/test/test103.html');

  await page.focus('#id4');
  await page.keyboard.type('RUNNING TEST103');
  await page.focus('#id5');
  await page.keyboard.type('TEST103');
  await page.focus('#id17');
  await page.keyboard.type('TEST103');
  await page.focus('#id24');
  await page.keyboard.type('Automatized Test103');
  await page.select('#id25','eng'); // language
  await page.click('#id31'); // element ref
  await page.click('#id32'); // ident
  await page.keyboard.type('CONTENT');
  await page.select('#id34','1');
  await page.select('#id35','unbounded');
  // await page.click('#id38'); // remove element sequence ?
  await page.click('#id15'); // new elementSpec
  await page.focus('#id131');
  await page.keyboard.type('CONTENT');
  await page.focus('#id138');
  await page.keyboard.type('Automatized Test103 Content');
  await page.select('#id139','eng'); // language
  await page.click('#id164'); // text node

  await page.click('button#test103', { button: 'left' });
  await page.pdf({path: 'test/test103.pdf', format: 'A4'});
  var data = await page.$eval('#info', el => el.innerText);
  fs.writeFileSync('test/test103-result.xml', data);
  var original = fs.readFileSync('test/test103.xml').toString();
/*
  original = stripBOM(original).replace(/&#10;/g, '').replace(/&#xA;/g, '');
  data = stripBOM(data).replace(/&#10;/g, '').replace(/&#xA;/g, '');
*/

  original = stripBOM(original).replace(/\n/g, '');
  data = stripBOM(data).replace(/\n/g, '');

  //console.log(original);
  //console.log(data);
  let d = diff(original, data);
  for (i in d) {
    if (d[i][0] !== 0) console.log(d[i]);
  }
  browser.close();
})();
