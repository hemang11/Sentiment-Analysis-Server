const express = require('express');
const app = express();
const path = require('path')
app.use(express.static(path.join(__dirname,'public')));
const Twit = require('twit');
const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
const notifier = require('node-notifier');

const Sentiment = require('sentiment');
const sentiment = new Sentiment();

const apikey = 'IXlCJhwejSyzfMBWTzbwjmS0f'
const apiSecretKey = 'hmEs8iTgP2kzrSIFzP4UG32QWbsjD6Ew0U4v5YAzFKkq9fNwAE'
const accessToken = '1325101026429427720-4h6SFyrAFS6vN5gVxZd1EyLxZhkMCI'
const accessTokenSecret = 'fwbPdpf1a3684Asmoketv1sTE0pFKwqhOxKAmqvCYHYOm'

let T = new Twit({
  consumer_key:         apikey,
  consumer_secret:      apiSecretKey,
  access_token:         accessToken,
  access_token_secret:  accessTokenSecret,
});

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    //res.send('Connected');
})

// app.post('/post',(req,res)=>{
//     res.send('Post');
// })


app.get('/sentiments',(req,res)=>{
    const hashtag = req.query.hashtag;
    console.log(hashtag);
    
    (async () => {

        //1. GET RECENT TWEETS
        T.get('search/tweets', { q: `#${hashtag} since:2020-04-15`, count: 5 }, function(err, data, response) {
          const tweets = data.statuses
          .filter(tweet => tweet.metadata.iso_language_code =='en')
          .map(tweet => tweet.text)
            //console.log(tweets);
            let pair=[];
            let arr_sentiments=[];
            tweets.forEach(e=>{
                const analyze = sentiment.analyze(e);
                arr_sentiments.push(analyze.score);
                pair.push({
                    post:e,
                    score:analyze.score
                });
            })
    
            // Printing array sentiments
            //arr_sentiments.forEach(e=>console.log(e));
    
            const sorted = pair.sort((a,b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0));
            //sorted.forEach(e=>console.log(e.score));
            let p_c=0;
            let n_c=0;
            let neu_c=0;
            let i=0;
            let len = sorted.length;
            const pos_posts = [];
            const neg_posts = [];
            const neut_posts = [];
            for(i=0;i<len;i++){
                if(sorted[i].score>0 && p_c!=5){
                    pos_posts.push(sorted[i].post);
                    p_c = p_c +1;
                }
                if(sorted[i].score==0 && neu_c!=5){
                    neut_posts.push(sorted[i].post);
                    neu_c = neu_c +1;
                }
                if(sorted[len-i-1].score<0 && n_c!=5){
                    neg_posts.push(sorted[len-i-1].post);
                    n_c = n_c +1;
                }
            }
            const sent_obj = {
                pos:pos_posts,
                neg:neg_posts,
                neut:neut_posts,
                arr:arr_sentiments
            }
            //console.log(sent_obj);
           res.send(sent_obj);
        })
    
        // //2. REAL TIME MONITORING USING STREAM (HASHTAG)
        // var stream = T.stream('statuses/filter', { track: '#tesla' })
        // stream.on('tweet', function (tweet) {
        //     console.log(tweet.text);
        //     console.log('Language: ' + franc(tweet.text));
        //     console.log('------');
        // })
    
        // 3. REAL TIME MONITORING USING STREAM (LOCATION)
        // var sanFrancisco = [ '-122.75', '36.8', '-121.75', '37.8' ]
        // var stream = T.stream('statuses/filter', { locations: sanFrancisco })
        
        // //SHOW NOTIFICATION FOR EACH RECEIVED TWEET
        // stream.on('tweet', function (tweet) {
        //   console.log(tweet.text);
        //   let url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
    
        //   notifier.notify({
        //     title: tweet.user.name,
        //     message: tweet.text
        //   });
    
        //   notifier.on('click', async function(notifierObject, options, event) {
        //     console.log('clicked');
        //     await open(url);
        //   });
        // })
    
    })();
});

app.listen(4000,()=>{
    console.log('Server Started');
})

