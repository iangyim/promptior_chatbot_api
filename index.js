import express from "express";
import dotenv from "dotenv";
import { getResponse } from "./getResponse.js";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

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
app.use(cors());

app.post("/promptior-chatbot", async (req, res) => {
  const { input } = req.body;
  if (!input) {
    return res
      .status(400)
      .json({ error: "Se requiere un input en el cuerpo de la solicitud." });
  }

  try {
    const resultado = await getResponse(input);
    return res.status(200).json({ resultado });
  } catch (error) {
    console.error("Error al obtener la respuesta:", error);
    return res
      .status(500)
      .json({ error: "Ocurrió un error al procesar la pregunta." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
