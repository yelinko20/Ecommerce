import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema/index';
import { faker } from '@faker-js/faker';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;

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
    gender: ['male', 'female', 'other'][
      faker.number.int({ min: 0, max: 2 })
    ] as 'male' | 'female' | 'other',
    birthDate: faker.date.birthdate(),
    address: faker.location.streetAddress(),
    hashedPassword: faker.internet.password({ memorable: true }),
    role: ['USER', 'ADMIN'][faker.number.int({ min: 0, max: 1 })] as
      | 'USER'
      | 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: faker.datatype.boolean() ? new Date() : null,
    createdBy: faker.string.uuid(),
    updatedBy: faker.string.uuid(),
    lastLogin: faker.datatype.boolean() ? new Date() : null,
    failedLoginAttempts: faker.number.int({ min: 0, max: 5 }),
  };
}

async function main() {
  const userIds = await Promise.all(
    Array(50)
      .fill(null)
      .map(async () => {
        const fakerUser = await createFakerUser();
        return db.transaction(async (trx) => {
          const user = await trx
            .insert(schema.User)
            .values(fakerUser)
            .returning();
          return user[0].id;
        });
      }),
  );

  await Promise.all(
    Array(50)
      .fill(null)
      .map(async () => {
        const fakerToken = {
          token: faker.internet.jwt(),
          expiredAt: faker.date.future(),
          userId: faker.helpers.arrayElement(userIds),
        };
        return db.transaction(async (trx) => {
          const token = await trx
            .insert(schema.Token)
            .values(fakerToken)
            .returning();
          return token[0].id;
        });
      }),
  );
}

main()
  .then(() => console.log('Seeding completed successfully'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
