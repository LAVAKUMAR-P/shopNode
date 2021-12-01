import jwt from 'jsonwebtoken';

const authenticate=async(req,res,next)=>{
try {
    console.log(req.headers.authorization);
    if(req.headers.authorization){
        console.log("JWT verified");
        jwt.verify(req.headers.authorization,process.env.JWT_SECRET,function(error,decoded){
            if(error){
               console.log(error);
                res.status(401).json({
                    message: "Unauthorized"
                })
            }else{
                console.log(decoded)
                req.body.userid = decoded.id;
            next()
            }
            
        });
      
    }else{
        res.status(401).json({
            message: "No Token Present auth"
        })
    }
} catch (error) {
    
}
}

export default authenticate;