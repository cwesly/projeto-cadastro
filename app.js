const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Configuração do MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'cadastro_pessoas'
}

// Middleware
app.use(bodyParser.urlencoded({extended: true }));
app.use(express.static('public'));

//Rotas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/consulta', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'consulta.html'));
});

//Rota para cadastrar pessoa (POST)
app.post('/cadastrar', async (req, res) => {
    const { nome, endereco, sexo, data_nascimento, cpf, telefone, email, aceitou_termos} = req.body;
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            `INSERT INTO pessoa (nome, endereco, sexo, data_nascimento, cpf, telefone, email, aceitou_termos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nome, endereco, sexo, data_nascimento, cpf, telefone, email, aceitou_termos === 'on']
        );
        await connection.end();
        res.redirect('/consulta');
    } catch (error){
        console.error(error);
        res.status(500).send('Erro ao cadastrar pessoa.');
    }
});

//Rota para buscar pessoas(API)
app.get('/api/pessoa', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM pessoa');
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({error:'Erro ao buscar pessoas.'});
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});