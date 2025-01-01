const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/VoyageVista";

main()
  .then(() => {
    console.log("Database Connected!");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// const initDB = async () => {
//   await Listing.deleteMany({});
//   initData.data = initData.data.map((obj) => ({
//     ...obj,
//     owner: "676ebbce774745ed2a2ed11e",
//   }));
//   await Listing.insertMany(initData.data);
//   //console.log(initData.data);
//   console.log("Data was initialized.");
// };



const initDB = async () => {
  try {

      await Listing.updateMany(
          { category: { $exists: false } }, // Only update documents without 'category'
          { $set: { category: "Trending" } } // Add a default category
      );

      console.log("Existing listings updated with default category.");

      // Map over the data and ensure geometry/owner fields exist
      const dataToInsert = initData.data.map((obj) => ({
          ...obj,
          owner: "676ebbce774745ed2a2ed11e", // Default owner ID
      }));

      // Insert only new listings (avoid duplicates)
      for (const newListing of dataToInsert) {
          await Listing.updateOne(
              { title: newListing.title }, // Match on unique field like title
              { $setOnInsert: newListing }, // Only insert if it doesn't exist
              { upsert: true } // Upsert = Update if exists, Insert if it doesn't
          );
      }

      console.log("Database initialized with new listings.");
  } catch (err) {
      console.error("Error initializing database:", err);
  } finally {
      mongoose.connection.close();
  }
};

initDB();
