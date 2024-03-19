import { PlaywrightWebBaseLoader } from "langchain/document_loaders/web/playwright";

export const getDataFromUrl = async (url) => {
  console.log(`Haciendo la llamada a: ${url}`);

  const loader = new PlaywrightWebBaseLoader(url, {
    launchOptions: {
      headless: true,
    },
    gotoOptions: {
      waitUntil: "networkidle",
    },
    async evaluate(page, browser, response) {
      try {
        await page.goto(url, { waitUntil: "networkidle0" });
        const textContent = await page.evaluate(() => {
          const bodyElement = document.querySelector("body");
          return bodyElement ? bodyElement.textContent : "";
        });
        return textContent || "";
      } catch (error) {
        console.error("Ocurrió un error al cargar la página", error);
        await browser.close();
        return "";
      }
    },
  });

  return await loader.load();
};
