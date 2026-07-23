const authService = require("../services/authService");

// POST /auth/register
const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
      data: result,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

// POST /auth/verify-email  { email, otp }
// const verifyRegistration = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const { user } = await authService.verifyRegistration(email, otp);
//     res.status(200).json({ message: "Email verified successfully", user });
//   } catch (err) {
//     res.status(err.statusCode || 500).json({ message: err.message || "Something went wrong" });
//   }
// };
const verifyRegistration = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await authService.verifyRegistration(email, otp);

    res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      data: result,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

// POST /auth/login  { email, password }
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

// POST /auth/logout  (requires auth)
const logout = async (req, res) => {
  try {
    const result = await authService.logout(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Something went wrong" });
  }
};

// POST /auth/forgot-password  { email }
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Something went wrong" });
  }
};

// POST /auth/reset-password  { email, otp, newPassword }
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Something went wrong" });
  }
};


//POST /auth/change-password {currentPassword,newPassword}
const changePassword = async(req,res) => {
   console.log("BODY RECEIVED:", req.body);
try{
  const{currentPassword,newPassword} = req.body;
  
  const result = await authService.changePassword(req.user.id,currentPassword,newPassword);
  res.status(200).json(result);
} catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Something went wrong" });
}
}

module.exports = {
  register,
  verifyRegistration,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword 
};