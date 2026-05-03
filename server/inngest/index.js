import { Inngest } from "inngest";
import User from "../models/User.js";

export const inngest = new Inngest({ id: "pingup-app" });

// 🔥 Sync user from Clerk
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk.user.created" },

  async ({ event }) => {
    const data = event.data;

    const email = data.email_addresses?.[0]?.email_address;

    if (!email) {
      throw new Error("No email found in Clerk event");
    }

    let username = email.split("@")[0];

    // 🔍 Check if username exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      username = username + Math.floor(Math.random() * 10000);
    }

    const userData = {
      _id: data.id,
      email,
      full_name: `${data.first_name || ""} ${data.last_name || ""}`,
      profile_picture: data.image_url,
      username,
    };

    await User.create(userData);

    console.log("User synced ✅");
  }
);
// 🔄 Update user from Clerk
const syncUserUpdate = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk.user.updated" },

  async ({ event }) => {
    const data = event.data;

    const email = data.email_addresses?.[0]?.email_address;

    if (!email) {
      throw new Error("No email found in Clerk event");
    }

    const updatedData = {
      email,
      full_name: `${data.first_name || ""} ${data.last_name || ""}`,
      profile_picture: data.image_url,
    };

    // 🔥 Update user in DB
    await User.findByIdAndUpdate(
      data.id,          // Clerk user id = Mongo _id
      updatedData,
      { new: true }     // return updated doc
    );

    console.log("User updated ✅");
  }
);

// ❌ Delete user from DB when removed from Clerk
const syncUserDelete = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk.user.deleted" },

  async ({ event }) => {
    const userId = event.data.id;

    if (!userId) {
      throw new Error("User ID not found in event");
    }

    // 🔥 Delete user from MongoDB
    await User.findByIdAndDelete(userId);

    console.log("User deleted ✅");
  }
);

export const functions = [syncUserCreation, syncUserUpdate, syncUserDelete];