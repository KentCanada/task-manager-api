const mongoose = require('mongoose');

const tasksSchema = new mongoose.Schema ({
    title: {type: true, required: true},
    description: {type: true},
    status: {type: String, enum: ['pending', 'done'], default: 'pending'},
    dueDate: {type: Date},
    owner: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true}
}, {timeStamp: true});

module.exports = mongoose.model('Task', tasksSchema);