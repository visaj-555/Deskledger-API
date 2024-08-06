const Joi = require('joi');

const validateNationalPensionScheme = (req, res, next) => {
    const isUpdating = req.method === 'PUT';

    const schema = Joi.object({
        firstName: Joi.string().min(2).max(50)
            .when('$isUpdating', { is: true, then: Joi.optional(), otherwise: Joi.required() })
            .messages({
                'string.empty': 'First name is required',
                'any.required': 'First name is required'
            }),
        lastName: Joi.string().min(3).max(50)
            .when('$isUpdating', { is: true, then: Joi.optional(), otherwise: Joi.required() })
            .messages({
                'string.empty': 'Last name is required',
                'any.required': 'Last name is required'
            }),
        pranNo: Joi.number().integer().positive()
            .when('$isUpdating', { is: true, then: Joi.optional(), otherwise: Joi.required() })
            .messages({
                'number.base': 'PRAN number must be a number',
                'number.integer': 'PRAN number must be an integer',
                'number.positive': 'PRAN number must be a positive number',
                'any.required': 'PRAN number is required'
            }),
        accountType: Joi.string()
            .when('$isUpdating', { is: true, then: Joi.optional(), otherwise: Joi.required() })
            .messages({
                'string.empty': 'Account type is required',
                'any.required': 'Account type is required'
            }),
        startDate: Joi.date().iso()
            .when('$isUpdating', { is: true, then: Joi.optional(), otherwise: Joi.required() })
            .messages({
                'date.base': 'Start date must be a valid date',
                'date.format': 'Start date must be in ISO format (YYYY-MM-DD)',
                'any.required': 'Start date is required'
            }),
        maturityDate: Joi.date().iso()
            .when('$isUpdating', { is: true, then: Joi.optional(), otherwise: Joi.required() })
            .messages({
                'date.base': 'Maturity date must be a valid date',
                'date.format': 'Maturity date must be in ISO format (YYYY-MM-DD)',
                'any.required': 'Maturity date is required'
            }),
        tenure: Joi.string()
            .when('$isUpdating', { is: true, then: Joi.optional(), otherwise: Joi.required() })
            .messages({
                'string.empty': 'Tenure is required',
                'any.required': 'Tenure is required'
            }),
        pensionFund: Joi.string()
            .when('$isUpdating', { is: true, then: Joi.optional(), otherwise: Joi.required() })
            .messages({
                'string.empty': 'Pension fund is required',
                'any.required': 'Pension fund is required'
            }),
        investmentOption: Joi.string()
            .when('$isUpdating', { is: true, then: Joi.optional(), otherwise: Joi.required() })
            .messages({
                'string.empty': 'Investment option is required',
                'any.required': 'Investment option is required'
            }),
        investedAmount: Joi.number().positive()
            .when('$isUpdating', { is: true, then: Joi.optional(), otherwise: Joi.required() })
            .messages({
                'number.base': 'Invested amount must be a number',
                'number.positive': 'Invested amount must be a positive number',
                'any.required': 'Invested amount is required'
            }),
        recentlyInvestedAmount: Joi.number().positive()
            .when('$isUpdating', { is: true, then: Joi.optional(), otherwise: Joi.required() })
            .messages({
                'number.base': 'Recently invested amount must be a number',
                'number.positive': 'Recently invested amount must be a positive number',
                'any.required': 'Recently invested amount is required'
            })
    });

    const { error } = schema.validate(req.body, { context: { isUpdating } });

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
};

module.exports = { validateNationalPensionScheme };
