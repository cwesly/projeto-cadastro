const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const path = require("path");
const { log } = require("console");

const app = express();
const port = 3000;

// Configuração do MySQL
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "cadastro_pessoas",
};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

//Rotas
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/consulta", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "consulta.html"));
});

app.get("/editar", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "editar.html"));
});

//Rota para cadastrar pessoa (POST)
app.post("/cadastrar", async (req, res) => {
  const {
    nome,
    endereco,
    sexo,
    data_nascimento,
    cpf,
    telefone,
    email,
    aceitou_termos,
  } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      `INSERT INTO pessoa (nome, endereco, sexo, data_nascimento, cpf, telefone, email, aceitou_termos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome,
        endereco,
        sexo,
        data_nascimento,
        cpf,
        telefone,
        email,
        aceitou_termos === "on",
      ]
    );
    await connection.end();
    res.redirect("/consulta");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao cadastrar pessoa.");
  }
});

//Rota para buscar pessoas(API)
app.get("/api/pessoa", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM pessoa");
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar pessoas." });
  }
});

//Rota para buscar dados de uma pessoa(API)
app.get("/api/pessoa/:id", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM pessoa WHERE id = ?",
      [req.params.id]
    );
    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ error: "Pessoa não encontrada." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar pessoas." });
  }
});

//Rota para atualizar os dados de uma pessoa(POST)
app.post("/atualizar/:id", async (req, res) => {
    console.log('Corpo da Requisição: ', req.body);
    
    try {
        const {
            nome,
            endereco,
            sexo,
            data_nascimento,
            cpf,
            telefone,
            email,
            aceitou_termos,
        } = req.body;
        const id = req.params.id;

        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
        `UPDATE pessoa 
                SET nome = ?, endereco = ?, sexo = ?, data_nascimento = ?, cpf = ?, telefone = ?, email = ?, aceitou_termos = ? 
                WHERE id = ?`,
        [
            nome,
            endereco,
            sexo,
            data_nascimento,
            cpf,
            telefone,
            email,
            aceitou_termos,
            id,
        ]
        );
        await connection.end();
        res.status(200).json({success: true});

    } catch (error) {
        console.error(`Erro na atualização: ${error}`);
        res.status(500).json({ error: "Erro ao atualizar cadastro." });
    }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
