const UserModel = require('../models/UserModel');
const bcrypt = require('bcrypt');
const { response } = require('express');
const jwt = require('jsonwebtoken');

module.exports = { 

    registerUser: async (req, res) =>{
        const userModel = new UserModel(req.body);  
        userModel.password = await bcrypt.hash(req.body.password, 10);
    try{
        const response = await userModel.save(); 
        response.password = undefined; 
        return res.status(200).json({message : 'success', data : response}); 
    }catch(err){
        return res.status(500).json({message : 'error', err});  
    }
    },

    loginUser : async (req, res) =>{
        try{
            const user = await UserModel.findOne({ email : req.body.email});
           if (!user){
            return res.status(401).json({ message : 'Invalid email-address / password '});

           } 

           const isPassEqual = await bcrypt.compare(req.body.password, user.password);
           if(!isPassEqual)
            {
                return res.status(401).json({ message : 'Invalid email-address / password '});
            }

            const tokenObject = {
                _id: user._id, 
                firstName: user.firstName, 
                lastName: user.lastName,
                phoneNo : user.phoneNo,
                email: user.email, 
                 }

                 const jwtToken = jwt.sign(tokenObject, process.env.SECRET, {expiresIn : '4h'});
            return  response.status(200).json({jwtToken, tokenObject});
                 


        }
        catch(err)
        {
            return res.status(500).json({message : 'error', err});
        }

        res.send("Login Success");
    },
    getUsers: async (req, res) => {

        try{
            const users =  await UserModel.find(); 
            return res.status(200).json({message : 'success', data : users});
        }
        catch(err)
        {
            return res.status(500).json({message : 'error', err});
        }
    }
        

}


