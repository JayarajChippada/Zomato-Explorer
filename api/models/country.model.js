import mongoose from 'mongoose';

const countrySchema = new mongoose.Schema({
    code: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    }
})

const Country = mongoose.model("Country", countrySchema);
export default Country;