const appointment = require("../models/Appointment")
const mongoose = require("mongoose")
const AppointmentFactory = require("../factories/AppointmentFactory")
const mailer = require("nodemailer")

const Appo = mongoose.model("Appointment", appointment)

class AppointmentService {

    async Create(name, email, description, cpf, date, time) {
        const newAppo = new Appo({
            name: name,
            email: email,
            description: description,
            cpf: cpf,
            date: date,
            time: time,
            finished: false,
            notified: false
        })

        try {
            await newAppo.save()
            return true
        } catch (error) {
            console.log(error)
            return false
        }        
    }

    async GetAll(showFinished) {

        if (showFinished) {
            return await Appo.find()
        } else {
            const appos = await Appo.find({'finished': false})
            let appointments = []

            appos.forEach(appointment => {
                if (appointment.date !== undefined) {
                    appointments.push(AppointmentFactory.Build(appointment))
                }                
            });

            return appointments
        }
    }

    async GetById(id) {
        try {
            const event = await Appo.findOne({ '_id': id})
            return event
        } catch (error) {
            console.log(error)
        }        
    }

    async Finish(id) {
        try {
            await Appo.findByIdAndUpdate(id, {finished: true})
            return true
        } catch (error) {
            console.log(error)
            return false
        }        
    }

    async Search(query) {
        try {
            const appos = await Appo.find().or([{email: query}, {cpf: query}])
            return appos
        } catch (error) {
            console.log(error)
            return []
        }
    }

    async SendNotification() {
        let appos = await this.GetAll(false)

        let transporter = mailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 25,
            auth: {
                user: "",
                pass: ""
            } 
        })

        appos.forEach(async appo => {
            const date = appo.start.getTime()
            const hour = 1000 * 60 * 60
            const gap = date - Date.now()
            
            if (gap <= hour) {
                if(!appo.notified) {

                    await Appo.findByIdAndUpdate(appo.id, { notified: true })

                    transporter.sendMail({
                        from: "Alexander Alves <aeca@fulldevstacks.com.br>",
                        to: appo.email,
                        subject: "Sua consulta vai acontecer em breve.",
                        text: "Conteúdo do E-mail! Sua consulta vai acontecer em uma hora."
                    }).then(() => {

                    }).catch(error => {
                        console.log(error)
                    }) 
                }  
            }
        })
    }
}

module.exports = new AppointmentService()