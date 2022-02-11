const mongoose = require("mongoose");

let noteSchema = new mongoose.Schema({
  title: String,
  body: String,
  date_created: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

noteSchema.index({'title':'text', 'body':'text'})

module.exports = mongoose.model('Note', noteSchema);