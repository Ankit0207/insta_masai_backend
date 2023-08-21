const express = require("express");
const { connection } = require("./db");const { userRoute } = require("./routes/userRoute");
const { postRouter } = require("./routes/postRoute");
;
const app = express();
app.use(express.json());


app.use("/users",userRoute);
app.use("/posts",postRouter)



app.listen(process.env.Port, async () => {
    try {
        await connection;
        console.log(`server is running at port ${process.env.Port}`);
    } catch (err) {
        console.log(err);
    }
})