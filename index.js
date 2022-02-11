const express = require("express")
const app = express()
const mongoose = require("mongoose")
const AppointmentService = require("./services/AppointmentService")
const appointmentService = require("./services/AppointmentService")

app.use(express.static("public"))

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.set('view engine','ejs')

mongoose.connect("mongodb://localhost:27017/agendamento",{
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
mongoose.set("useFindAndModify", false)

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/cadastro", (req, res) => {
    res.render("create")
})

app.post("/create", async (req, res) => {

    let status = await appointmentService.Create(
        req.body.name,
        req.body.email,
        req.body.description,
        req.body.cpf,
        req.body.date,
        req.body.time,
    )

    if (status) {
        res.redirect("/")
    } else {
        res.send("Ocorreu uma falha!")
    }
})

app.get("/getcalendar", async (req, res) => {
    const appointments = await AppointmentService.GetAll(false)
    res.json(appointments)
})

app.get("/event/:id", async (req, res) => {
    const appointment = await AppointmentService.GetById(req.params.id)
    res.render("event", { appo: appointment })
})

app.post("/finish", async (req, res) => {
    const id = req.body.id 
    const result = await AppointmentService.Finish(id)
    res.redirect("/")
})

app.get("/list", async(req, res) => {
    //await AppointmentService.Search()
    const appos = await AppointmentService.GetAll(true)
    res.render("list", {appos})
})

app.get("/searchresult", async (req, res) => {
    const appos = await AppointmentService.Search(req.query.search)
    res.render("list", {appos})
})

let pollTime = 1000 * 60 * 5

setInterval(async () => {
    await AppointmentService.SendNotification()
}, pollTime)


app.listen(8080, () => {})