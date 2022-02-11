const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date_created: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now},
});

userSchema.pre('save', function(next)  {
    if(this.isNew || this.isModified('password')){
        const document = this;
        bcrypt.hash(this.password, 10, (err, hashed) => {
            if(err){
                next(err)
            }else{
                this.password = hashed;
                next();
            }
        })
    }
})

userSchema.methods.isCorrectPassword = function (password, callback ) {
    bcrypt.compare(password, this.password, function (err, same) {
        if(err)
            callback(err);
        else
            callback(err, same)
    })
}
module.exports = mongoose.model('User', userSchema)