const mongoose = require('mongoose')


const docSchema = new mongoose.Schema({
    // name: { type: String, required: true },
    // email: { type: String, required: true, unique: true },
    // password: { type: String, required: true },

     user:{
         type:mongoose.Schema.Types.ObjectId,
         ref:'User',
         required:true
        },


    photo: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
    address: { type: Object, required: true },
    date: { type: Number, required: true },
}, { minimize: false },
{
    timestamps: true
}


)

const docModel = mongoose.models.doctor || mongoose.model("doctor", docSchema);
module.exports = docModel;