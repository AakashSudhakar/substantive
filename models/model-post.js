const mongoose = require("mongoose");
const Location = require("./model-location");
let Schema = mongoose.Schema;

let PostSchema = new Schema({
    subject:        { type: String, required: true }, 
    classification: { type: String, required: true },
    keywords:       { type: String },
    description:    { type: String, required: true },
});

module.exports = mongoose.model("Post", PostSchema);