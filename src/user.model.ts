import { compare, hash } from "bcrypt"
import { HydratedDocument, Model, Schema, model } from "mongoose"

interface IUser{
    full_name: string
    email: string
    password: string
    username: string
}

interface UserMethods{
    isValidPassword:(password: string) => Promise<boolean>
}

type UserModel = Model<IUser, {}, UserMethods>

const userSchema: Schema = new Schema<IUser, UserModel, 
UserMethods>({
    full_name: {
        type:String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    }
}) 
userSchema.pre('save', async function(next){

    const hashedPassword =  await hash(this.password, 10)
    this.password = hashedPassword

    next()
})

userSchema.method('isValidPassword', async function(
    password: string): Promise<boolean>{
    const isValid = await compare(password, this.password)
    return isValid
})

export type HydratedUserDoc = HydratedDocument<IUser, UserMethods>
export const User: UserModel = model<IUser, UserModel>('User', userSchema)