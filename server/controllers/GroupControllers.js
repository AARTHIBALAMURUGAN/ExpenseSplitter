const Group=require("../models/GroupModels.js");
const User=require("../models/UserModels.js")

//Create Group
const createGroup = async (req, res) => {

  try {

    const {
      groupname,
      members = [],
      createdBy,
    } = req.body;

    if (!groupname || !createdBy) {

      return res.status(400).json({
        message: "All fields required",
      });

    }

  
    const uniqueMembers = [
      ...new Set([
        ...members,
        createdBy
      ])
    ];

    const group = await Group.create({
      groupname,
      members: uniqueMembers,
      createdBy,
    });

    res.status(201).json(group);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message,
    });

  }

};

//getGroup
    const getGroups=async(req,res)=>{
        try{
           const groups=await Group.find({
            members:req.user._id,
           })
           .populate("members","name email")

           res.status(200).json(groups)
        }
        catch(err){
            res.status(500).json({message:err.message})
        }
    }

//add member to the group
const addMember = async (req, res) => {

  try {

    const { groupId, email } =
      req.body;

    
    if (!groupId || !email) {

      return res.status(400).json({
        message:
          "groupId and email required",
      });

    }
    const user =
      await User.findOne({ email });

    if (!user) {

      return res.status(404).json({
        message: "User not found",
      });

    }
    const group =
      await Group.findById(groupId);

    if (!group) {

      return res.status(404).json({
        message: "Group not found",
      });

    }
    const alreadyMember =
      group.members.some(
        (member) =>
          member.toString() ===
          user._id.toString()
      );

    if (alreadyMember) {

      return res.status(400).json({
        message:
          "User already in group",
      });

    }
    group.members.push(user._id);
    await group.save();


    res.status(200).json({
      message:
        "Member added successfully",
      group,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message,
    });

  }

};

//getgroup by their id


const getGroupById=async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate("members", "_id name email");
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports={createGroup,getGroups,addMember,getGroupById}