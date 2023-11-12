import {hash} from "bcrypt"

hash("sdhfnweij902nr92djsa9du23332", 10).then(
    hashed =>{
        console.log(hashed)
    }
).catch(error => console.log(error.message))