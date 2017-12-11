const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let CommentSchema = new Schema({
    description: { type: String, required: true }
});

module.exports = mongoose.model("Comment", CommentSchema);