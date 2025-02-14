import * as argon2 from 'argon2';

async function hashPassword(password: string) {
  return await argon2.hash(password);
}

hashPassword('yelinko02').then(console.log);
