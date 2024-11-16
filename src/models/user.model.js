const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // For password hashing
const { paginate, toJSON } = require("./plugins");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        "admin",
        "waiter",
        "bhagwan",
        "hotelManager",
        "restaurantManager",
        "gamezoneManager",
      ],
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: hideSensitiveFields },
    toObject: { virtuals: true, transform: hideSensitiveFields },
  }
);

// Helper function to hide fields
function hideSensitiveFields(doc, ret, options) {
  delete ret.password;
  delete ret.isActive;
  delete ret._id;
  return ret;
}

// Password Hashing before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};
userSchema.plugin(toJSON);
userSchema.plugin(paginate);
const User = mongoose.model("User", userSchema);

module.exports = User;
