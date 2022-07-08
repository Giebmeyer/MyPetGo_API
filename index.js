const quests = require('./Quest.json');
const express = require('express');
const server = express();

server.get('/quest', (require, response) => {
    console.log("Req recebido.");
    return response.json(quests);
});

server.listen(8000, () => {
    console.log("Servidor iniciado!");
})
