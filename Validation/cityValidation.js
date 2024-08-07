const Joi = require('joi');

const cityValidate = (req, res, next) => {
    const isUpdating = req.method === 'PUT';

    const schema = Joi.object({
        cityId: isUpdating ? Joi.string().required() : Joi.string().optional(),
        cityName: isUpdating ? Joi.string().min(3).max(100).optional() : Joi.string().min(3).max(100).required().messages({
            'string.base': 'City should be a type of string',
            'string.empty': 'City name cannot be empty',
            'string.min': 'City name should be at least 3 characters',
            'string.max': 'City name should be at most 100 characters',
            'any.required': 'City name is required'
        }),
        state_id: isUpdating ? Joi.string().optional() : Joi.string().required().messages({
            'string.empty': 'State id is required'
        })
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        console.log(errors);
        return res.status(400).json({ statusCode: 400, message: "Validation error", errors });
    }
    next();
};

module.exports = {
    cityValidate
};
