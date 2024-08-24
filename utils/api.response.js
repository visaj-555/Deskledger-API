//  utils/api.response.js 


const statusCode = {
    OK: 200, 
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
}

const message  = {

    // Success messages 
    otpSuccess : "OTP Verified Successfully",
    analysisReportofFd : "Analysis Report of all the fixed deposits",
    analysisReportofGold : "Analysis Report of all the gold investments",
    overAllAnalysis : "Overall Analysis of FDs and Gold",
    bankCreated : "Bank created Successfully", 
    bankUpdated : "Bank updated successfully", 
    bankDeleted : "Bank deleted successfully",
    banksView: "Banks retrieved successfully",
    bankView: "Bank retrieved successfully",
    goldInfoRegister : "Gold info registered successfully",
    goldInfoUpdate : "Gold info updated successfully", 
    goldInfoDelete : "Gold info deleted successfully",
    goldNotFetch : "Gold Master data is not available",
    goldRecords : "Gold records fetched successfully",
    goldNotFound : "Gold records not found",
    fdCreated: "FD registered successfully", 
    fdUpdated: "FD updated successfully", 
    fdDeleted: "FD deleted successfully",
    fdsView: "FDs retrieved successfully",
    fdView: "FD retrieved successfully", 
    fdAnalysis: "Analysis Report of all the fixed deposits",
    userNotFound: "User not found",
    userProfileUpdated: "User profile updated Successfully",
    userExists: "User already exists",
    userLoggedIn: "User logged in successfully",
    userLoggedOut: "User logged out successfully",
    userProfileUpdated: "User profile updated successfully",
    userCreated: "You are Registered Successfully",
    userUpdated: "Account updated successfully",
    userDeleted: "Account deleted successfully",
    userView: "User retrieved successfully", 
    usersView: "Users retrieved successfully",
    passwordChanged: "Password changed successfully",
    resetPasswordSend: "Password reset link sent to your mail",
    resetPassword: "Password reset successfully",
    investmentInAllSectors: "Overall Investment in All the Sectors (%)",
    topGainers: "Top Gainers of all the Sectors", 
    investmentBySector: "Investment data for the specified sector",
    investmentById: "Investment by Id", 
    highestGrowthInSector: "Highest growth in sector retrieved successfully",  
    otpSuccess : "Otp verified successfully", 


    // Error Messages  
    otpInvalid : "Invalid OTP",
    otpExpired : "Expired OTP",
    errorResetPassword : "Error resetting password",
    errorUserUpdate : "Error updating user profile",
    errorOverAllAnalysis : "Error calculating overall analysis",
    errorFdAnalytics : "Error calculating FD analytics",
    errorGoldAnalytics : "Error calculating Gold analytics",
    errorFetchingGoldMaster : "Error fetching Gold Master",
    errorGoldRecords : "Error fetching Gold Records",
    errorCreatingGoldInfo : "Error registering Gold Information",
    errorUpdatingGoldInfo :"Error updating Gold Information",
    bankAlreadyExists : "Bank already exists",
    errorCreatingBank : "Error creating Bank",
    errorUpdatingBank : "Error updating Bank",
    errorDeletingBank : "Error deleting Bank",
    errorFetchingBanks : "Error fetching Banks",
    errorFetchingBank: "Error fetching Bank",
    errorDeletingGoldInfo : "Error deleting Gold Information",
    errorUpdatingGoldInfo :"Error updating Gold Information",
    errorFetchingGoldInfo: "Gold Information not found",
    goldExists : "Gold Information Already Exists",
    goldRegisterError : "Error registering Gold Information",
    userAlreadyExists: "User already exists", 
    goldExists : "Gold Info already exists",
    errorRegisteringUser: "Error registering user", 
    userNotFound: "User not found", 
    passwordIncorrect: "Invalid password", 
    errorLogin: "Error logging in user", 
    errorFetchingUser: "Error fetching users", 
    imageValidation: "Please upload a valid image file", 
    fileTooLarge: "File size should be less than 1 MB",
    updateUserError: "An error occurred while updating the profile",
    deleteUserError: "User can't be deleted",
    incorrectOldPassword: "Invalid old password",
    passwordNotMatch: "Passwords do not match",
    expiredToken: "Invalid or expired token",
    unAuthUser : "Unauthorized User",
    tokenNotMatch: "Unauthorized. Token does not match user",
    tokenNotFound: "Token not found in the database",
    tokenVerifyFail: "Token verification failed", 
    passwordChangeError: "Your password cannot be changed",
    errorFetchingInvestments: "Error fetching investments",
    errorFetchingInvestment: "Error fetching Investment",
    errorFetchingSectors: "Error fetching Sectors",
    errorFetchingSector: "Error fetching Sector",
    errorCreatingInvestment: "Error creating Investment",
    errorFetchingFD: "Error fetching FD",
    fdExists : "FD Already Exists",
    errorFetchingFDAnalysis: "Error fetching FD Analysis",
    errorFetchingInvestmentBySector: "Error fetching Investment by sector",
    errorFetchingInvestmentById: "Error fetching Investment by Id",
    errorCreatingFD: "Error creating FD",
    errorUpdatingFD: "Error updating FD",
    errorDeletingFD: "Error deleting FD",
    errorFetchingFDs: "Error fetching FDs",
    errorFdAnalytics: "Error calculating FD Analytics",
    errorSendingPasswordResetEmail: "Error sending password reset email",
    resetPasswordSuccess: "Reset Password Success",
    resetPasswordError : "Error resetting password",
    otpInvalid : "Invalid OTP",
    validImageError : "Profile Image should be Less than 1 MB",
    deleteAuth : "You are unauthorized to delete this account", 
    internalError : "Internal Server Error",
    errorUserProfile : "Error updating profile image", 
    // required 
    sectorRequired: "Sector is required"
}

module.exports = {
    statusCode,
    message
}
