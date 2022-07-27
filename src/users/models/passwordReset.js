const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passwordResetSchema = new Schema({
    userId: String, 
    resetString: String, 
    createdAt: Date, 
    expiresAt: Date,
});

const passwordReset = mongoose.model('passwordReset', passwordResetSchema);

module.exports= passwordReset;

