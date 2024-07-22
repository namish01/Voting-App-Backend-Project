const express=require('express');
const router=express.Router();
const User= require('./../models/user');
const {jwtAuthMiddleware,generateToken}=require('./../jwt');
const Candidate = require('../models/candidate');

const checkAdminRole = async (userID) => {
    try{
         const user = await User.findById(userID);
         if(user.role === 'admin'){
             return true;
         }
    }catch(err){
         return false;
    }
 }

// POST ROUTE TO ADD A CANDIDATE:
router.post('/',jwtAuthMiddleware, async (req, res) => {
    try {
        if(!(await checkAdminRole(req.user.id)))
            return res.status(403).json({message: 'YOU NEED TO BE AN ADMIN TO MODIFY THIS:... '});

        const data = req.body// ASSUMING IT IS CONTAINING PERSONS DATA
      // CREATE A NEW PERSON DOCUMENT USING MONGOOSE MODEL:
      const newCandidate = new Candidate(data);
  
      // Save newPerson to database:
      const response = await newCandidate.save();
      console.log("Data saved succesfully:");
      res.status(200).json({response:response});
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  })

  router.put('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    try{
        if(!checkAdminRole(req.user.id))
            return res.status(403).json({message: 'YOU NEED TO BE AN ADMIN TO MODIFY THIS:...'});
        
        const candidateID = req.params.candidateID; // Extract the id from the URL parameter
        const updatedCandidateData = req.body; // Updated data for the candidate

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validation
        })

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('candidate data updated');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    try{
        if(!checkAdminRole(req.user.id))
            return res.status(403).json({message: 'YOU NEED TO BE AN ADMIN TO MODIFY THIS:...'});
        
        const candidateID = req.params.candidateID; // Extract the id from the URL parameter

        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('candidate deleted');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});



router.post('/vote/:candidateID',jwtAuthMiddleware,async (req,res)=>{
// NO ADMIN CAN VOTE:
// A USER CAN VOTE ONLY ONCE:
candidateID=req.params.candidateID;
userid=req.user.id;

try {
    
const candidate= await Candidate.findById(candidateID);
if(!candidate){
    return res.status(404).json({ERROR:'CANDIDATE NOT FOUND'});
}

const user=await User.findById(userid);
if(!user){
    return res.status(404).json({ERROR:'USER NOT FOUND'});
}

if(user.isVoted){
     res.status(400).json({message:'YOU CANT VOTE AGAIN:'})
}
if(user.role=='admin'){
    res.status(403).json({message:'ADMIN IS NOT ALLOWED:'});
}

// UPDATE THE CANDIDATE DOCUMENT TO RECORD THE VOTE:
candidate.votes.push({user:userid});
candidate.voteCount++;
await candidate.save();

// UPDATE THE USER DOCUMENT:
user.isVoted=true;
await user.save();

res.status(200).json({message:'VOTED SUCCESSFULLY'});
} catch (error) {
    console.log(error);
    res.status(500).json({error: 'Internal Server Error'});
}

})

// VOTE COUNT:
router.get('/vote/count', async (req,res)=>{
try {
    // FIND ALL CANDIDATES AND SORT THEM IN DES. ACCORDING TO THEIR VOTE COUNT:
    const candidate=await Candidate.find().sort({voteCount:'desc'});

    // MAP THE CANDIDATE TO RETURN ONLY THEIR NAME AND VOTE COUNT :
    const voteRecord =candidate.map((data)=>{
        return {
            party:data.party,
            count:data.voteCount
        }
    });
    return res.status(200).json(voteRecord);

    
} catch (error) {
    console.log(err);
    res.status(500).json({error: 'Internal Server Error'});
}
});
// List of all candidates:
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports=router;