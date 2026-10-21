module.exports.run = async (page, base, shot) => {
  const out = [];
  await page.waitForSelector('.day', {timeout: 8000});
  const days = await page.$$eval('.day', r => r.length);
  out.push(['5 day cards', days === 5]);
  const acts = await page.$$eval('.day.open .act', r => r.length);
  out.push(['day 1 acts: ' + acts, acts >= 2 && acts <= 4]);
  const total = await page.$$eval('.brow', r => r[r.length-1].textContent);
  out.push(['budget total: ' + total, /Estimated total/.test(total)]);
  const pack = await page.$$eval('.pack', r => r.length);
  out.push(['packing items: ' + pack, pack >= 10]);
  // toggle a packing item
  await page.click('.pack');
  const pc = await page.$eval('#packCount', e => e.textContent);
  out.push(['pack toggle: ' + pc, /1 \//.test(pc)]);
  // expand day 2
  await page.$$eval('.day-head', h => h[1].click());
  await new Promise(r=>setTimeout(r,300));
  const open2 = await page.$$eval('.day.open', r => r.length);
  out.push(['day 2 expands', open2 === 2]);
  // change destination
  await page.select('#dest', '6');
  await page.click('#plan');
  await new Promise(r=>setTimeout(r,300));
  const meta = await page.$eval('#tripMeta', e => e.textContent);
  out.push(['dest switch: ' + meta.slice(0,20), /Paris/.test(meta)]);
  if (shot) await page.screenshot({path: shot});
  return out;
};
