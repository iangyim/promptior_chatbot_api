import puppeteer from "puppeteer";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";

let browser;

const setupBrowser = async () => {
  if (process.env.NODE_ENV !== "development") {
    try {
      const chromium = await import("@sparticuz/chromium");
      const puppeteerCore = await import("puppeteer-core");
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath("/opt/chromium"),
        headless: chromium.headless,
      });
      return browser;
    } catch (error) {
      console.error("Error:", error);
    }
  } else {
    try {
      browser = await puppeteer.launch({ headless: "new" });
    } catch (error) {
      console.error("Error:", error);
    }
  }
};

setupBrowser();

const getDataFromUrl = async (url) => {
  try {
    console.log(`Haciendo la llamada a: ${url}`);
    const loader = new PuppeteerWebBaseLoader(url, {
      launchOptions: {
        headless: "new",
      },
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
    return await loader.load();
  } catch (error) {
    console.error("Error en getDataFromUrl:", error);
    throw error;
  }
};

export { getDataFromUrl };
