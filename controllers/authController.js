const User = require("../models/User");

const loginUser = async (req, res) => {
  try {
    console.log("Login attempt with data:");
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    if (user.password !== password) {
      return res.status(400).json({
        message: "Wrong password"
      });
    }

    res.json({
      message: "Login successful",
      user: user.username
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = { loginUser };