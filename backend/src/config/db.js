// Prisma Client baglantisi - tum uygulama boyunca tek bir instance kullanilir
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;