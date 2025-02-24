// const { PrismaClient } = require('@prisma/client');
// const natural = require('natural');
// const cosineSimilarity = require('cosine-similarity');

// const prisma = new PrismaClient();

// // Fetch past queries for a specific userId
// async function fetchPastQueries(userId) {
//   try {
//     // Fetch queries for the given userId
//     const queries = await prisma.query.findMany({
//       where: { userId: userId }, // Filter queries by userId
//       select: { query: true },
//     });
//     return queries.reverse().map((q) => q.query); // Extract query strings
//   } catch (error) {
//     console.error('Error fetching queries from DB:', error);
//     return [];
//   }
// }

// // Generate related queries dynamically based on existing queries for a specific userId
// async function generateRelatedQueries(userId) {
//   const pastQueries = await fetchPastQueries(userId);
  
//   if (pastQueries.length === 0) {
//     return [];  // No queries in the database for this user
//   }

//   // Extract keywords from past queries (TF-IDF)
//   const keywords = extractKeywords(pastQueries);

//   // Generate dynamic variations based on semantic similarities
//   const relatedQueries = generateDynamicQueries(keywords, pastQueries);

//   return relatedQueries;
// }

// // Extract keywords using TF-IDF from the queries
// function extractKeywords(queries) {
//   const tfidf = new natural.TfIdf();
//   queries.forEach(query => tfidf.addDocument(query));

//   const keywords = new Set();
  
//   queries.forEach(query => {
//     let queryKeywords = [];
//     tfidf.tfidfs(query, (i, measure) => {
//       if (measure > 0.1) {  // Threshold to consider significant words
//         queryKeywords.push(tfidf.listTerms(i).map(term => term.term));
//       }
//     });
//     queryKeywords = queryKeywords.flat();
//     queryKeywords.forEach(keyword => keywords.add(keyword));
//   });

//   return Array.from(keywords);
// }

// // Generate dynamic related queries based on semantic relationships and query structure
// function generateDynamicQueries(keywords, pastQueries) {
//   const relatedQueries = [];
  
//   // Find similarity between past queries and generate new ones
//   pastQueries.forEach((query) => {
//     keywords.forEach((keyword) => {
//       if (query.toLowerCase().includes(keyword.toLowerCase())) {
//         // Generate variations of the query dynamically
//         relatedQueries.push(`Can you tell me more about ${keyword}?`);
//         // relatedQueries.push(`Why is ${keyword} important?`);
//         // relatedQueries.push(`What are the main facts about ${keyword}?`);
//         // relatedQueries.push(`What are some popular activities related to ${keyword}?`);
//       }
//     });
//   });

//   return relatedQueries;
// }

// // Example: Generate related queries for a specific user
// export async function POST(userId) {
//   const relatedQueries = await generateRelatedQueries(userId);
//   console.log('Generated related queries:', relatedQueries);
// }
import { PrismaClient } from "@prisma/client";
import natural from "natural";
import cosineSimilarity from "cosine-similarity";

const prisma = new PrismaClient();

// Fetch past queries for a specific userId
async function fetchPastQueries(userId) {
  try {
    const queries = await prisma.query.findMany({
      where: { userId },
      select: { query: true },
    });
    return queries.reverse().map((q) => q.query);
  } catch (error) {
    console.error("Error fetching queries from DB:", error);
    return [];
  }
}

// Generate related queries dynamically based on existing queries for a specific userId
async function generateRelatedQueries(userId) {
  const pastQueries = await fetchPastQueries(userId);

  if (pastQueries.length === 0) {
    return []; // No queries in the database for this user
  }

  const keywords = extractKeywords(pastQueries);
  return generateDynamicQueries(keywords, pastQueries);
}

// Extract keywords using TF-IDF from the queries
function extractKeywords(queries) {
  const tfidf = new natural.TfIdf();
  queries.forEach((query) => tfidf.addDocument(query));

  const keywords = new Set();

  queries.forEach((query, index) => {
    tfidf.listTerms(index).forEach((term) => {
      if (term.tfidf > 0.1) {
        keywords.add(term.term);
      }
    });
  });

  return Array.from(keywords);
}

// Generate dynamic related queries based on semantic relationships and query structure
function generateDynamicQueries(keywords, pastQueries) {
  const relatedQueries = new Set();

  pastQueries.forEach((query) => {
    keywords.forEach((keyword) => {
      if (query.toLowerCase().includes(keyword.toLowerCase())) {
        relatedQueries.add(`Can you tell me more about ${keyword}?`);
      }
    });
  });

  return Array.from(relatedQueries);
}

// Handle POST request in Vercel's serverless format
export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const relatedQueries = await generateRelatedQueries(userId);

    return new Response(
      JSON.stringify({ relatedQueries }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating related queries:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
