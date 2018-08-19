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
  await page.goto('http://localhost/test/test104.html');

  await page.click('#id2'); // new element
  await page.click('#id2'); // new element
  await page.click('#id2'); // new element

  await page.focus('#id4');
  await page.keyboard.type('TEST104 A');
  await page.focus('#id6');
  await page.keyboard.type('TEST104 B');
  await page.focus('#id8');
  await page.keyboard.type('TEST104 C');
  await page.focus('#id10');
  await page.keyboard.type('TEST104 D');

  await page.click('button#test104', { button: 'left' });
  await page.pdf({path: 'test/test104.pdf', format: 'A4'});
  var data = await page.$eval('#info', el => el.innerText);
  fs.writeFileSync('test/test104-result.xml', data);
  var original = fs.readFileSync('test/test104.xml').toString();
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
