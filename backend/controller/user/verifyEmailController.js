const userModel = require("../../models/userModel");

async function verifyEmailController(req, res) {
    try {
        const { token } = req.params;

        const user = await userModel.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid token or user not found." });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Email verified successfully. You can now log in!" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

module.exports = verifyEmailController;
