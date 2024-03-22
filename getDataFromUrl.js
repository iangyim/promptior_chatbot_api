import dotenv from "dotenv";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";

dotenv.config();
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
        return ""; // Se debe retornar un valor en caso de error para evitar errores de promesa no manejada
      }
    },
  });

  return await loader.load();
};
