import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createCipheriv, randomBytes } from 'crypto';

const prisma = new PrismaClient();

function encrypt(plaintext: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

async function main() {
  const key =
    process.env.APP_ENCRYPTION_KEY ||
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  // Clean existing data
  await prisma.credential.deleteMany();
  await prisma.group.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      email: 'admin@ciphervault.sample',
      name: 'Admin',
      passwordHash,
    },
  });

  const cats = await Promise.all([
    prisma.category.create({
      data: { name: 'Infrastructure', color: '#3b82f6', userId: user.id },
    }),
    prisma.category.create({
      data: { name: 'API Keys', color: '#8b5cf6', userId: user.id },
    }),
    prisma.category.create({
      data: { name: 'Databases', color: '#10b981', userId: user.id },
    }),
    prisma.category.create({
      data: { name: 'Finance', color: '#f59e0b', userId: user.id },
    }),
    prisma.category.create({
      data: { name: 'Workspace', color: '#ec4899', userId: user.id },
    }),
  ]);

  const rootGroup = await prisma.group.create({
    data: { name: 'Production', description: 'Production servers', userId: user.id },
  });
  const subGroup = await prisma.group.create({
    data: {
      name: 'AWS',
      description: 'AWS accounts',
      parentId: rootGroup.id,
      userId: user.id,
    },
  });
  await prisma.group.create({
    data: {
      name: 'Staging',
      description: 'Staging environment',
      userId: user.id,
    },
  });

  await prisma.credential.createMany({
    data: [
      {
        title: 'AWS Root Account',
        username: 'admin@company.com',
        encryptedPassword: encrypt('AwsRoot!2026Secure', key),
        url: 'https://console.aws.amazon.com',
        notes: 'Root AWS account — handle with care',
        categoryId: cats[0].id,
        groupId: subGroup.id,
        userId: user.id,
      },
      {
        title: 'GitHub Personal Token',
        username: 'dev-user',
        encryptedPassword: encrypt('ghp_exampleToken123456', key),
        url: 'https://github.com',
        categoryId: cats[1].id,
        groupId: rootGroup.id,
        userId: user.id,
      },
      {
        title: 'PostgreSQL Prod',
        username: 'dbadmin',
        encryptedPassword: encrypt('PgProd#Secure99', key),
        url: 'postgres://db.internal:5432/main',
        categoryId: cats[2].id,
        groupId: rootGroup.id,
        userId: user.id,
      },
      {
        title: 'Stripe Dashboard',
        username: 'finance@company.com',
        encryptedPassword: encrypt('StripeLogin!2026', key),
        url: 'https://dashboard.stripe.com',
        categoryId: cats[3].id,
        userId: user.id,
      },
      {
        title: 'Slack Workspace',
        username: 'ops-team',
        encryptedPassword: encrypt('SlackPass#Team', key),
        url: 'https://company.slack.com',
        categoryId: cats[4].id,
        userId: user.id,
      },
    ],
  });

  console.log('Seed complete.');
  console.log('Login: admin@ciphervault.sample / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
