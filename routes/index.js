if ((process.env.NODE_ENV || 'development') === 'development') {
  require('dotenv').config();
} 
var express = require('express');
var router = express.Router();
var https = require('https');
var url = require('url');
var mongoose = require('mongoose');
var Query = mongoose.model('Query');
var dateformat = require('dateformat');

/* GET home page. */
router.get('/api/imagesearch/:q', function(req, res, next) {
    var parsedUrl = url.parse(req.url, true);
    var q = req.params.q || "";
    var offset = parsedUrl.query.offset || 0;
    var search = "";
    
    https.get({
        host: 'bingapis.azure-api.net',
        path: '/api/v5/images/search?count=10&offset='+offset+'&q='+q,
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.BING_API
        }
    }, function(resp) {
        resp.on('data', function(d){
            search += d;
        });
        resp.on('end', function(){
            var parsedSearch = [];
            search = JSON.parse(search.toString());
            search.value.forEach(function(object, index){
                parsedSearch.push(
                    {
                        name: object.name,
                        image: object.contentUrl,
                        host: object.hostPageUrl
                    }
                );
            });
            Query.create({ term: q }, function(err, query){
                if(err) console.log(err);
            });
            res.json(parsedSearch);
        });
    }).on('error', function(err){
        console.error("FUCK ERROR", err);
        res.end();
    });


});

router.get('/api/latest/imagesearch', function(req, res, next) {
    Query.find({}).select({term: 1, when: 1}).exec(function(err, docs){
        if(err) return next(err);
        var lastTerms = [];
        docs.forEach(function(object, index){
            lastTerms.push({
                term: object.term,
                date: dateformat(object.when, "dddd, mmmm dS, yyyy, h:MM:ss TT")
            });
        });
        res.json(lastTerms);
    });
});

module.exports = router;
