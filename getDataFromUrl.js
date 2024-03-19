import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import { launch as launchPuppeteerCore } from "puppeteer-core";
import puppeteer from "puppeteer";

let chrome = {};
let puppeteerInstance;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = await import("chrome-aws-lambda").then((mod) => mod.default);
  puppeteerInstance = launchPuppeteerCore;
} else {
  puppeteerInstance = puppeteer.launch;
}

export const getDataFromUrl = async (url) => {
  console.log(`Haciendo la llamada a: ${url}`);

  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  const browser = await puppeteerInstance(options);

  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: options,
    async evaluate(page) {
      try {
        await page.goto(url, { waitUntil: "networkidle0" });
        const textContent = await page.evaluate(() => {
          const bodyElement = document.querySelector("body");
          return bodyElement ? bodyElement.textContent : "";
        });
        return textContent || "";
      } catch (error) {
        console.error("Ocurrió un error al cargar la página", error);
        return "";
      }
    },
  });

  const result = await loader.load();
  await browser.close(); // Cerrar el navegador después de usarlo

  return result;
};
