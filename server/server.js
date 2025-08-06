import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { inngest, functions } from "./inngest/index.js"
import {serve} from 'inngest/express'

const app=express();
await connectDB();

app.use(express.json());
app.use(cors());


app.post("/test-user", async (req, res) => {
  try {
    console.log("Test route hit");
    const dummyUser = {
      _id: "dummy123",
      email: "test@example.com",
      full_name: "Test User",
      username: "testuser" + Math.floor(Math.random() * 10000),
      profile_picture: ""
    };
    const user = await User.create(dummyUser);
    console.log("User inserted:", user);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error inserting user:", error);
    res.status(500).send(error.message);
  }
});


app.get('/',(req,res)=>{
    res.send("Server is running")
});
app.use('/api/inngest',serve({ client: inngest, functions }));

const PORT=process.env.PORT || 4000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`); 
})