import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  AuthToken: {
    type: String,
  },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
