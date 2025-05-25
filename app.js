const express = require("express");
const app = express();

const exphbs = require("express-handlebars");

const bodyParser = require("body-parser");

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./projetoweb369.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();


const hbs = exphbs.create({
  defaultLayout: "main",
  extname: ".handlebars",
  helpers: {
    ifEquals: function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    }
  }
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.get("/", function(req, res){
    res.render("primeira_pagina")
})

app.get("/consulta", async function(req, res) {
    try {
        const snapshot = await db.collection('agendamentos').get()
        const agendamentos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        res.render("consulta", { post: agendamentos })
    } catch (erro) {
        console.log("Erro ao carregar dados do banco: " + erro)
    }
})

app.get("/editar/:id", async function(req, res) {
    try {
        const doc = await db.collection('agendamentos').doc(req.params.id).get()
        if (doc.exists) {
            res.render("editar", { post: { id: doc.id, ...doc.data() } })
        } else {
            res.send("Documento não encontrado")
        }
    } catch (erro) {
        console.log("Erro ao carregar dados do banco: " + erro)
    }
})

app.get("/excluir/:id", async function(req, res) {
    try {
        await db.collection('agendamentos').doc(req.params.id).delete()
        res.redirect("/consulta")
    } catch (erro) {
        console.log("Erro ao excluir o documento: " + erro)
    }
})

app.post("/cadastrar", function(req, res){
    var result = db.collection('agendamentos').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Added document');
        res.redirect('/')
    })
})

app.post("/atualizar", async function(req, res) {
    try {
        await db.collection('agendamentos').doc(req.body.id).update({
            nome: req.body.nome,
            telefone: req.body.telefone,
            origem: req.body.origem,
            data_contato: req.body.data_contato,
            observacao: req.body.observacao
        })
        res.redirect("/consulta")
    } catch (erro) {
        console.log("Erro ao atualizar o documento: " + erro)
    }
})

app.listen(8081, function(){
    console.log("Servidor ativo!")
})