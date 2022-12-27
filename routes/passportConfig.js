const LocalStrategy = require('passport-local').Strategy
const bcrypt =require('bcrypt');
const users = require('../models/user-schema');
async function initialize(passport,getUserByEmail, getUserById)
{
    const authenticateUser = (email,password,done)=>{
        const user =getUserByEmail(email)
        if(user==null){
            return done(null,false,{message:"no user with that email"})

        }
        try{
            if(await bcrypt.compare(password,user.password)) 
            {//correct user.password
            return done(null,user)
            }
        
                else{
                    return done(null,false,{message:'password incorrect'})
                }
            }catch(e){
                    return done(e)
                }
            
            passport.use(new LocalStrategy({usernameField:'email'}), authenticateUser)
            passport.serializeUser((user,done)=>{null,user.id})  //user -use db 
            passport.deserializeUser((id,done)=>{done(null, getUserById().id)})
        

            module.exports=initialize;
            
        }
         
    }
    
}