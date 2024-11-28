const express = require("express");
const cors = require("cors");
const app = express();

// Use o middleware CORS
app.use(cors());

// ou, para configurações específicas de CORS:
app.use(
  cors({
    origin: "http://example.com", // Permite apenas essa origem
    methods: ["GET", "POST"],
  })
);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
