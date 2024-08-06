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
    fdCreated: "FD registered successfully", 
    fdUpdated: "FD updated successfully", 
    fdDeleted: "FD deleted successfully",
    fdsView: "FDs retrieved successfully",
    fdView: "FD retrieved successfully", 
    fdAnalysis: "Analysis Report of all the fixed deposits",
    userNotFound: "User not found",
    userExists: "User already exists",
    userLoggedIn: "User logged in successfully",
    userLoggedOut: "User logged out successfully",
    userProfileUpdated: "User profile updated successfully",
    userCreated: "User registered successfully",
    userUpdated: "User updated successfully",
    userDeleted: "User deleted successfully",
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

    // Error Messages  
    userAlreadyExists: "User already exists", 
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
    errorFetchingFDAnalysis: "Error fetching FD Analysis",
    errorFetchingInvestmentBySector: "Error fetching Investment by sector",
    errorFetchingInvestmentById: "Error fetching Investment by Id",
    errorCreatingFD: "Error creating FD",
    errorUpdatingFD: "Error updating FD",
    errorDeletingFD: "Error deleting FD",
    errorFetchingFDs: "Error fetching FDs",
    errorFdAnalytics: "Error calculating FD Analytics",

    // required 
    sectorRequired: "Sector is required"
}

module.exports = {
    statusCode,
    message
}