const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    name: String,
    qrId: mongoose.Types.ObjectId,
    link: String
});

module.exports = mongoose.model('Link', linkSchema);