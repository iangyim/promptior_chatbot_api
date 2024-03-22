import dotenv from "dotenv";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import puppeteer from "puppeteer";

dotenv.config();

export const getDataFromUrl = async (url) => {
  console.log(`Haciendo la llamada a: ${url}`);

  let browser;
  try {
    // Configuración del navegador
    browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
      headless: "new",
    });

    // Configuración del loader
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
          return textContent || "";
        } catch (error) {
          console.error("Ocurrió un error al cargar la página", error);
          return "";
        }
      },
      browser, // Pasar el navegador al loader
    });

    // Cargar datos
    return await loader.load();
  } catch (error) {
    console.error("Ocurrió un error al iniciar el navegador", error);
    return "";
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
