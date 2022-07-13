const quests = require('./Jsons/Quest.json');
const users = require('./Jsons/Users.json');
const express = require('express');
const { response } = require('express');
const server = express();
let error  = "";


var nodemailer = require('nodemailer');

function sendEmail(emailTo, petName, oldStatus, newStatus){
    var remetente = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "aa0d4e8d7bde4c",
          pass: "e4c348b6c243e6"
        }
      });
      
      var emailASerEnviado = {
      
              from: "ESPy.EnviaEmail@gmail.com",
              
              to: emailTo,
              
              subject: "MyPetGo - Alteração de Status",
              
              text: `Olá!\n\nVenho aqui avisar que o status da viagem do seu bichinho ${petName} acabou de atualizar de "${oldStatus}" para "${newStatus}"`,
              
              };

    remetente.sendMail(emailASerEnviado, function(error){

        if (error) {
                
             console.log(error);
                
        } else {
                
            console.log("Email enviado com sucesso.");
                
            }
                
        });
            
}

server.post('/Login/:user/:password', (require, response) =>{
    console.log("Post Login Requisitado!");

    const username = require.params.user;
    const password = require.params.password;

    console.log(username, password);

    if(username == null && username == "" & password == null && password == ""){
        error = "Username or Password is null or Empty";
        return response.json(error); 
    }else{
        let index = users.findIndex(user => user.Usuario == username && user.Senha == password);
        if( index >= 0 && index != null && index != undefined){
            return response.json(users[index]);
        }else{
            error = "User not found";
            return response.json(error); 
        }
    }
});

server.get('/quest', (require, response) => {
    console.log("Req. recebido!");
    return response.json(quests);
});

server.put('/quest/StatusModify/:id', (require, response) => {
    
    console.log("Put Requisitado!");
    
    const QuestID = require.params.id;

    if(QuestID == null || QuestID == ""){
        error = "Quest id null or Empty";
        return response.json("Return: ", error);
    }else{

       let index = quests.findIndex(quest => quest.id == QuestID)

            if(index != null){
                if(quests[index].Tarefa.Status == "Coletado"){
                    quests[index].Tarefa.Status = "Entregue";
                    sendEmail(quests[index].Responsavel.Email, quests[index].Animal.Nome ,"Coletado", "Entregue");
                }
                if(quests[index].Tarefa.Status == "Aguardando Coleta"){ 
                    quests[index].Tarefa.Status = "Coletado";
                    sendEmail(quests[index].Responsavel.Email, quests[index].Animal.Nome ,"Aguardando Coleta", "Coletado");
                }
                console.log(quests[index].Tarefa.Status);
            }else{
                console.log("Index inválido: ", index);
            }
            


        return response.json(quests);
    }

});

server.listen(8000, () => {
    console.log("Servidor iniciado!");
})
