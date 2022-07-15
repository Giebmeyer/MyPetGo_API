const quests = require('./Jsons/Quest.json');
const users = require('./Jsons/Users.json');

const express = require('express');
const { response } = require('express');
const server = express();

const db = require('./Models/database.js');

const Client = require('./Models/Clients');
const User = require('./Models/Users');
const Quest = require('./Models/Quests');
const Quests_Annotation = require('./Models/Quests_Annotation');
const Pet = require('./Models/Pets');
const Andress = require('./Models/Andress');

const nodemailer = require('nodemailer');

let error  = "";


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




server.post('/Logins/:user/:password', (require, response) =>{
    console.log("Post Login Requisitado!");

    const username = require.params.user;
    const password = require.params.password;

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

server.post('/Login/:user/:password', async (require, response) => {
    console.log("Post Login Requisitado!");

    const username = require.params.user;
    const password = require.params.password;
    let user = await User.findAll(  
        {
            where: {
                usuario: username,
                senha: password,
              }
        });
    user = JSON.parse(JSON.stringify(user, null, 2));

    if(user[0]){
        response.json(user[0]);
    }else{
        error = "User not found";
        return response.json(error); 
    }

});





server.post('/Quest_Annotation/:idQuest/:Annotation', async (require, response) => {
    console.log("Post anotação Requisitado!");

    const idQuest = require.params.idQuest;
    const anotationQuest = require.params.Annotation;

    let quest = await Quest.findAll(  
        {
            where: {
                Id: idQuest,
              }
        });

    quest = JSON.parse(JSON.stringify(quest, null, 2));

    if(quest[0]){
        Quests_Annotation.create({"Anotacao": anotationQuest, "QuestId": idQuest})
        return response.json(true);
    }else{
        quest = "Quest not found";
        return response.json(error); 
    }

});





server.get('/quests', (require, response) => {
    console.log("Req. recebido!");
    return response.json(quests);
});

server.get('/quest', async (require, response) => {
    console.log("Req. recebido!");

    let quest = await Quest.findAll();
    let finalQuest = [];
    let andress;
    let annotationsQuest = [];

    for(let i = 1; i <= quest.length; i++){
        if(Quest.findByPk(i, {include: [Pet, Client]})){
            andress = await Andress.findByPk(i, {include: [Client]})
            annotationsQuest = await Quests_Annotation.findAll({
                where:{
                    QuestId: i
                }
            })
            finalQuest.push({"Quest":  await Quest.findByPk(i, {include: [Pet]}),"Endereco": andress, "Anotacoes": annotationsQuest});
            console.log("indice I: ", i, " retorno: ", finalQuest);
        }
    }


    JSON.parse(JSON.stringify(finalQuest, null, 0));

    return response.json(finalQuest);

});





server.put('/quests/StatusModify/:id', (require, response) => {
    
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

server.put('/quest/StatusModify/:id', async (require, response) =>  {
    
    console.log("Put Requisitado!");
    
    const QuestID = require.params.id;
    
    if(QuestID == null || QuestID == ""){
        error = "Quest id null or Empty";
        return response.json(error);
    }else{

        const quest = await Quest.findAll(  
            {
                attributes: [
                    'Id',
                    'Status'
                ],
                where: {
                    Id: QuestID,
                  }
            });

            console.log("Quest ID result: ", quest[0].Id, " Status: ",quest[0].Status);
            if(quest[0]){
                
                if(quest[0].Status == "Coletado"){
                    Quest.update({Status: "Entregue"}, {where: {Id: quest[0].Id}});
                    //sendEmail(quests[index].Responsavel.Email, quests[index].Animal.Nome ,"Coletado", "Entregue");
                }
                if(quest[0].Status == "Aguardando Coleta"){ 
                    Quest.update({Status: "Coletado"}, {where: {Id: quest[0].Id}});
                    //sendEmail(quests[index].Responsavel.Email, quests[index].Animal.Nome ,"Aguardando Coleta", "Coletado");
                }
            }else{
                error = "Nenhum registro encontrado para esse Id";
                return response.json(error);  
            }
    }

});



server.listen(8000, () => {
    console.log("Servidor iniciado!");
})
