import express from "express"
import bodyParser from "body-parser";
import axios from "axios"
import pg from "pg"
import env from "dotenv";
import pool from "./db/pool.js";



const app = express();
const port = process.env.PORT ||3000;
env.config();



const pool = new pg.Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database:process.env.DB_DATABASE,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    
});

export default pool;


db.connect();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

let books =[{
    id:3,title:"Atomic Habits",author:"James Clear",
    rating:5,notes:"nice book",date_read:"2025-08-10",
}]

app.get("/",async (req,res)=>{
try{
const input = await db.query("SELECT * FROM books ORDER BY id ASC");
const books =input.rows
   books.forEach(book => {
     book.cover_url = `https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title)}-M.jpg`;
    }); 
    res.status(200).render("index.ejs", {books});
}

catch(err){
    console.log(err)
    res.status(500).send("Internal server error");
}
});

app.get("/add",(req,res)=>{
res.render("new.ejs");
});

app.get("/update",(req,res)=>{
    res.render("update.ejs");
});

// async function getCoverUrl(title) {
//   // Encode title for URL
//   const encodedTitle = encodeURIComponent(title);
//   // Open Library cover URL format by title
//   return `https://covers.openlibrary.org/b/title/${encodedTitle}-M.jpg`;
// }


app.post("/add",async(req,res)=>{
    try{
 const { title, author, rating, notes} = req.body;
//  const cover = await getCoverUrl(title);
 const date_read = new Date().toISOString().split("T")[0];
    
  await db.query(
    "INSERT INTO books (title, author, rating, notes, date_read) VALUES ($1, $2, $3, $4, $5)",
    [title, author, rating, notes, date_read]
    );
    console.log("result:",{title, author, rating, notes, date_read})
    res.status(201).redirect("/");
}catch (err) {
  console.error(err);
  res.status(500).send("Failed to add book");
}
});

// edit 
app.get("/edit/:id",async(req,res)=> {
    try{
    const id = parseInt(req.params.id);
    console.log("id:",id);
    const result =await db.query("SELECT * FROM books WHERE id=$1",[id]);
    const book=result.rows[0];
    if (!book) return res.status(404).send("Book not found");
    res.render("edit.ejs",{ book });
    }
    catch(err){
        console.log(err);
        res.status(500).send("Failed to edit book");
    }

});

// update the books 
app.post("/edit/:id",async(req,res)=>{
try{
const id= parseInt(req.params.id);
const {title,author, rating, notes, date_read}=req.body;
await db.query("UPDATE books SET title=$1,author=$2,rating=$3,notes=$4,date_read=$5 WHERE id=$6 RETURNING*",[title,author,rating,notes,date_read,id]);

res.redirect("/");
}
catch(err){
console.log(err)
res.status(500).send("Failed to update book");
}
});


// delete the book

app.post("/delete/:id",async(req,res)=>{
    try{
const id= parseInt(req.params.id);
await db.query("DELETE FROM books WHERE id=$1",[id]);
res.redirect("/");
    }
  catch(err){
      console.log(err);
      res.status(500).send("Unable to delete")
    }

});

app.listen(port, ()=>{
    console.log(`server running on the port ${port}`);
});
