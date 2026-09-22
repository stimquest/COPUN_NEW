const { chromium } = require('playwright');
const fs = require('node:fs');
(async () => {
    const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    fs.mkdirSync('tmp/ui-review', { recursive: true });
    for (const screen of ['home', 'formation', 'journey', 'lesson', 'carnet']) {
        await page.goto('http://localhost:3000/login/preview-ui?screen=' + screen, { waitUntil: 'networkidle' });
        await page.screenshot({ path: `tmp/ui-review/${screen}.png`, fullPage: true });
        console.log(screen, await page.evaluate(() => ({ width: innerWidth, contentWidth: document.documentElement.scrollWidth, h1: document.querySelector('h1')?.textContent })));
    }
    await page.goto('http://localhost:3000/login/preview-ui?screen=formation', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /Quoi dire/ }).click();
    await page.screenshot({ path: 'tmp/ui-review/formation-open.png', fullPage: true });
    await page.goto('http://localhost:3000/login/preview-ui?screen=lesson', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Algues', exact: true }).click();
    await page.getByRole('button', { name: 'Explorer la scène' }).click();
    await page.screenshot({ path: 'tmp/ui-review/lesson-repere.png', fullPage: true });
    await page.setViewportSize({ width: 320, height: 740 });
    for (const screen of ['home', 'formation', 'journey', 'lesson']) {
        await page.goto('http://localhost:3000/login/preview-ui?screen=' + screen, { waitUntil: 'networkidle' });
        console.log('small', screen, await page.evaluate(() => ({ width: innerWidth, contentWidth: document.documentElement.scrollWidth })));
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:3000/login/preview-ui?screen=home', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'tmp/ui-review/home-desktop.png', fullPage: true });
    console.log('errors', errors);
    await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
