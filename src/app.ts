import express, { Application } from "express";
import mongoose from "mongoose";
import morgan from "morgan"
import 'dotenv/config'
import * as controller from "./controllers";
import passport from "passport";
import { configAuth } from "./auth";


const app: Application = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(morgan('dev'))
const MONGODB_URI = process.env.MONGODB_URI
if(MONGODB_URI){

    mongoose.connect(MONGODB_URI).then(result =>{
        console.log("Connected to DB")

        configAuth()
        app.listen(4800, () =>{
            console.log("Listening on: http://localhost:4800")
        })

        app.get('/', controller.index)
        app.post('/sign-up', controller.sign_up)
        app.get('/get-key', controller.issueAuthorizationKey)
        app.post('/login', passport.authenticate('jwt', { session: false }), 
        (req, res) =>{
            res.json({msg: 'Authorised'})
        })
        
        app.get('/profile/:userId', 
        passport.authenticate('jwt', { session: false}),
        controller.getProfile )

    }).catch(error =>{
        console.error("Could not connect to DB: ", error.message)
    })

} else{
    console.error("Cannot start server: "+
    "DB connection String not available")
}
