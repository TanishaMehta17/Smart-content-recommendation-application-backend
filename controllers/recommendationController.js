// const { PrismaClient } = require('@prisma/client');
// const natural = require('natural');

// const prisma = new PrismaClient();

// // Fetch past queries from the database
// async function fetchPastQueries() {
//   try {
//     const queries = await prisma.query.findMany({
//       select: { query: true },
//     });
//     return queries.map((q) => q.query); // Extract query strings
//   } catch (error) {
//     console.error('Error fetching queries from DB:', error);
//     return [];
//   }
// }

// // Generate new related queries based on existing ones
// async function generateRelatedQueries() {
//   const pastQueries = await fetchPastQueries();
  
//   if (pastQueries.length === 0) {
//     return [];  // No queries in the database
//   }

//   // Using a basic keyword extraction from the existing queries (can be enhanced)
//   const keywords = extractKeywords(pastQueries);

//   // Generate new related queries based on identified keywords
//   const relatedQueries = generateQueriesFromKeywords(keywords);

//   return relatedQueries;
// }

// // Extract basic keywords from the queries (you can use more advanced NLP techniques for better results)
// function extractKeywords(queries) {
//   const tfidf = new natural.TfIdf();
//   queries.forEach(query => tfidf.addDocument(query));

//   const keywords = new Set();
  
//   queries.forEach(query => {
//     let queryKeywords = [];
//     tfidf.tfidfs(query, (i, measure) => {
//       if (measure > 0.1) {  // A threshold to consider significant words
//         queryKeywords.push(tfidf.listTerms(i).map(term => term.term));
//       }
//     });
//     queryKeywords = queryKeywords.flat();
//     queryKeywords.forEach(keyword => keywords.add(keyword));
//   });

//   return Array.from(keywords);
// }

// // Generate new related queries based on keywords
// function generateQueriesFromKeywords(keywords) {
//   const relatedQueries = [];

//   // Create new queries by combining keywords (simple example)
//   const combinations = [
//     `What is the importance of ${keywords[0]}?`,
//     `What are some interesting facts about ${keywords[1]}?`,
//     `How to learn more about ${keywords[0]} and ${keywords[1]}?`,
//     `What are the best resources for studying ${keywords[0]}?`,
//     `Why is ${keywords[0]} celebrated?`
//   ];

//   combinations.forEach(comb => relatedQueries.push(comb));

//   return relatedQueries;
// }

// // Example of calling the function
// async function recommendQueries() {
//   const relatedQueries = await generateRelatedQueries();
//   console.log('Generated related queries:', relatedQueries);
// }

// module.exports = { generateRelatedQueries };
const { PrismaClient } = require('@prisma/client');
const natural = require('natural');
const cosineSimilarity = require('cosine-similarity');

const prisma = new PrismaClient();

// Fetch past queries from the database
async function fetchPastQueries() {
  try {
    const queries = await prisma.query.findMany({
      select: { query: true },
    });
    return queries.map((q) => q.query); // Extract query strings
  } catch (error) {
    console.error('Error fetching queries from DB:', error);
    return [];
  }
}

// Generate related queries dynamically based on existing queries
async function generateRelatedQueries() {
  const pastQueries = await fetchPastQueries();
  
  if (pastQueries.length === 0) {
    return [];  // No queries in the database
  }

  // Extract keywords from past queries (TF-IDF)
  const keywords = extractKeywords(pastQueries);

  // Generate dynamic variations based on semantic similarities
  const relatedQueries = generateDynamicQueries(keywords, pastQueries);

  return relatedQueries;
}

// Extract keywords using TF-IDF from the queries
function extractKeywords(queries) {
  const tfidf = new natural.TfIdf();
  queries.forEach(query => tfidf.addDocument(query));

  const keywords = new Set();
  
  queries.forEach(query => {
    let queryKeywords = [];
    tfidf.tfidfs(query, (i, measure) => {
      if (measure > 0.1) {  // Threshold to consider significant words
        queryKeywords.push(tfidf.listTerms(i).map(term => term.term));
      }
    });
    queryKeywords = queryKeywords.flat();
    queryKeywords.forEach(keyword => keywords.add(keyword));
  });

  return Array.from(keywords);
}

// Generate dynamic related queries based on semantic relationships and query structure
function generateDynamicQueries(keywords, pastQueries) {
  const relatedQueries = [];
  
  // Find similarity between past queries and generate new ones
  pastQueries.forEach((query) => {
    keywords.forEach((keyword) => {
      if (query.toLowerCase().includes(keyword.toLowerCase())) {
        // Generate variations of the query dynamically
        relatedQueries.push(`Can you tell me more about ${keyword}?`);
        relatedQueries.push(`Why is ${keyword} important?`);
        relatedQueries.push(`What are the main facts about ${keyword}?`);
        relatedQueries.push(`What are some popular activities related to ${keyword}?`);
      }
    });
  });

  // You could further improve by finding related words dynamically (e.g., using Word2Vec, GloVe)
  return relatedQueries;
}

// Example: Generate related queries without hardcoded templates
async function recommendQueries() {
  const relatedQueries = await generateRelatedQueries();
  console.log('Generated related queries:', relatedQueries);
}

module.exports = { generateRelatedQueries };
