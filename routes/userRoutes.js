const express=require('express');
const router=express.Router();
const User= require('./../models/user');
const {jwtAuthMiddleware,generateToken}=require('./../jwt')

// POST ROUTE TO ADD A USER:
router.post('/signup', async (req, res) => {
    try {
  
      const data = req.body// ASSUMING IT IS CONTAINING PERSONS DATA
  
      // CREATE A NEW PERSON DOCUMENT USING MONGOOSE MODEL:
      const newUser = new User(data);
  
      // Save newPerson to database:
      const response = await newUser.save();
      console.log("Data saved succesfully:");

      const payload={
        id:response.id
      }
      const token=generateToken(payload);
      console.log("Token is :" ,token);
      res.status(200).json({response:response,token:token});
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  })

// POST TO LOGIN:
router.post('/login',async (req,res)=>{
try {
  const {aadharCardNumber,password}=req.body;
  const user=await User.findOne({aadharCardNumber:aadharCardNumber});
  if(!user || !(await user.comparePassword(password))){
    return res.status(401).json({Error:'Invalid aadharCardNo and password'});

} 
const payload={
  id:user.id,
}
const token=generateToken(payload);
res.json({token});
}
catch (error) {
  console.log(error);
  return res.status(500).json({Error:'Internal server error:'});
}
});

router.get('/profile',jwtAuthMiddleware,async(req,res)=>{
    try {
        const userData=req.user;
        const userID=userData.id;
        const user=await User.findById(userID);
        res.status(200).json({user});
    } catch (error) {
        console.log(error);
        return res.status(500).json({Error:'Internal server error:'});
    }
});

  router.put('/profile/password', async (req, res) => {
    try {
      const userId = req.user.id;
    const {currentPassword,newPassword}=req.body;
    const user=await User.findById(userId);
    if(!(await user.comparePassword(currentPassword))){
        return res.status(401).json({Error:'Invalid aadharCardNo and password'});
    }
    user.password=newPassword;
    await user.save();
    console,log("password updated:...");
    res.status(200).json({message:'password updated...'})
  
}catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports=router;