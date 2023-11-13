import express, { Application, Request, Response } from "express"
import jwt, { JsonWebTokenError } from "jsonwebtoken"
import 'dotenv/config'
import { HydratedUserDoc, User } from "./user.model"
import mongoose from "mongoose"
import { NextFunction } from "express-serve-static-core"
import { MongoError } from "mongodb"
const app: Application = express()

app.use(express.urlencoded({extended: false}))
app.use(express.json())
const MONGODB_URI = process.env.MONGODB_URI

if(MONGODB_URI){
    mongoose.connect(MONGODB_URI).then(result =>{
        console.log("Connected to DB")

        runserver(app)

    }).catch(error =>{
        console.log(`Connection to DB failed: ${error.message}`)
    })
}

function runserver(app: Application){
    const secretKey = process.env.TOKEN_SECRET

    app.get('/', (req: Request, res: Response) =>{
        res.json({name: "Welcome Home"})
    })
    app.post('/sign-up', async(req: Request, res: Response, next) =>{
    
        try {
            const {full_name, username, email, password } = req.body
            const user: HydratedUserDoc = new User({
                full_name, password, email, username
            })
        
            const savedUser = await user.save()
            console.log(savedUser)
            
            res.status(201).json({ 
                userId: savedUser.id, 
                username: savedUser.username,
                email: savedUser.email 
            })
            
        } catch (error) {
            next(error)   
        }
    })
    
    app.post('/login', async(
        req: Request, res: Response, next: NextFunction
    ) =>{
        const { password, username } = req.body

        try {
            const user = await User.findOne({ username })
    
            if(user){
                const isValid = await user.isValidPassword(password)
                if(!isValid){
                    res.status(401).json({ error: "Unauthorised"})
                } else {
                    if(secretKey){
                        const token = jwt.sign(
                            {
                                username: user.username, 
                                full_name: user.full_name
                            }, secretKey, {
                                subject: user.id,
                                expiresIn: '30m'
                            })
                        res.status(200).json({ token })
                    } else {
                        next(new Error("Unexpected Server Error"))
                    }
                }
            } else{
                res.status(401).json({ error: "Unknown User"})
            }
            
        } catch (error) {
            next(error)
        }
        
    })

    app.get('/profile',  async(
        req: Request, res: Response, next: NextFunction
    ) =>{
        const token = req.headers['authorization']?.split(' ')[1]
        if(secretKey && token){
            try {
                    
                const payload = jwt.verify(token, secretKey)

                const profile = await User.findById(
                    payload.sub, '-password -__v'
                )

                res.json({ profile })
            } 
            catch (error) { 
                if(error instanceof JsonWebTokenError){
                    res.status(401).json({message: "Invalid token"})
                } 

                next(error)   
            }
        } else {
            next(new Error("Unexpected server error"))
        }
    })



    app.listen(4000)
}
