const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let LocationSchema = new Schema({
    zipCode: { type: Number, required: true },
    country: { type: String },
    state: { type: String },
    city: { type: String }
});

module.exports = mongoose.model("Location", LocationSchema);