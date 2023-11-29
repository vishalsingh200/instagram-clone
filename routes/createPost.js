const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const POST = mongoose.model("POST");

//Route


//fetch all posts from cloudinary
router.get("/allposts", requireLogin, (req, res) => {
    POST.find()
        .populate("postedBy", "_id name Photo") //to get only id and name 
        .populate("comments.postedBy", "_id name")
        .sort("-createdAt") //sort all posts
        .then(posts => res.json(posts))
        .catch(err => console.log(err))
})

router.post("/createpost", requireLogin, (req, res) => {
    const { body, pic } = req.body;
    console.log(pic);
    if (!body || !pic) {
        return res.status(422).json({ error: "Please add all the fields" })
    }
    console.log(req.user)

    const post = new POST({
        body,
        photo: pic,
        postedBy: req.user
    })
    post.save().then((result) => {
        return res.json({ post: result })
    }).catch(err => console.log(err))

})


//update profile where all post of user seen
router.get("/myposts", requireLogin, (req, res) => {
    POST.find({ postedBy: req.user._id })
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .sort("-createdAt")
        .then(myposts => {
            res.json(myposts)
        })
})

// //like and unlike

router.put("/like", requireLogin, (req, res) => {
    POST.findByIdAndUpdate(
        req.body.postId,
        { $push: { likes: req.user._id } },
        { new: true }
    ).populate("postedBy", "_id name Photo")
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            res.status(422).json({ error: err.message });
        });
});
// router.put("/like", requireLogin, (req, res) => {
//     POST.findByIdAndUpdate(req.body.postId, {    //update on mongodb and add like 
//         $push: { likes: req.user._id }
//     }, {
//         new: true
//     }).exec((err, result) => {
//         if(err){
//             return res.status(422).json({error:err})
//         }
//         else{
//             res.json(result)
//             console.log(result)
//         }
//     })
// })

// //for unlike
router.put("/unlike", requireLogin, (req, res) => {
    POST.findByIdAndUpdate(
        req.body.postId,
        { $pull: { likes: req.user._id } },
        { new: true }
    ).populate("postedBy", "_id name Photo")
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            res.status(422).json({ error: err.message });
        });
});
// router.put("/unlike", requireLogin, (req, res) => {
//     POST.findByIdAndUpdate(req.body.postId, {    //update on mongodb and add unlike 
//         $pull: { likes: req.user._id }
//     }, {
//         new: true
//     }).exec((err, result) => {
//         if(err){
//             return res.status(422).json({error:err})
//         }
//         else{
//             res.json(result)
//         }
//     })
// })


//for comments
router.put("/comment", requireLogin, (req, res) => {
    const comment = {
        comment: req.body.text,
        postedBy: req.user._id
    }
    POST.findByIdAndUpdate(req.body.postId, {
        $push: { comments: comment }
    }, {
        new: true
    })
        .populate("comments.postedBy", "_id name")
        .populate("postedBy", "_id name Photo")
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            res.status(422).json({ error: err.message });
        });
})


//Api to delete post


// router.delete("/deletePost/:postId", requireLogin, async (req, res) => {
//     try {
//         const post = await POST.findOne({ _id: req.params.postId }).populate("postedBy", "_id").exec();

//         if (!post) {
//             console.log("No post found for postId:", req.params.postId);
//             return res.status(404).json({ error: "Post not found" });
//         }


//         if (post.postedBy._id.toString() == req.user._id.toString()) {
//             post.remove()
//                 .then(result => {
//                     return res.json({ message: "Successfully deleted" })
//                 })
//                 .catch((err) => {
//                     console.log(err);
//                 })
//         }

//     } catch (err) {
//         console.log("Error:", err);
//         res.status(422).json({ error: err.message });
//     }
// });

// router.delete("/deletePost/:postId", requireLogin, async (req, res) => {
//     try {
//         const post = await POST.deleteOne({ _id: req.params.postId }).populate("postedBy", "_id").exec();

//         if (post.deletedCount === 0) {
//             console.log("No post found for postId:", req.params.postId);
//             return res.status(404).json({ error: "Post not found" });
//         }

//     } catch (err) {
//         console.log("Error:", err);
//         res.status(422).json({ error: err.message });
//     }
// });


// router.delete("/deletePost/:postId", requireLogin, (req, res) => {
//     POST.findOne({ _id: req.params.postId })
//         .populate("postedBy", "_id")
//         .exec((err, post) => {
//             if (err || !post) {
//                 return res.status(422).json({ error: err })
//             }

//             if (post.postedBy._id.toString() == req.user._id.toString()) {

//                 post.remove()
//                     .then(result => {
//                         return res.json({ message: "Successfully deleted" })
//                     }).catch((err) => {
//                         console.log(err)
//                     })
//             }
//         })
// })

router.delete("/deletePost/:postId", requireLogin, async (req, res) => {
    try {
        const post = await POST.findOne({ _id: req.params.postId }).populate("postedBy", "_id").exec();

        if (!post) {
            return res.status(422).json({ error: "Post not found" });
        }

        if (post.postedBy._id.toString() === req.user._id.toString()) {
            await POST.deleteOne({ _id: req.params.postId });
            return res.json({ message: "Successfully deleted" });
        } else {
            return res.status(401).json({ error: "Unauthorized to delete this post" });
        }
    } catch (err) {
        console.log("Error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});


//to show following post
router.get('/myfollowingpost', requireLogin,(req, res) => {
    POST.find({postedBy:{$in:req.user.following}})
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .then(posts => {
        res.json(posts)
    })
    .catch(err => {console.log(err)})
})





module.exports = router;
