import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import chromium from "chrome-aws-lambda"; // Assuming you're using chrome-aws-lambda for Puppeteer

export const getDataFromUrl = async (url) => {
  console.log(`Haciendo la llamada a: ${url}`);

  let result = null;
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

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

    result = await loader.load();
  } catch (error) {
    console.error("Ocurrió un error al cargar la página", error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return result || "";
};
