import {NextFunction, Request, Response } from "express"
import { HydratedUserDoc, User } from "./user.model"
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import "dotenv/config"

export const index = (
    req: Request, res: Response, next: NextFunction
) =>{
    res.status(200).json({ greeting: "Welcome home" })
}

export const sign_up = async(
    req: Request, res: Response, next: NextFunction
) =>{
    const {email, password, username, full_name} = req.body

    try {
        const user: HydratedUserDoc = new User({
            email, password, username, full_name
        })

        const savedUser = await user.save()

        res.status(201).json({
            userID: savedUser.id,
            username: savedUser.username,
            email: savedUser.email
        })
    } catch (error) {
        next(error)
    }
}

export const issueAuthorizationKey = async(
    req: Request, res: Response, next: NextFunction
) =>{
    const { email } = req.body

    const secretOrKey = process.env.TOKEN_SECRET
    if(secretOrKey){
        try {
            const user = await User.findOne({ email }, '-password')
            
            if(user){
                const token = jwt.sign({
                    full_name: user.full_name,
                    user_name: user.username
                },
                secretOrKey, {
                    expiresIn: '36m',
                    subject: user.id
                })

                res.status(200).json({ token })
            } else{
                next(new Error("User not registered"))
            }
        } catch (error) {
            next(error)
        }
    } else {
        next(new Error('Secret key not Available'))
    }


}