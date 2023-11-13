import {NextFunction, Request, Response } from "express"
import { HydratedUserDoc, User } from "./user.model"

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