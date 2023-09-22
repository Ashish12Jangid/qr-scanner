const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    name: String,
    qrId: mongoose.Types.ObjectId,
});

module.exports = mongoose.model('Link', linkSchema);