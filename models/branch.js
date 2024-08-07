const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BranchSchema = new Schema({
    branchName: {
        type: String,
        required: true
        }, 
    state_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank',
        required: true
        }
}, { timestamps: true });

const BranchModel = mongoose.model('Branch', BranchSchema);
module.exports = BranchModel;
