import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import puppeteer from "puppeteer";

export const getDataFromUrl = async (url) => {
  console.log(`Haciendo la llamada a: ${url}`);

  const browser = await puppeteer.launch({
    headless: "new", // Establece "headless" a true para ejecutar en modo headless
  });

  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      browser, // Pasa el objeto del navegador Puppeteer al cargador
    },
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
        await browser.close();
        return "";
      }
    },
  });

  const data = await loader.load();

  await browser.close(); // Cierra el navegador después de cargar los datos

  return data;
};
