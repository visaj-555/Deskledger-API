const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
    cityName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    state_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        required: true
    }
});

module.exports = mongoose.model('City', CitySchema);


