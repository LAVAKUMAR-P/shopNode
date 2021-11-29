import jwt from 'jsonwebtoken';

const authenticate=async(req,res,next)=>{
try {
    
    if(req.headers.authorization){
        jwt.verify(req.headers.authorization,process.env.JWT_SECRET,function(error,decoded){
            if(error){
                
                res.status(500).json({
                    message: "Unauthorized"
                })
            }else{
               
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