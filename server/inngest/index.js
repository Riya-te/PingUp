import { Inngest } from "inngest";
import User from "../models/User.js";

export const inngest = new Inngest({ id: "pingup-app" });

// 🔥 CREATE USER
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: [{ event: "clerk.user.created" }],
  },

  async ({ event }) => {
    const data = event.data;

    const email = data.email_addresses?.[0]?.email_address;
    if (!email) throw new Error("No email found");

    let username = email.split("@")[0];

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      username += Math.floor(Math.random() * 10000);
    }

    await User.create({
      _id: data.id,
      email,
      full_name: `${data.first_name || ""} ${data.last_name || ""}`,
      profile_picture: data.image_url,
      username,
    });

    console.log("User created ✅");
  }
);

// 🔄 UPDATE USER
const syncUserUpdate = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: [{ event: "clerk.user.updated" }],
  },

  async ({ event }) => {
    const data = event.data;

    const email = data.email_addresses?.[0]?.email_address;
    if (!email) throw new Error("No email found");

    await User.findByIdAndUpdate(
      data.id,
      {
        email,
        full_name: `${data.first_name || ""} ${data.last_name || ""}`,
        profile_picture: data.image_url,
      },
      { new: true }
    );

    console.log("User updated ✅");
  }
);

// ❌ DELETE USER
const syncUserDelete = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: [{ event: "clerk.user.deleted" }],
  },

  async ({ event }) => {
    const userId = event.data.id;

    if (!userId) throw new Error("User ID missing");

    await User.findByIdAndDelete(userId);

    console.log("User deleted ✅");
  }
);

// ✅ EXPORT
export const functions = [
  syncUserCreation,
  syncUserUpdate,
  syncUserDelete,
];