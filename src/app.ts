import express, { Application } from "express";
import mongoose from "mongoose";
import morgan from "morgan"
import 'dotenv/config'
import { index, sign_up } from "./controllers";
import passport, { DoneCallback } from "passport";
import  jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "./user.model";

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

        const secretKey = process.env.TOKEN_SECRET
        if(secretKey){
            passport.use(new Strategy({
                secretOrKey: secretKey,
                issuer: 'localhost',
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                audience: 'current user',
            },async (jwt_payload: JwtPayload, done: DoneCallback) => {
                try {
                    const user = await User.findById(jwt_payload.sub)
    
                    if(user){
                        return done(null, user)
                    } else{
                        return done(null, false)
                    }

                } catch (error) {
                    return done(error, false)
                }
            }))
        }
        app.get('/', index)
        app.post('/sign-up', sign_up)
        app.post('/login', passport.authenticate('jwt', { session: false }))
        

    }).catch(error =>{
        console.error("Could not connect to DB: ", error.message)
    })
} else{
    console.error("Cannot start server: "+
    "DB connection String not available")
}
