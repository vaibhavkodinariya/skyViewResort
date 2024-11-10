const mongoose = require("mongoose");
const Users = require("../src/models/user.model");

// Default user data for the application's user collection
const defaultUserData = {
  name: "Vaibhav",
  email: "vaibhav@gmail.com",
  password: "vaibhav@123", // Consider hashing this in a real application
  role: "bhagwan",
};

(async function initMongo() {
  try {
    console.log("URI", process.env.MONGO_URI);
    // Connect to MongoDB using Mongoose
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB.");

    const adminDb = mongoose.connection.db.admin();

    // Check if the MongoDB user exists
    const userExists = await adminDb.command({
      usersInfo: process.env.MONGOUSER,
    });

    if (userExists.users.length > 0) {
      console.log(
        `MongoDB user '${process.env.MONGOUSER}' already exists. No changes made.`
      );
    } else {
      // Create the MongoDB user with specified role and permissions
      await adminDb.command({
        createUser: process.env.MONGOUSER,
        pwd: process.env.MONGOPWD,
        roles: [{ role: "readWrite", db: process.env.DATABASE }],
      });
      console.log(
        `MongoDB user '${process.env.MONGOUSER}' created with role readWrite on database '${process.env.DATABASE}'.`
      );
    }
    try {
      const targetDb = mongoose.connection.useDb(process.env.DATABASE);
      const User = targetDb.model("User", Users.schema);

      const defaultUserExists = await User.findOne({
        email: defaultUserData.email,
      });

      if (defaultUserExists) {
        console.log("Default user already exists. No changes made.");
      } else {
        // Create the default user
        const defaultUser = new Users(defaultUserData);
        await defaultUser.save();
        console.log("Default user created:", defaultUserData.username);
      }
    } catch (error) {
      console.error("Error in Create Default User", error);
    }
  } catch (error) {
    console.error("Error initializing MongoDB or application user:", error);
  } finally {
    // Disconnect Mongoose
    await mongoose.disconnect();
  }
})();
