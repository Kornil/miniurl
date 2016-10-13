var express = require('express');
var validUrl = require('valid-url');
var shortid = require('shortid');
var mongodb = require('mongodb');

var mLib = "mongodb://localhost:27017/miniurl";
var MongoClient = mongodb.MongoClient;
var app = express();

app.get('/new/:url(*)', function (req, res, next) {
    var url = req.params.url;
    MongoClient.connect(mLib, function (err, db) {
        if (err) throw err;
        var collection = db.collection('links');
        function addLink(db, callback){
            if (validUrl.isUri(url)){
                var miniUrl = shortid.generate();
                var newUrl = { url: url, short: miniUrl };
                collection.insert(newUrl);
                res.send({ original_url: url, short_url: "https://miniurl-kornil.c9users.io/" + miniUrl });
            }else{
                res.send("Url provided is invalid.");
            }
        }
        addLink(db, function(){
            db.close();
        });
    });
});
app.get('/:mini', function(req, res, next){
    var miniUrl = req.params.mini;
    MongoClient.connect(mLib, function (err, db) {
        if (err) throw err;
        var collection = db.collection('links');
        function findUrl(db,callback){
            collection.findOne({ "short": miniUrl },
            { url: 1, _id: 0 },
            function(err, doc){
                if (err) throw err;
                if (doc != null) {
                    res.redirect(doc.url);
                } else {
                    res.send("No corresponding shortlink found in the database.");
                }
            });
        }
        findUrl(db,function(){
            db.close();
        });
    });
});

app.listen(8080);