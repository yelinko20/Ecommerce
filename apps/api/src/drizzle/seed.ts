import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema/index';
import { faker } from '@faker-js/faker';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

const db = drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;

const BATCH_SIZE = 10;

async function createFakerUser() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    firstName,
    lastName,
    userName: faker.internet.username({ firstName, lastName }),
    email: faker.internet.email({ firstName, lastName }),
    isActive: faker.datatype.boolean(),
    isSuperUser: faker.datatype.boolean(),
    phone: faker.phone.number({ style: 'national' }),
    gender: faker.helpers.arrayElement(['male', 'female', 'other']),
    birthDate: faker.date.birthdate(),
    address: faker.location.streetAddress(),
    hashedPassword: faker.internet.password({ memorable: true }),
    role: faker.helpers.arrayElement(['USER', 'ADMIN']),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: faker.datatype.boolean() ? new Date() : null,
    createdBy: faker.string.uuid(),
    updatedBy: faker.string.uuid(),
    lastLogin: faker.datatype.boolean() ? new Date() : null,
    failedLoginAttempts: faker.number.int({ min: 0, max: 5 }),
  };
}

async function seedUsers(batchSize: number) {
  console.log('🚀 Seeding users...');
  const users = await Promise.all(
    Array.from({ length: batchSize }, createFakerUser),
  );

  try {
    const insertedUsers = await db.transaction(async (trx) => {
      return trx
        .insert(schema.User)
        .values(users)
        .returning({ id: schema.User.id });
    });

    console.log(`✅ Inserted ${insertedUsers.length} users`);
    return insertedUsers.map((u) => u.id);
  } catch (error) {
    console.error('❌ Error inserting users:', error);
    return [];
  }
}

async function seedTokens(userIds: string[], batchSize: number) {
  console.log('🔑 Seeding tokens...');
  const tokens = Array.from({ length: batchSize }).map(() => ({
    token: faker.internet.jwt(),
    expiredAt: faker.date.future(),
    userId: faker.helpers.arrayElement(userIds),
  }));

  try {
    const insertedTokens = await db.transaction(async (trx) => {
      return trx.insert(schema.Token).values(tokens).returning();
    });

    console.log(`✅ Inserted ${insertedTokens.length} tokens`);
  } catch (error) {
    console.error('❌ Error inserting tokens:', error);
  }
}

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Insert users in batches
    const userIds: string[] = [];
    for (let i = 0; i < 50 / BATCH_SIZE; i++) {
      const batchUserIds = await seedUsers(BATCH_SIZE);
      userIds.push(...batchUserIds);
    }

    // Insert tokens in batches
    if (userIds.length > 0) {
      for (let i = 0; i < 50 / BATCH_SIZE; i++) {
        await seedTokens(userIds, BATCH_SIZE);
      }
    }

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🛑 Database connection closed.');
  }
}

main();
