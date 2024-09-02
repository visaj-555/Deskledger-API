const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AreaPriceSchema = new Schema({
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true  
    },
    areaName: {
        type: String, // Name of the area, neighborhood, etc.
        required: true
    },
    pricePerSquareFoot: {
        type: Number, // Current price per square foot in this area
        required: true
    }
}, { timestamps: true });

const AreaPriceModel = mongoose.model('AreaPrice', AreaPriceSchema);
module.exports = AreaPriceModel;
