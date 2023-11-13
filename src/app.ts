import express, { Application } from "express";
import mongoose from "mongoose";
import morgan from "morgan"
import 'dotenv/config'
import { index, sign_up } from "./controllers";
const app: Application = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(morgan('dev'))
const MONGODB_URI = process.env.MONGODB_URI
if(MONGODB_URI){

    mongoose.connect(MONGODB_URI).then(result =>{
        console.log("Connected to DB")

        app.listen(4800, () =>{
            console.log("Listening on: http://localhost:4800")
        })

        app.get('/', index)
        app.post('/sign-up', sign_up)
        

    }).catch(error =>{
        console.error("Could not connect to DB: ", error.message)
    })
} else{
    console.error("Cannot start server: "+
    "DB connection String not available")
}
