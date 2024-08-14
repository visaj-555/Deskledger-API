const Joi = require('joi');

const validateGold = (req, res, next) => {
    const isUpdating = req.method === 'PUT';

    const schema = Joi.object({
        goldId: Joi.string()
            .optional() // Since it is an optional field in the schema
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
        goldCurrentPricePerGram: Joi.number().positive()
            .optional()
            .messages({
                'number.base': 'Gold current price per gram must be a number',
                'number.positive': 'Gold current price per gram must be a positive number'
            }),
        makingChargesPerGram: Joi.number().positive()
            .optional()
            .messages({
                'number.base': 'Making charges per gram must be a number',
                'number.positive': 'Making charges per gram must be a positive number'
            }),
        goldCurrentValue: Joi.number().positive()
            .optional()
            .messages({
                'number.base': 'Gold current value must be a number',
                'number.positive': 'Gold current value must be a positive number'
            }),
        gst: Joi.number().positive()
            .optional()
            .messages({
                'number.base': 'GST must be a number',
                'number.positive': 'GST must be a positive number'
            }),
        finalGoldPrice: Joi.number().positive()
            .optional()
            .messages({
                'number.base': 'Final gold price must be a number',
                'number.positive': 'Final gold price must be a positive number'
            }),
        profit: Joi.number().positive()
            .optional()
            .messages({
                'number.base': 'Profit must be a number',
                'number.positive': 'Profit must be a positive number'
            }),
    });

    const { error } = schema.validate(req.body, { context: { isUpdating } });

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
};

module.exports = { validateGold };
