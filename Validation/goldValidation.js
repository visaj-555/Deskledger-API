const Joi = require('joi');

const validateGold = (req, res, next) => {
    const isUpdating = req.method === 'PUT';

    const schema = Joi.object({
        goldId: Joi.string()
            .optional() // Optional field
            .messages({
                'string.empty': 'Gold ID is required'
            }),
        firstName: Joi.string().min(2).max(50)
            .when('$isUpdating', { is: true, then: Joi.optional(), otherwise: Joi.required() })
            .messages({
                'string.empty': 'First name is required',
                'any.required': 'First name is required'
            }),
        lastName: Joi.string().min(2).max(50)
            .when('$isUpdating', { is: true, then: Joi.optional(), otherwise: Joi.required() })
            .messages({
                'string.empty': 'Last name is required',
                'any.required': 'Last name is required'
            }),
        goldWeight: Joi.number().positive()
            .when('$isUpdating', { is: true, then: Joi.optional(), otherwise: Joi.required() })
            .messages({
                'number.base': 'Gold weight must be a number',
                'number.positive': 'Gold weight must be a positive number',
                'any.required': 'Gold weight is required'
            }),
        goldPurchasePrice: Joi.number().positive()
            .when('$isUpdating', { is: true, then: Joi.optional(), otherwise: Joi.required() })
            .messages({
                'number.base': 'Gold purchase price must be a number',
                'number.positive': 'Gold purchase price must be a positive number',
                'any.required': 'Gold purchase price is required'
            }),
        formOfGold: Joi.string().required()
            .messages({
                'string.empty': 'Form of gold is required',
                'any.required': 'Form of gold is required'
            }),
        purityOfGold: Joi.number().positive().required()
            .messages({
                'string.empty': 'Purity of gold is required',
                'any.required': 'Purity of gold is required'
            }),
    });

    const { error } = schema.validate(req.body, { context: { isUpdating } });

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
};

module.exports = { validateGold };
