import express, { Application, Request, Response } from "express"
import jwt from "jsonwebtoken"
import 'dotenv/config'
import { HydratedUserDoc, User } from "./user.model"
import mongoose from "mongoose"
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
    
    app.post('/login', (req: Request, res: Response) =>{
        const secretKey = process.env.TOKEN_SECRET
    
        if(secretKey){
            const token = req.headers['authorization']?.split(' ')[1]
            if(token){
                const user: string | jwt.JwtPayload = jwt.verify(token, secretKey)
                res.json({ user })
            } else {
                res.status(401).json("Unauthorized")
            }
        } else {
            res.status(500).json("Internal server error")
        }  
    })
    app.listen(4000)
}
