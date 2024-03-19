import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import puppeteer from "puppeteer";

export const getDataFromUrl = async (url) => {
  console.log(`Haciendo la llamada a: ${url}`);

  const browser = await puppeteer.launch({
    ignoreDefaultArgs: ["--disable-extensions"], // Aquí se especifica la bandera --disable-extensions
    headless: "new", // Otras opciones de lanzamiento de Puppeteer
  });

  const loader = new PuppeteerWebBaseLoader(url, {
    puppeteer: browser,
    async evaluate(page, browser) {
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

  const data = await loader.load();

  await browser.close();

  return data;
};
