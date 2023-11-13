import express, { Application, Request, Response } from "express"
import jwt from "jsonwebtoken"
import 'dotenv/config'
import { HydratedUserDoc, User } from "./user.model"
import mongoose from "mongoose"
import { NextFunction } from "express-serve-static-core"
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
    
    app.post('/login', async(
        req: Request, res: Response, next: NextFunction
    ) =>{
        const secretKey = process.env.TOKEN_SECRET
        const { password, username } = req.body

        try {
            const user = await User.findOne({ username })
    
            if(user){
                const isValid = await user.isValidPassword(password)
                if(!isValid){
                    res.status(401).json({ error: "Unauthorised"})
                } else {
                    if(secretKey){
                        const token = jwt.sign({username: user.username, userId: user.id, full_name: user.full_name}, secretKey)
                        res.status(200).json({ token })
                    } else {
                        next(new Error("Unexpected Server Error"))
                    }
                }
            } else{
                res.status(401).json({ error: "Unauthorised"})
            }
            
        } catch (error) {
            next(error)
        }
        
    })
    app.listen(4000)
}
