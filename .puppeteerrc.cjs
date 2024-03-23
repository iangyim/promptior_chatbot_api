const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

exports.handler = async (event) => {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            executablePath: await chromium.executablePath,
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            headless: chromium.headless,
        });

        // Your Puppeteer code here
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
};
