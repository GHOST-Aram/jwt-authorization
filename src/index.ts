import express, { Request, Response } from "express"
import jwt from "jsonwebtoken"
import 'dotenv/config'
const app = express()

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.get('/', (req: Request, res: Response) =>{
    res.json({name: "Welcome Home"})
})
app.post('/sign-up', (req: Request, res: Response) =>{
    const secretKey = process.env.TOKEN_SECRET
    if(secretKey){
        const {full_name, username, email, password } = req.body
        const token = jwt.sign(
            {username, email}, 
            secretKey,
            {
                issuer: 'localhost',
                expiresIn: '1m',
            }
        )
        res.json({ token })
    } else{
        res.status(500).json("Internal server error")
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