const mongoose = require('mongoose');

const dislikeSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: String,
    userAvatar: String,
    category: { type: String, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

dislikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Dislike', dislikeSchema);
