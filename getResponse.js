import dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { configureRetriever } from "./configureRetriever.js";

export const getResponse = async (input) => {
  const retriever = await configureRetriever();

  const chatModel = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const prompt =
    ChatPromptTemplate.fromTemplate(`Answer the following question based only on the provided context:

<context>
{context}
</context>

Question: {input}`);

  console.log(`Creada la cadena de documentos`);
  const documentChain = await createStuffDocumentsChain({
    llm: chatModel,
    prompt,
  });

  console.log(`Creada la cadena de retrieval`);
  const retrievalChain = await createRetrievalChain({
    combineDocsChain: documentChain,
    retriever,
  });

  console.log(`Invocada la cadena con la pregunta: ${input}`);
  const result = await retrievalChain.invoke({
    input: input,
  });

  return result;
};
