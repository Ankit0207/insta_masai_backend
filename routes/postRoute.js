const express = require("express");
const { postModel } = require("../model/postModel");
const { authMiddleware } = require("../middleware/authMiddleware");
const postRouter = express.Router();

postRouter.use(authMiddleware);

postRouter.post("/add", async (req, res) => {
    try {
        const { title, body, device, no_of_comments } = req.body;

        const post = new postModel({ title, body, device, no_of_comments });
        await post.save();
        return res.status(200).json({ msg: "post has been added" })
    } catch (err) {
        return res.status(400).json({ error: err.message })
    }
})

postRouter.get("/", async (req, res) => {
    try {
        const { device, page } = req.query;
        let skip
        if (page) {
            skip = (page - 1) * 3;
        } else {
            skip = 0;
        }
        let query = { user: req.userId };
        if (device) {
            query.device = device;
        }

        const postData = await postModel.find(query).skip(skip).limit(3);
        res.status(200).json(postData);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
})

postRouter.patch("/update", async (req, res) => {
    try {
        const { id } = req.params;
        const post = await postModel.findOne({ _id: id });

        if (req.userId === post.userId) {
            await postModel.findByIdAndUpdate({ _id: id }, req.body);
            res.status(200).json({ msg: "post updated" })
        } else {
            res.status(400).json({ msg: "user not authorized" })
        }
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})
postRouter.delete("/delete", async (req, res) => {
    try {
        const { id } = req.params;
        const post = await postModel.findOne({ _id: id });

        if (req.userId === post.userId) {
            await postModel.findByIdAndDelete({ _id: id });
            res.status(200).json({ msg: "post deleted" })
        } else {
            res.status(400).json({ msg: "user not authorized" })
        }
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})


module.exports = { postRouter };