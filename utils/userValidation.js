const Joi = require('joi');

const userRegisterValidate = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().min(3).max(100).required(),
    lastName: Joi.string().min(3).max(100).required(),
    phoneNo: Joi.string().length(10).pattern(/^[0-9]+$/).required(), // Adjusted to handle 10 digits correctly
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.ref('password')
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
}

const userLoginValidate = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
}

module.exports = {
  userRegisterValidate, 
  userLoginValidate
}
