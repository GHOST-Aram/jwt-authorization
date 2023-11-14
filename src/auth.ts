import  { JwtPayload } from "jsonwebtoken";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "./user.model";
import passport, { DoneCallback } from "passport";
import 'dotenv/config'

const secretKey = process.env.TOKEN_SECRET

export const configAuth = () =>{
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
}