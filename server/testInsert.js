import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const connectDB = async () => {
  await mongoose.connect(`${process.env.MONGODB_URL}/pingup`);
  console.log("DB connected");
};

const run = async () => {
  await connectDB();

  try {
    const dummyUser = {
      _id: "dummy456",
      email: "dummy@example.com",
      full_name: "Dummy User",
      username: "dummyuser123",
      profile_picture: ""
    };

    const user = await User.create(dummyUser);
    console.log("User inserted successfully:", user);
  } catch (err) {
    console.error("Error inserting user:", err.message);
  } finally {
    mongoose.disconnect();
  }
};

run();
