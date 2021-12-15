const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const sessions = require("express-session");
const { render } = require("ejs");
const app = express();
const PORT = process.env.PORT || 3000;
const oneDay = 1000 * 60 * 60 * 24;//milissegundos
const client = require("./db");

const db = client.db("ssvp");
const doacaocollection = db.collection("doacao");
const logincollection = db.collection("login");

app.use(sessions({
    secret: "thisismysecretkeyfhrg84",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(express.static(__dirname));

app.use(cookieParser());

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

var session;

app.set('views', './views')
app.set("view engine", "ejs");

app.get("/", function (req, res) {
    session = req.session;

    if (session.userid) {
        res.send("Bem vindo a página da SSVP de Porto Seguro!! <a href = \'/logout'> clique para logar </a>");
    }
    else {
        res.render("home");
    }
});
app.get("/cadastrologin", function (req, res) {
    res.render("cadastrologin");
});

app.post("/listone", function (req, res) {
    logincollection.findOne({ email: req.body.email }, function (err, result) {
        if (err) {
            return console.log(err)

        }
        else {
            if (result != null) {
                res.send("email já cadastrado")
            }
            else {
                logincollection.insertOne(req.body).then(result => {
                    console.log(result)
                    console.log(req.body)
                    res.render("cadastrologin");
                })
                    .catch(error => console.error(error))
            }
        }
    })
});


app.get("/listone", (req, res) => {
    var cursor = logincollection.find().toArray(function (err, result) {
        if (err) {
            return console.log(err)
        } else {
            console.log(result)

            res.render("listone", { login: result })
        }
    })
});

app.post("/deletelogin", (req, res) => {
    logincollection.deleteOne(req.body).then(result => {
        console.log(result)
        res.redirect("/listone")
    })
        .catch(error => console.error(error))
});

app.post("/updatelogin", (req, res) => {
    logincollection.findOneAndUpdate({ email: req.body.email }, {
        $set:
            ( { senha: req.body.senha })
    },
        { upsert: true })
        .then(result => res.json(req.body))
        .catch(error => console.error(error))
});


const cargoconfrade = "confrade";

app.post("/cadastrodoacao", function (req, res) {
    logincollection.findOne({ email: req.body.email }, function (err, result) {
        if (err) {
            throw err
        }

        else {
            var senhaconfrade = result.senha;
            if (req.body.senha == senhaconfrade) {
                if (result.cargo != cargoconfrade) {
                    session = req.session;
                    session.userid = req.body.email;
                    res.render("cadastrodoacao")
                }
                else {
                    session = req.session;
                    session.userid = req.body.email;
                    res.redirect("listadoacoes")
                }
            }

            else {
                res.send(" senha invalida");
            }

        }

    });
});


app.post("/listadoacoes", (req, res) => {
    doacaocollection.findOne({ confrade: req.body.confrade }, function (err, result) {
        if (err) {
            return console.log(err)

        }
        else {
            if (result != null && result.conferencia == req.body.conferencia) {
                res.send("email já cadastrado")
            }

            else {
                doacaocollection.insertOne(req.body).then(result => {
                    console.log(result)
                    console.log(req.body)
                    res.redirect("/listadoacoes")
                })
                    .catch(error => console.error(error))
            }
        }
    })
});

app.post("/delete", (req, res) => {
    doacaocollection.deleteOne(req.body).then(result => {
        console.log(result)
        res.redirect("/listadoacoes")
    })
        .catch(error => console.error(error))
});

app.get("/listadoacoes", (req, res) => {
    var cursor = doacaocollection.find().toArray(function (err, result) {
        if (err) {
            return console.log(err)
        } else {
            console.log(result)
            res.render("listadoacoes", { doacao: result })
        }
    })
});

app.post("/update", (req, res) => {
    doacaocollection.findOneAndUpdate({ confrade: req.body.confrade }, {
        $set:
            { conferencia: req.body.conferencia }
    },
        { upsert: true })
        .then(result => res.json(req.body))
        .catch(error => console.error(error))
});

app.get("/logout", function (req, res) {
    req.session.destroy()
    res.redirect("/")
});

app.listen(PORT, function () {
    console.log(" servidor rodando na porta", { PORT })
});






