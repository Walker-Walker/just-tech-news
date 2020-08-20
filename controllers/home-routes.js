const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment } = require('../models');

router.get('/', (req, res) => {
    console.log(req.session);
    Post.findAll({
        attributes: [
            'id',
            'post_url',
            'title',
            'created_at',
            [sequelize.literal('(SELECT COUNT (*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
        ],
        include: [
            {
                model: Comment,
                attributes: ['id','comment_text', 'post_id', 'user_id', 'created_at'],
                include : {
                    model: User,
                    attributes: ['username']
                }
            },
            {
                model: User,
                attributes: ['username']
            }
        ]
    }) .then(dbPostData => {
        //pass a single post object into the homepage template\
        // console.log(dbPostData[0]);
        const posts = dbPostData.map(post => post.get ({ plain: true })); // loop over and map Sequelize Object into a serialized version of itself saving results in the new posts array-->add to an objet then continue passing to the template
        res.render('homepage', { posts }); //serialize the giant sequelize object down to what you need>> we didnt need to before becaues res.json does that for you 
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
    // use with template engine for response we say use homepage.handlebars template handlebars is implied
});

router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/');
        return;
    }
    res.render('login');
});
module.exports = router;