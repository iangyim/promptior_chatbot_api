import express from "express";
import dotenv from "dotenv";
import { getResponse } from "./getResponse.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
