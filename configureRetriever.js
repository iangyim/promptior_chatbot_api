import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { getDataFromUrl } from "./getDataFromUrl.js";

export const configureRetriever = async () => {
  const urls = [
    "https://www.promptior.ai/services",
    "https://www.promptior.ai/about",
  ];

  const allDocs = await Promise.all(urls.map((url) => getDataFromUrl(url)));
  const splitter = new RecursiveCharacterTextSplitter();
  const allSplitDocs = await Promise.all(
    allDocs.map((docs) => splitter.splitDocuments(docs))
  );

  const allEmbeddings = new OpenAIEmbeddings();
  const vectorstore = await MemoryVectorStore.fromDocuments(
    allSplitDocs.flat(),
    allEmbeddings
  );

  console.log(`Configurado el retriever`);
  return vectorstore.asRetriever();
};
