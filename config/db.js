const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});


prisma
  .$connect()
  .then(async () => {
    console.log("Prisma connected successfully");
  })
  .catch((error) => {
    console.error("Error connecting to Prisma:", error);
  });

module.exports = prisma;


//The above code is wrong for vercel deployment. The correct code is below: 
// const { PrismaClient } = require("@prisma/client");

// let prisma;

// if (process.env.NODE_ENV === "production") {
//   prisma = new PrismaClient();
// } else {
//   if (!global.prisma) {
//     global.prisma = new PrismaClient();
//   }
//   prisma = global.prisma;
// }

// module.exports = prisma;
