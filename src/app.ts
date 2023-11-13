import express, { Application, NextFunction, Response, Request } from "express";
import mongoose from "mongoose";
import morgan from "morgan"
import 'dotenv/config'
import { index, issueAuthorizationKey, sign_up } from "./controllers";
import passport, { DoneCallback } from "passport";
import  { JwtPayload } from "jsonwebtoken";
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
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
        } else{
            console.log(
                "Cannot authorize. "+
                "Secret key is not available"
            )
        }

        app.get('/', index)
        app.post('/sign-up', sign_up)
        app.get('/get-key', issueAuthorizationKey)
        app.post('/login', passport.authenticate('jwt', { session: false }), 
        (req, res) =>{
            res.json({msg: 'Authorised'})
        })
        
        app.get('/profile/:userId', 
        passport.authenticate('jwt', { session: false}),
        async (req:Request, res: Response, next: NextFunction) =>{
            const {userId} = req.params
            console.log(userId)
            try {
                const profile = await User.findById( userId, '-__v -password')
                // console.log(profile)

                res.status(200).json({ profile })
            } catch (error) {
                next(error)
            }

        } )

    }).catch(error =>{
        console.error("Could not connect to DB: ", error.message)
    })
} else{
    console.error("Cannot start server: "+
    "DB connection String not available")
}
