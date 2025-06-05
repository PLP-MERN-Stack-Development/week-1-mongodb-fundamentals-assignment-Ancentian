const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db('plp_bookstore');
  const books = db.collection('books');

  // 1. Find all Fiction books
  const fictionBooks = await books.find({ genre: "Fiction" }).toArray();
  console.log("1. Fiction books ",fictionBooks);

  // 2. Find books published after 1950
  const oldBooks = await books.find({ published_year: { $gt: 1950 } }).toArray();
  console.log("2. 1950 Books ",oldBooks);

  // 3. Find books by George Orwell
  const author = await books.find({ author: "George Orwell" }).toArray();
  console.log("3. George Orwell Books ",author);

  // 4. Update price of "Nineteen Eighty-Four"
  const result = await books.updateOne(
    { title: "Nineteen Eighty-Four" },
    { $set: { price: 14.99 } }
  );
  console.log("4. Updated ",result);

  // 5. Delete "The Great Gatsby"
  const deleteResult = await books.deleteOne({ title: "The Great Gatsby" });
  console.log("5. Deleted ",deleteResult);

//Task 3: Advanced Queries
//Write a query to find books that are both in stock and published after 2010
const booksInStock = await books.find({in_stock: true, published_year: { $gt: 2010 } }).toArray();
console.log("Books in stock and published after 2010: ", booksInStock);

//Use projection to return only the title, author, and price fields in your queries
const booksProjection = await books.find({}, { projection: { title: 1, author: 1, price: 1 } }).toArray();
console.log("Books with projection: ", booksProjection);

//Implement sorting to display books by price (both ascending and descending)
// Sort by price in ascending order
const sortedBooksASC = await books.find({},
  {$sort: { price: 1 } } 
).toArray();
console.log("Books sorted by price (ascending): ", sortedBooksASC);

// Sort by price in descending order
const sortedBooksDESC = await books.find({},
  {$sort: { price: -1 } } 
).toArray();
console.log("Books sorted by price (descending): ", sortedBooksDESC);

//Use the limit and skip methods to implement pagination (5 books per page)
const pageSize = 5;
const pageNumber = 1; // Change this to get different pages
const skip = (pageNumber - 1) * pageSize;
const booksPagination = await books.find({}).skip(skip).limit(pageSize).toArray();
console.log("Books with pagination: ", booksPagination);

//Task 4: Aggregation Pipeline

//Create an aggregation pipeline to calculate the average price of books by genre
const avgResult = await books.aggregate([
  { 
      $group: {
      _id: "$genre",
      avgPrice: { $avg: "$price" }
    }
  } ]).toArray();
console.log("Average price of books by genre: ", avgResult);

//Create an aggregation pipeline to find the author with the most books in the collection
const authorCount = await books.aggregate([
  { $group: { _id: "$author", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 1 }
]).toArray();
console.log("Author with the most books: ", authorCount);

//Implement a pipeline that groups books by publication decade and counts them
const decadeCount = await books.aggregate([
  {
    $group: {
      _id: {
        $multiply: [
          { $floor: { $divide: ["$published_year", 10] } },
          10
        ]
      },
      count: { $sum: 1 }
    }
  }
]).toArray();

console.log("Books grouped by publication decade: ", decadeCount);


//Task 5: Indexing

//Create an index on the title field for faster searches
const titleIndex = await books.createIndex({title: 1});
console.log("Index created on title field: ", titleIndex);

//Create a compound index on author and published_year
const compoundIndex = await books.createIndex({author: 1, published_year: 1});
console.log("Compound index created on author and published_year: ", compoundIndex);

//Use the explain() method to demonstrate the performance improvement with your indexes
const titleQueryPlan = await books.find({ title: "The Alchemist"}).explain("executionStats");
console.log("Explain plan for title query: ", titleQueryPlan);

const compoundQueryPlan = await books.find({ author: "Paulo Coelho", published_year: { $gt: 2000 } }).explain("executionStats");
console.log("Explain plan for compound query: ", compoundQueryPlan);
  await client.close();
}

main();
