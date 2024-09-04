const Joi = require('joi');

const stateValidate = (req, res, next) => {
    const isUpdate = req.method === 'PUT';

    const schema = Joi.object({
        stateId: isUpdate ? Joi.string().required() : Joi.string().optional(),
        stateName: isUpdate ? Joi.string().min(3).max(100).optional() : Joi.string().min(3).max(100).required().messages({
            'string.base': 'State name should be a type of string',
            'string.empty': 'State name cannot be empty',
            'string.min': 'State name should be at least 3 characters',
            'string.max': 'State name should be at most 100 characters',
            'any.required': 'State name is required',
        }),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map((detail) => detail.message);
        return res.status(400).json({ statusCode: 400, message: 'Validation error', errors });
    }
    next();
};

module.exports = {
    stateValidate,
};
