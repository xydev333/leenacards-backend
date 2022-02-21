import Joi from 'joi';

export default {
  body: {
    access_token: Joi.string().required(),
  }
};