async function isAdmin(req, res, next) {
    try {
        console.log("User role:", req.userRole);

        if (req.userRole !== "ADMIN") {
            return res.status(403).json({
                message: "Access denied. Only admins can perform this action.",
                error: true,
                success: false
            });
        }
        next();
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

module.exports = isAdmin;
