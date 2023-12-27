const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSession = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  title: {
    type: String,
  },
  messages: [
    {
      from: {
        type: String,
        enum: ['user', 'system']
      },
      to: {
        type: String,
        enum: ['user', 'system']
      },
      content:  {
        type: String,
      },
      createdAt: {
        type: Date,
        default: ()=> (new Date()).toISOString()
      }
    }
  ]
}, {
    timestamps: true,
});
module.exports = mongoose.model("ChatSession", ChatSession);