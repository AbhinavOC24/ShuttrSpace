import { Pool } from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log("Starting DB seed...");

  try {
    // 1. Create a dummy user
    const email = "dummy@example.com";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);
    const slug = "dummy_user_" + Math.random().toString(36).substring(2, 6);

    let userId;

    // Check if dummy user already exists
    const userCheck = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      console.log("Dummy user already exists. Using existing dummy user.");
      userId = userCheck.rows[0].id;
    } else {
      const result = await pool.query(
        "INSERT INTO users (name, email, password, slug, bio) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        ["Dummy User", email, hashedPassword, slug, "I am a dummy user to test pagination!"]
      );
      userId = result.rows[0].id;
      console.log("Created dummy user with id:", userId, "and slug:", slug);
    }

    // 2. Generate and insert dummy photos
    const totalPhotos = 100;
    console.log(`Generating ${totalPhotos} dummy photos...`);

    const batchId = "00000000-0000-0000-0000-000000000000"; // Fixed UUID for seed data
    let values: any[] = [];
    let queryPlaceholders: string[] = [];
    for (let i = 0; i < totalPhotos; i++) {
        const offset = i * 13;
        const thumbnailUrl = `https://picsum.photos/seed/${totalPhotos - i}/400/300`;
        const imageUrl = `https://picsum.photos/seed/${totalPhotos - i}/800/600`;
        
        queryPlaceholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13})`);
        
        values.push(
            `Dummy Photo ${i + 1}`, // title
            JSON.stringify(["dummy", "test", "seed", `tag${i % 5}`]), // tags
            "Dummy Location", // location
            "Dummy Camera", // cameraname
            "100", // iso
            "f/2.8", // aperture
            "1/200", // shutterspeed
            "50mm", // lens
            thumbnailUrl, // thumbnail_url
            imageUrl, // image_url
            userId, // user_id
            batchId, // batch_id
            "completed" // status
        );
    }

    const insertQuery = `
      INSERT INTO photos (title, tags, location, cameraname, iso, aperture, shutterspeed, lens, thumbnail_url, image_url, user_id, batch_id, status)
      VALUES ${queryPlaceholders.join(", ")}
    `;

    await pool.query(insertQuery, values);

    console.log(`Successfully seeded ${totalPhotos} photos!`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await pool.end();
  }
}

main();
