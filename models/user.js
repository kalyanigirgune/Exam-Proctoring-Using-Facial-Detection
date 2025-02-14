const { createHmac, randomBytes } = require("crypto");
const { Schema, model } = require('mongoose');
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        salt: {
            type: String,
            
        },
        password: {
            type: String,
            required: true,
        },
        profileImageURL: {
            type: String,
            default: "/images/default.png",
        },
        role: {
            type: String,
            enum: ["USER", "ADMIN"],
            default: "USER",
        }
    },
    { timestamps: true }
);

userSchema.pre('save', function (next) {
    const user = this;

    // Check if the password has been modified or is new
    if (!user.isModified("password")) {
        console.log("Password not modified, skipping hashing.");
        return next();
    }

    // Generate salt and hash the password
    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256', salt).update(user.password).digest("hex");

    console.log("Salt:", salt);
    console.log("Hashed Password:", hashedPassword);

    // Assign the generated salt and hashed password to the document
    user.salt = salt;
    user.password = hashedPassword;

    console.log("User after setting salt and password:", user);

    // Proceed to the next middleware
    next();
});

userSchema.static('matchPasswordAndGenerateToken', async function(email,password){
    const user = await this.findOne({email});
    if(!user)  throw new Error('user not found');
    
    //console.log(user);
    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac('sha256', salt).update(password).digest("hex");
    if(hashedPassword !== userProvidedHash)throw new Error('password not match');
    
    const token = createTokenForUser(user);
    return token;
});

const User = model('User', userSchema);

module.exports = User;
