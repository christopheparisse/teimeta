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

  await page.focus('.UPI-schemaSpec-ident');
  await page.keyboard.type('RUNNING TEST103');
  await page.focus('.UPI-schemaSpec-start');
  await page.keyboard.type('TEST103');
  await page.focus('.UPI-elementSpec-ident');
  await page.keyboard.type('TEST103');
  await page.focus('.UPI-desc-desc');
  await page.keyboard.type('Automatized Test103');

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
