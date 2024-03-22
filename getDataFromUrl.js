import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";

export const getDataFromUrl = async (url) => {
  console.log(`Haciendo la llamada a: ${url}`);

  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: "new",
    },
    async evaluate(page, browser) {
      try {
        await page.goto(url, { waitUntil: "networkidle0" });
        const textContent = await page.evaluate(() => {
          const bodyElement = document.querySelector("body");
          return bodyElement ? bodyElement.textContent : "";
        });
        await browser.close();
        return textContent || "";
      } catch (error) {
        console.error("Ocurrió un error al cargar la página", error);
        await browser.close();
        return;
      }
    },
  });

  return await loader.load();
};
