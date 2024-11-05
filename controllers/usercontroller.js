const UserModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const TokenModel = require("../models/tokenModel");
const nodemailer = require("nodemailer");
const PasswordResetTokenModel = require("../models/passwordResetTokenModel");
const { statusCode, message } = require("../utils/api.response");
const FixedDepositModel = require("../models/fixedDeposit");

// Registering User
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, phoneNo, email, password } = req.body;

    const userExists = await UserModel.findOne({ email });

    if (userExists) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: message.userAlreadyExists,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      firstName,
      lastName,
      phoneNo,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    res.status(statusCode.CREATED).json({
      statusCode: statusCode.CREATED,
      message: message.userCreated,
      data: { ...savedUser.toObject(), password: undefined },
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorRegisteringUser,
      error,
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: message.userNotFound,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: message.passwordIncorrect,
      });
    }

    // Delete previous token for the user if exists
    await TokenModel.findOneAndDelete({ userId: user._id });

    // Generate a token without expiration
    const token = jwt.sign({ id: user._id }, process.env.SECRET);

    // Save token in the database
    const tokenDoc = new TokenModel({ token, userId: user._id });
    await tokenDoc.save();

    // Send response with token and user details
    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.userLoggedIn,
      data: {
        token,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNo: user.phoneNo,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorLogin,
    });
  }
};

// Read User Information by Id
const getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UserModel.findById(id, { password: 0 });
    if (!user) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.userNotFound,
      });
    }
    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.userView,
      data: user,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingUser,
      error,
    });
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: "Please upload a valid image file",
      });
    }

    if (req.fileSizeLimitError) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: "File size should be less than 1 MB.",
      });
    }

    // Debugging logs
    console.log("Request Body:", req.body); // Should contain firstName, lastName, etc.
    console.log("Uploaded File:", req.file); // Should contain profileImage file details

    const { firstName, lastName, phoneNo, email } = req.body;
    const profileImage = req.file ? req.file.path : null; // Only set profileImage if file is present

    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.userNotFound,
      });
    }

    // Update user fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phoneNo = phoneNo || user.phoneNo;
    user.email = email || user.email;
    if (profileImage) {
      user.profileImage = profileImage;
    }

    // Save the updated user data
    await user.save();

    // Send response
    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.userProfileUpdated,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNo: user.phoneNo,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorUserProfile,
    });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Assuming req.user is populated with the authenticated user's data
    if (req.user.id !== userId) {
      return res.status(statusCode.UNAUTHORIZED).json({
        statusCode: statusCode.UNAUTHORIZED,
        message: message.deleteAuth,
      });
    }

    // Delete all Fixed Deposits associated with the user
    await FixedDepositModel.deleteMany({ userId });

    // Delete the user
    const deletedUser = await UserModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.userNotFound,
      });
    }

    res
      .status(statusCode.OK)
      .json({ statusCode: statusCode.OK, message: message.userDeleted });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.deleteUserError,
      error: error.message,
    });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.userNotFound,
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: message.incorrectOldPassword,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: message.passwordNotMatch,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    await TokenModel.deleteMany({ userId: userId });

    res
      .status(statusCode.OK)
      .json({ statusCode: statusCode.OK, message: message.passwordChanged });
  } catch (err) {
    console.error(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.passwordChangeError,
    });
  }
};

// Generate OTP function
const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: message.userNotFound,
      });
    }

    // Generate OTP
    const otp = generateOtp();

    const passwordResetToken = new PasswordResetTokenModel({
      token: otp,
      userId: user._id,
      expires: Date.now() + 3600000, // 1 hour expiration
    });

    // Save the OTP to the database
    await passwordResetToken.save();

    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset Request",
      html: `<p>Here is your OTP: <b>${otp}</b></p>`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(statusCode.OK)
      .json({ statusCode: statusCode.OK, message: message.resetPasswordSend });
  } catch (error) {
    console.error(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorSendingPasswordResetEmail,
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { otp } = req.body;

    const resetToken = await PasswordResetTokenModel.findOne({ token: otp });

    if (!resetToken) {
      console.error("Invalid OTP");
      return res
        .status(statusCode.BAD_REQUEST)
        .json({
          statusCode: statusCode.BAD_REQUEST,
          message: message.otpInvalid,
        });
    }

    if (resetToken.expires < Date.now()) {
      console.error("Expired OTP");
      return res
        .status(statusCode.BAD_REQUEST)
        .json({ statusCode: statusCode.BAD_REQUEST, message: "Expired OTP" });
    }

    const user = await UserModel.findById(resetToken.userId);

    if (!user) {
      return res
        .status(statusCode.NOT_FOUND)
        .json({
          statusCode: statusCode.NOT_FOUND,
          message: message.userNotFound,
        });
    }

    // OTP verified successfully
    return res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.otpSuccess,
      userId: user._id,
    });
  } catch (error) {
    console.error("Error validating OTP:", error);
    return res7ua.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.resetPasswordError,
    });
  }
};

// New Password
const newPassword = async (req, res) => {
  try {
    const { userId, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: message.passwordNotMatch,
      });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.BAD_REQUEST,
        message: message.userNotFound,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // Delete the reset token after successful password reset
    await PasswordResetTokenModel.findOneAndDelete({ userId });

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.passwordChanged,
    });
  } catch (error) {
    console.error(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.passwordChangeError,
    });
  }
};

// Logout API
const logoutUser = async (req, res) => {
  try {
    const authorizationHeader = req.headers["authorization"];
    if (!authorizationHeader) {
      return res.status(statusCode.UNAUTHORIZED).json({
        statusCode: statusCode.UNAUTHORIZED,
        message: message.authHeaderError,
      });
    }

    const token = authorizationHeader.split(" ")[1];
    if (!token) {
      return res.status(statusCode.UNAUTHORIZED).json({
        statusCode: statusCode.UNAUTHORIZED,
        message: message.tokenMissing,
      });
    }

    const tokenExists = await TokenModel.findOneAndDelete({ token });
    if (!tokenExists) {
      return res.status(statusCode.UNAUTHORIZED).json({
        statusCode: statusCode.UNAUTHORIZED,
        message: message.tokenNotFound,
      });
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.userLoggedOut,
    });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorLogout,
    });
  }
};

// Read all the Users Information
const getUsers = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;

    let offset = (page - 1) * limit;

    const users = await UserModel.find({}, { password: 0 })
    .sort({
      createdAt: 1,
    })
    .skip(offset)
    .limit(limit)
    .exec();  
    
    const usersWithSrNo = users.map((user, index) => ({
      srNo: index + 1,
      user, 
    }));

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.usersView,
      data: usersWithSrNo,
      total : await UserModel.countDocuments(),
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingUsers || "Error fetching users",
      error: error.message || error,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changePassword,
  forgotPassword,
  resetPassword,
  newPassword,
  logoutUser,
};
