const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log("Locating NGO user...");
  let user = await prisma.user.findUnique({
    where: { email: "nehaareddy02@gmail.com" },
    include: { ngo: true }
  });

  if (!user) {
    console.error("NGO user not found in DB.");
    process.exit(1);
  }

  // Ensure NGO is APPROVED to unlock target agent funding
  if (user.ngo.status !== "APPROVED") {
    console.log(`Setting NGO status to APPROVED (was ${user.ngo.status})...`);
    await prisma.nGO.update({
      where: { id: user.ngo.id },
      data: { status: "APPROVED" }
    });
  }

  console.log("NGO User is APPROVED. Requesting auth token from login endpoint...");
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "nehaareddy02@gmail.com",
      password: "password123"
    })
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    console.error("Login failed:", loginData);
    process.exit(1);
  }

  const token = loginData.token;
  console.log("Logged in successfully. Token acquired. Sending chat query...");

  const chatRes = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      message: "I need funding for my NGO."
    })
  });

  const chatData = await chatRes.json();
  console.log("Response status:", chatRes.status);
  console.log("Response JSON Schema Keys:", Object.keys(chatData));
  if (chatData.results) {
    console.log("Response Results Keys:", Object.keys(chatData.results));
  }
  
  console.log("\n=================== TOP LEVEL STRUCTURED RESPONSE ===================");
  console.log("Matched Grants Count:", chatData.matchedGrants?.length);
  console.log("First Matched Grant Name:", chatData.matchedGrants?.[0]?.name);
  console.log("Recommended Grant Name:", chatData.recommendedGrant?.name);
  console.log("Recommended Grant Match Percentage:", chatData.recommendedGrant?.matchPercentage);
  console.log("Next Steps:", chatData.nextSteps);
  console.log("AI Recommendation Preview:\n", chatData.aiRecommendation?.substring(0, 400), "...");
  console.log("======================================================================\n");
}

test()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
