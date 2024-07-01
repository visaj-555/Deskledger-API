const Joi = require('joi');

const userRegisterValidate = (req, res, next) => {
    const schema = Joi.object({
        firstName: Joi.string()
            .min(3).message('First name should be at least 3 characters')
            .max(100).message('First name should be at most 100 characters')
            .required().messages({
                'string.base': 'First name should be a type of string',
                'string.empty': 'First name cannot be empty',
                'string.min': 'First name should be at least 3 characters',
                'string.max': 'First name should be at most 100 characters',
                'any.required': 'First name is required'
            }),
        lastName: Joi.string()
            .min(3).message('Last name should be at least 3 characters')
            .max(100).message('Last name should be at most 100 characters')
            .required().messages({
                'string.base': 'Last name should be a type of string',
                'string.empty': 'Last name cannot be empty',
                'string.min': 'Last name should be at least 3 characters',
                'string.max': 'Last name should be at most 100 characters',
                'any.required': 'Last name is required'
            }),
        phoneNo: Joi.string()
            .length(10).message('Phone number should be exactly 10 digits')
            .pattern(/^[0-9]+$/).message('Phone number should contain only digits')
            .required().messages({
                'string.base': 'Phone number should be a type of string',
                'string.empty': 'Phone number cannot be empty',
                'string.length': 'Phone number should be exactly 10 digits',
                'string.pattern.base': 'Phone number should contain only digits',
                'any.required': 'Phone number is required'
            }),
        email: Joi.string()
            .email().message('Invalid email format')
            .required().messages({
                'string.base': 'Email should be a type of string',
                'string.empty': 'Email cannot be empty',
                'string.email': 'Invalid email format',
                'any.required': 'Email is required'
            }),
        password: Joi.string()
            .min(8).message('Password should be at least 8 characters')
            .pattern(/[a-z]/).message('Password should contain at least one lowercase letter')
            .pattern(/[A-Z]/).message('Password should contain at least one uppercase letter')
            .pattern(/[0-9]/).message('Password should contain at least one number')
            .pattern(/[\W_]/).message('Password should contain at least one special character')
            .required().messages({
                'string.base': 'Password should be a type of string',
                'string.empty': 'Password cannot be empty',
                'string.min': 'Password should be at least 8 characters',
                'string.pattern.base': 'Password should contain at least one lowercase letter, one uppercase letter, one number, and one special character',
                'any.required': 'Password is required'
            })
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ message: "User can't be registered", errors });
    }
    next();
}

const userLoginValidate = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string()
            .email().message('Invalid email format')
            .required().messages({
                'string.base': 'Email should be a type of string',
                'string.empty': 'Email cannot be empty',
                'string.email': 'Invalid email format',
                'any.required': 'Email is required'
            }),
        password: Joi.string()
            .min(8).message('Password should be at least 8 characters')
            .required().messages({
                'string.base': 'Password should be a type of string',
                'string.empty': 'Password cannot be empty',
                'string.min': 'Password should be at least 8 characters',
                'any.required': 'Password is required'
            })
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ message: "Invalid Login or Password", errors });
    }
    next();
}

module.exports = {
    userRegisterValidate, 
    userLoginValidate
};
