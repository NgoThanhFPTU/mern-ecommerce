const userModel = require("../../models/userModel");

async function updateProfile(req, res) {
  try {
    const { userId, name, phone } = req.body;
    
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { name, phone },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found.", success: false });
    }

    res.json({ data: updatedUser, message: "Profile updated successfully.", success: true });
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
}

module.exports = updateProfile;
