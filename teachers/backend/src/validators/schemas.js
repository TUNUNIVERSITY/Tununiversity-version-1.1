const Joi = require('joi');

const reportAbsenceSchema = Joi.object({
  student_id: Joi.number().integer().positive().required(),
  session_id: Joi.number().integer().positive().required(),
  absence_type: Joi.string().valid('justified', 'unjustified', 'pending').default('unjustified'),
  reason: Joi.string().max(500).allow('', null),
  supporting_document: Joi.string().max(500).allow('', null),
});

const reviewAbsenceRequestSchema = Joi.object({
  teacher_id: Joi.number().integer().positive().required(),
  review_comment: Joi.string().max(500).allow('', null),
});

const createMakeupSessionSchema = Joi.object({
  teacher_id: Joi.number().integer().positive().required(),
  subject_id: Joi.number().integer().positive().required(),
  group_id: Joi.number().integer().positive().required(),
  room_id: Joi.number().integer().positive().required(),
  session_date: Joi.date().iso().required(),
  start_time: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).required(),
  end_time: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).required(),
  reason: Joi.string().max(500).required(),
  original_session_id: Joi.number().integer().positive().allow(null),
});

const sendMessageSchema = Joi.object({
  sender_id: Joi.number().integer().positive().required(),
  recipient_id: Joi.number().integer().positive().required(),
  subject: Joi.string().max(255).required(),
  content: Joi.string().required(),
  parent_message_id: Joi.number().integer().positive().allow(null),
});

module.exports = {
  reportAbsenceSchema,
  reviewAbsenceRequestSchema,
  createMakeupSessionSchema,
  sendMessageSchema,
};
