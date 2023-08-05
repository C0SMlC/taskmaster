const mongoose = require('mongoose');
const crypto = require('crypto');

const AuthenticateEmailSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
  },
  UID: {
    type: String,
  },
  expiresIn: {
    type: Date,
    default: Date.now() + 24 * 60 * 60 * 1000,
  },
});

AuthenticateEmailSchema.methods.createEmailVerificationToken = function () {
  // generating a random 32 bytes number
  const resetToken = crypto.randomBytes(32).toString('hex');

  // enxrypting the token with sha256
  this.UID = crypto.createHash('sha256').update(resetToken).digest('hex');

  console.log(this.UID);
  return resetToken;
};

const AuthenticateEmail = mongoose.model(
  'AuthenticateEmail',
  AuthenticateEmailSchema,
);

module.exports = AuthenticateEmail;
