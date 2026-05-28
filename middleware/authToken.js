const jwt = require('jsonwebtoken')

async function authToken(req,res,next){
    try{
        const token = req.cookies?.token
        const tokenSecretKey = process.env.TOKEN_SECRET_KEY || 'dev_token_secret_key'

        console.log("token",token)
        if(!token){
            return res.status(200).json({
                message : "Please Login...!",
                error : true,
                success : false
            })
        }

        jwt.verify(token, tokenSecretKey, function(err, decoded) {
            console.log(err)
            console.log("decoded",decoded)
            
            if(err){
                console.log("error auth", err)
                return res.status(401).json({
                    message : "Invalid or expired token",
                    error : true,
                    success : false
                })
            }

            req.userId = decoded?._id

            next()
        });


    }catch(err){
        res.status(400).json({
            message : err.message || err,
            data : [],
            error : true,
            success : false
        })
    }
}


module.exports = authToken
