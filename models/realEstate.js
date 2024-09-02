const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RealEstateSchema = new Schema({
    propertyId: {
        type: String,
    },
    srNo: {
        type: Number
    },
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    propertyType: {
        type: String, // e.g., Residential, Commercial, Land
        required: true
    },
    subPropertyType: {
        type: String, // e.g., Office, Showroom, Flat, Apartment, Villa
        required: true
    },
    propertyName: {
        type: String, // e.g., Name of the building, society, etc.
    },
    propertyAddress: {
        type: String, // Full address of the property
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    areaInSquareFeet: {
        type: Number, // Area of the property in square feet
        required: true
    },
    purchasePrice: {
        type: Number, // Original purchase price
        required: true
    },
    currentValue: {
        type: Number, // Current calculated value (based on current price per square foot)
    },
    profit: {
        type: Number, // Profit calculated based on the current value and purchase price
    },
    sector: {
        type: String,
        default: 'Real Estate' // Default sector value for real estate
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'UserModel', // Reference to the user who owns this property
    }
}, { timestamps: true });

const RealEstateModel = mongoose.model('RealEstate', RealEstateSchema);
module.exports = RealEstateModel;
