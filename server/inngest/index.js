import { Inngest } from "inngest";
import User from "../models/User.js";

// Create the Inngest client
export const inngest = new Inngest({ id: "my-app" });

// Save user data to the database
const syncUserCreation = inngest.createFunction(
  { id: 'sync-user-from-clerk' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    try {
      console.log("Received user.created event:", event);

      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      let username = email_addresses[0].email_address.split('@')[0];

      let existingUser = await User.findOne({ username });
      while (existingUser) {
        username = username + Math.floor(Math.random() * 10000);
        existingUser = await User.findOne({ username });
      }

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        full_name: first_name + " " + last_name,
        profile_picture: image_url,
        username
      };

      const createdUser = await User.create(userData);
      console.log("User created in DB:", createdUser);
    } catch (err) {
      console.error("Error creating user:", err.message);
    }
  }
);


// Update user data in the database
const syncUserUpdation = inngest.createFunction(
  { id: 'update-user-from-clerk' },
  { event: 'clerk/user.updated' },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const updatedUserData = {
        email: email_addresses[0].email_address,
        full_name: first_name + " " + last_name,
        profile_picture: image_url
      };

      await User.findByIdAndUpdate(id, updatedUserData);
      console.log("User updated:", id);
    } catch (err) {
      console.error("Error updating user:", err);
    }
  }
);

// Delete user from the database
const syncUserDeletion = inngest.createFunction(
  { id: 'delete-user-with-clerk' },
  { event: 'clerk/user.deleted' },
  async ({ event }) => {
    try {
      const { id } = event.data;
      await User.findByIdAndDelete(id);
      console.log("User deleted:", id);
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  }
);

// Export all Inngest functions
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion
];
