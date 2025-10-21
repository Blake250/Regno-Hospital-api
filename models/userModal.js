const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
  




const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:[true, "Enter A Valid Email"],
        trim:true,
        match:[
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter A valid email"
        ],
      
    },

    role:{
        type:String,
        required:true,
                default:'customer',
    
        enum:['customer','admin','doctor'],
        
    },
  photo:{
        type:String,
        default: "https://i.ibb.co/b2p7x2P/dpPhoto.jpg",
    },
    phone:{
        type:String,
        default:'+23480616126'
    },
     address:{
     
      type:Object,
       // required:true,
      
            line1:{
                type:String,
                 default:''},

            line2:{
                type:String, 
                default:''}
    
      
            },
    gender: {
 
      type: String,
       enum: ['Male', 'Female', 'Not Selected'],   
  // default: 'Not Selected',
      },
 
      
    dob:{
        type:String,
      // default:''
    },
    password:{
        type:String,
        required:[true, 'Please, Enter A Valid Password'],
        minLength:[6, 'password must be 6 characters and above'],
        //select: false,

    },
   

},

{
    timestamps: true
},

  
)

userSchema.pre('save',async function(next) {
    if(!this.isModified('password')){
        return next()
    }
    const salt = await  bcrypt.genSalt(10)
    const hashPassword= await  bcrypt.hash(this.password, salt)
    this.password = hashPassword
    next()
}
)   

const User = mongoose.model('User', userSchema)
module.exports = User


