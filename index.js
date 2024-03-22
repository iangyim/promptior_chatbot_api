import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { getResponse } from "./getResponse.js";

dotenv.config();
const app = express();
const PORT = process.env.APP_PORT || 3000;

app.use((req, res, next) => {
  // Configurar los encabezados CORS adecuados
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use(express.json());
app.use(express.static("public"));
app.use(cors());

app.post("/promptior-chatbot", async (req, res) => {
  const { input } = req.body;
  if (!input) {
    return res
      .status(400)
      .json({ error: "Se requiere un input en el cuerpo de la solicitud." });
  }

  try {
    const result = await getResponse(input);

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Error al obtener la respuesta:", error);
    return res
      .status(500)
      .json({ error: "Ocurrió un error al procesar la pregunta." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
