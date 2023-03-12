const path = require('path')
const express = require('express')

const db = require('./db/db')
const routes = require('./routes/routes')
require('./middlewares/auth')
require('./middlewares/updateDb')


const app = express()

db()


app.use("/public", express.static(path.join(process.cwd(), "public")))
app.set("view engine", "ejs")
app.use(express.json())
app.use(routes)
app.listen(8080, () => console.log("Je tourne sur le port 8080"))
