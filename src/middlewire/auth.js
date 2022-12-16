const jwt = require("jsonwebtoken");
const userModel = require ("../model/userModel")
const mongoose=require("mongoose")
const isValidObjectId = function (id) {
    var ObjectId = mongoose.Types.ObjectId;
    return ObjectId.isValid(id)
}



//<!-----------------------Authentication------------------------------->
const authenticate = async function (req, res, next) {
    try {
        let token = req.headers["x-Api-key"];
        if (!token) token = req.headers["x-api-key"];
        
        if (!token) return res.status(401).send({ status: false, message: "Token must be present", });
        let decodedToken = jwt.verify(token, "userPro", (err, decoded)=>{
            if(err){
               return res.status(400).send({status: false , Error : err.message})
            }else{
                return decoded
            }
        })
        if (!decodedToken) return res.status(403).send({ status: false, message: "Token is invalid", });
        req.userId= decodedToken.userId
    }
    catch(err){
        console.log(err)
        res.status(500).send({status:false,message:err.message})
    }
    next()
}
const authorisation = async function (req, res, next) {
    try {
      // userId sent through path params
      let userId = req.params.userId;
  
      // CASE-1: useId is empty
      if (userId === ":userId") {
        return res
          .status(400)
          .send({ status: false, msg: "Please enter userId to proceed!" });
      }
      // CASE-2: userId is not an ObjectId
      else if (!isValidObjectId(userId)) {
        return res.status(400).send({ status: false, msg: "userId is invalid!" });
      }
      // CASE-3: userId does not exist (in our database)
      let user = await userModel.findOne({ _id: userId }); // database call
      // console.log(user);
      if (!user) {
        return res.status(400).send({
          status: false,
          msg: "We are sorry; Given userId does not exist!",
        });
      }
  
      // Authorisation: userId in token is compared with userId against bookId
      if (req.userId !== userId) {
        return res.status(403).send({
          status: false,
          msg: `Authorisation Failed! You are logged in ${req.userId} not as ${userId}`,
        });
      } else if (req.userId === userId) {
        next();
      }
    } catch (err) {
      res.status(500).send({ msg: "Internal Server Error", error: err.message });
    }
  };
  


module.exports.authorisation = authorisation;


module.exports.authenticate = authenticate