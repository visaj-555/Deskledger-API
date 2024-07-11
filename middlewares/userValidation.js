const Joi = require('joi');

const userRegisterValidate = (req, res, next) => {
    const schema = Joi.object({
        firstName: Joi.string()
            .min(3).max(100)
            .required()
            .messages({ //  Rules for the first name
                'string.base': 'First name should be a type of string',
                'string.empty': 'First name cannot be empty',
                'string.min': 'First name should be at least 3 characters',
                'string.max': 'First name should be at most 100 characters',
                'any.required': 'First name is required'
            }),
        lastName: Joi.string()
            .min(3).max(100)
            .required()
            .messages({ // Rules for the last name
                'string.base': 'Last name should be a type of string',
                'string.empty': 'Last name cannot be empty',
                'string.min': 'Last name should be at least 3 characters',
                'string.max': 'Last name should be at most 100 characters',
                'any.required': 'Last name is required'
            }),
        phoneNo: Joi.string()
            .length(10)
            .pattern(/^[0-9]+$/)
            .required()
            .messages({ //  Rules for the phone number
                'string.empty': 'Phone number cannot be empty',
                'string.length': 'Phone number should be exactly 10 digits',
                'string.pattern.base': 'Phone number should contain only digits',
                'any.required': 'Phone number is required'
            }),
        email: Joi.string()
            .email()
            .required()
            .messages({ // Rules for the email
                'string.base': 'Email should be a type of string',
                'string.empty': 'Email cannot be empty',
                'string.email': 'Invalid email format',
                'any.required': 'Email is required'
            }),
        password: Joi.string()
            .min(8)
            .pattern(/[a-z]/)
            .pattern(/[A-Z]/)
            .pattern(/[0-9]/)
            .pattern(/[\W_]/)
            .required()
            .messages({ // Rules for password
                'string.base': 'Password should be a type of string',
                'string.empty': 'Password cannot be empty',
                'string.min': 'Password should be at least 8 characters',
                'string.pattern.base': 'Password should contain at least one lowercase letter, one uppercase letter, one number, and one special character',
                'any.required': 'Password is required'
            }),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message); // throwing error message
        return res.status(400).json({ statusCode: 400, message: "Validation error", errors });
    }
    next();
}

const userLoginValidate = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({ // Rules for email validation
                'string.base': 'Email should be a type of string',
                'string.empty': 'Email cannot be empty',
                'string.email': 'Invalid email format',
                'any.required': 'Email is required'
            }),
        password: Joi.string()
            .min(8)
            .required()
            .messages({ // Rules for password validation
                'string.base': 'Password should be a type of string',
                'string.empty': 'Password cannot be empty',
                'string.min': 'Password should be at least 8 characters',
                'any.required': 'Password is required'
            }),
    });

    const { error } = schema.validate(req.body, { abortEarly: false }); // to abort the running process
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({ statusCode: 400, message: "Validation error", errors });
    }

    next(); // to pass control to next middleware
}

module.exports = {
    userRegisterValidate,
    userLoginValidate
};
