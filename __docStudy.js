import dotenv from "dotenv";
dotenv.config();

// import { ChatOpenAI } from "@langchain/openai";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { StringOutputParser } from "@langchain/core/output_parsers";

// async function main() {
//   try {
//     // Crea una instancia de la clase ChatOpenAI con la clave de API de OpenAI obtenida de las variables de entorno
//     const chatModel = new ChatOpenAI({
//       openAIApiKey: process.env.OPENAI_API_KEY,
//     });

//     // Crea un prompt de chat utilizando la clase ChatPromptTemplate y un arreglo de mensajes
//     const prompt = ChatPromptTemplate.fromMessages([
//       ["system", "You are a world class technical documentation writer."],
//       ["user", "{input}"],
//     ]);

//     // Crea una instancia de la clase StringOutputParser para analizar la salida del modelo de chat
//     const outputParser = new StringOutputParser();

//     // Crea una cadena de procesamiento de chat conectando el prompt, el modelo de chat y el analizador de salida
//     const llmChain = prompt.pipe(chatModel).pipe(outputParser);

//     // Invoca la cadena de procesamiento de chat con un mensaje de entrada y espera la respuesta
//     const AiMessage = await llmChain.invoke({
//       input: "what is LangSmith?",
//     });

//     console.log(AiMessage);
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

// main();

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

// Crear una instancia del modelo de lenguaje ChatOpenAI con la clave de API de OpenAI
const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Cargar datos desde una página web
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";

const loader = new CheerioWebBaseLoader(
  "https://docs.smith.langchain.com/user_guide"
);

const docs = await loader.load();

console.log(docs);

// console.log(docs.length);
// console.log(docs[0].pageContent.length);

// Dividir los documentos en partes más pequeñas
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const splitter = new RecursiveCharacterTextSplitter();

const splitDocs = await splitter.splitDocuments(docs);

// console.log(splitDocs);

// console.log(splitDocs.length);
// console.log(splitDocs[0].pageContent.length);

// Crear vectores de embeddings a partir de los documentos divididos
//El contenido de la data lo traduce a un array de vectores
// por ej [... {
//   content: "your application progresses through the beta...",
//         embedding: [Array],
//         metadata: [Object]
//       }]
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings();

// Crear un vectorstore de memoria desde los documentos y los embeddings
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const vectorstore = await MemoryVectorStore.fromDocuments(
  splitDocs,
  embeddings
);

// console.log(vectorstore);

// Crear una plantilla de intercambio de mensajes para el modelo de lenguaje
const prompt =
  ChatPromptTemplate.fromTemplate(`Answer the following question based only on the provided context:

<context>
{context}
</context>

Question: {input}`);

// Crear una cadena de procesamiento de documentos
const documentChain = await createStuffDocumentsChain({
  llm: chatModel,
  prompt,
});

//Si lo hacemos de manera manual le podríamos pasar en el context documentos directamente
// import { Document } from "@langchain/core/documents";

// await documentChain.invoke({
//   input: "what is LangSmith?",
//   context: [
//     new Document({
//       pageContent:
//         "LangSmith is a platform for building production-grade LLM applications.",
//     }),
//   ],
// });

// console.log(AiMessage);

import { createRetrievalChain } from "langchain/chains/retrieval";

// Crear una cadena de recuperación usando el vectorstore y la cadena de documentos
const retriever = vectorstore.asRetriever();
const retrievalChain = await createRetrievalChain({
  combineDocsChain: documentChain,
  retriever,
});

// Invocar la cadena de recuperación con una pregunta y obtener la respuesta
const result = await retrievalChain.invoke({
  input: "what is LangSmith?",
});

// console.log(result.answer);
// LangSmith is a platform for LLM (Large Language Model) application development, monitoring, and testing. It supports workflows for creating datasets, running tests, monitoring key metrics, debugging issues, and conducting A/B testing for applications.

//----------------------------
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { MessagesPlaceholder } from "@langchain/core/prompts";

// // 1. CREAR UNA PLANTILLA para generar prompts conscientes del historial de conversaciones
// const historyAwarePrompt = ChatPromptTemplate.fromMessages([
//   // Utiliza el historial de chat más reciente como contexto
//   new MessagesPlaceholder("chat_history"),
//   // Agrega la entrada del usuario como parte del prompt
//   ["user", "{input}"],
//   // Proporciona una pregunta para generar una consulta de búsqueda relevante al historial de conversaciones
//   [
//     "user",
//     "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
//   ],
// ]);

// // 2. CREAR UN RETRIEVER consciente del historial utilizando un modelo de lenguaje grande (LLM)
// const historyAwareRetrieverChain = await createHistoryAwareRetriever({
//   llm: chatModel,
//   retriever,
//   // Agregar la plantilla histórico-consciente a cada prompt
//   rephrasePrompt: historyAwarePrompt,
// });

// import { HumanMessage, AIMessage } from "@langchain/core/messages";

// //Simular una situación donde el usuario está preguntando acerca de una pregunta de seguimiento
// // const chatHistory = [
// //   new HumanMessage("Can LangSmith help test my LLM applications?"),
// //   new AIMessage("Yes!"),
// // ];

// // await historyAwareRetrieverChain.invoke({
// //   chat_history: chatHistory,
// //   input: "Tell me how!",
// // });

// // 3. CREAR UN PROMPT para la recuperación consciente del historial
// const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
//   // Proporciona un mensaje del sistema para responder las preguntas del usuario basado en el contexto del historial
//   [
//     "system",
//     "Answer the user's questions based on the below context:\n\n{context}",
//   ],
//   // Utiliza el historial de chat como contexto
//   new MessagesPlaceholder("chat_history"),
//   // Agrega la entrada del usuario como parte del prompt
//   ["user", "{input}"],
// ]);

// // 4. CREAR UNA CADENA DE COMBINACION DE DOCUMENTOS consciente del historial
// const historyAwareCombineDocsChain = await createStuffDocumentsChain({
//   llm: chatModel,
//   prompt: historyAwareRetrievalPrompt,
// });

// // 5. CREAR UNA CADENA DE RECUPERACION CONVERSACIONAL que utiliza el retriever y la cadena de documentos conscientes del historial
// const conversationalRetrievalChain = await createRetrievalChain({
//   retriever: historyAwareRetrieverChain,
//   combineDocsChain: historyAwareCombineDocsChain,
// });

// // 6. INVOCAR LA CADENA DE RECUPERACION CONVERSACIONAL con un contexto de historial y una pregunta
// const result2 = await conversationalRetrievalChain.invoke({
//   chat_history: [
//     new HumanMessage("Can LangSmith help test my LLM applications?"),
//     new AIMessage("Yes!"),
//   ],
//   input: "tell me how",
// });

// // Imprimir la respuesta obtenida
// console.log(result2.answer);

// LangSmith allows developers to create datasets of inputs and reference outputs for their LLM applications. These test cases can be uploaded, created on-the-fly, o
// r exported from application traces. You can run tests on your LLM applications using these datasets and even perform custom evaluations to score the test results.
//  This helps ensure that your LLM application is delivering desirable results at scale.

//--------------------------
//**AGENT
// One of the first things to do when building an agent is to decide what tools it should have access to. For this example, we will give the agent access two tools:
// 1. The retriever we just created. This will let it easily answer questions about LangSmith
// 2. A search tool. This will let it easily answer questions that require up to date information.

import { createRetrieverTool } from "langchain/tools/retriever";

const retrieverTool = await createRetrieverTool(retriever, {
  name: "langsmith_search",
  description:
    "Search for information about LangSmith. For any questions about LangSmith, you must use this tool!",
});

export const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

const searchTool = new TavilySearchResults();

const tools = [retrieverTool, searchTool];

import { pull } from "langchain/hub";
import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";

// Get the prompt to use - you can modify this!
// If you want to see the prompt in full, you can at:
// https://smith.langchain.com/hub/hwchase17/openai-functions-agent
const agentPrompt = await pull("hwchase17/openai-functions-agent");

const agentModel = new ChatOpenAI({
  modelName: "gpt-3.5-turbo-1106",
  temperature: 0,
});

const agent = await createOpenAIFunctionsAgent({
  llm: agentModel,
  tools,
  prompt: agentPrompt,
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
  verbose: true,
});

const agentResult = await agentExecutor.invoke({
  input: "how can LangSmith help with testing?",
});

// console.log(agentResult.output);

const agentResult2 = await agentExecutor.invoke({
  input: "what is the weather in SF?",
});

// console.log(agentResult2.output);
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const agentResult3 = await agentExecutor.invoke({
  chat_history: [
    new HumanMessage("Can LangSmith help test my LLM applications?"),
    new AIMessage("Yes!"),
  ],
  input: "Tell me how",
});

console.log(agentResult3.output);
