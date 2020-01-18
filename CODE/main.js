var express = 	require("express"),
	bodyParse = require("body-parser"),
	app = 		express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParse.urlencoded({extended: true}));
// make sure to first run ./mongod in terminal, and then open a new terminal window and run node main
const mongo = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

var hotels = [[40.61295396913024, -73.95387268066406], [40.65295396913024, -73.90387268066406]];
var data = [];
var arr = [];
var detail = {};
var id = 0;

function getHotels(positions) {
	mongo.connect(url, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	  }, (err, client) => {
		if (err) {
			console.error(err)
			return;
		}
		const db = client.db('cse6242');
		const collection = db.collection('hotels');
		
		data = [];
		positions.forEach((pos) => {
			collection.aggregate( 
			[ 
				{	
					$project: {
						latitude: 1,
						longitude: 1,
						Location_sum: 1,
						price: 1,
						picture_url: 1,
						review_scores_rating: 1,
						distance: {
							$subtract: [
							{
								$multiply: [
								{
									// $sqrt: {
										$add: [
											{ $pow: [ { $subtract: [ "$latitude", pos[0] ] }, 2 ] },
											{ $pow: [ { $subtract: [ "$longitude", pos[1] ] }, 2 ] }
										]
									// }
								}, 
								1e6 ]
							},
								"$review_scores_rating"
							]
						}
					}
				}
			] )
			.sort({distance: 1})
			.limit(5)
			.toArray((err, item) => {
				data.push(item);
			});
		});
	});
}
function handleData() {
	arr = [];
	detail = {};
	data.forEach((d, index) => {
		arr.push([]);
		d.forEach((diction) => {
			arr[index].push(diction._id);
			detail[diction._id] = diction;
		})
	})
}

app.use(bodyParse.json());
const cors = require('cors');
app.use(cors());

var locations = [];
app.get("/", function(req, res) {
	res.render("search_page");
});

app.get("/display", function(req, res) {
	res.render("show_map", {arr: arr, detail: detail, location: input});
	id = 0;
});

app.post("/send_location", function(req, res) {
	if (id === 0) {
		id = 1;
		input = req.body;
		locations = [];
		input.forEach(function(l){
			locations.push([parseFloat(l.lat), parseFloat(l.lng)]);
		});
		var days = Math.ceil(locations.length / 2);
		positions = kmeansBaby(locations, days);
		getHotels(positions);
		setTimeout(function() {
			handleData();
			res.send({redirect: '/display'});
		}, 1000 * days + 1000);
	}
});

app.listen(3000, function() {
	console.log("Server listening on port 3000");
});

function kmeansBaby(dataList, clusterNum){
    
    var dataNum = dataList.length; // number of data
    var dataDim = dataList[0].length; //data dimension

    // // get the Max for each dimension
    // var dimMax = new Array(dataDim); 
    // for (let index = 0; index < dataDim; index++) {
    //     dimMax[index] = getMax(index, dataList)
    // }

    // start cluster center. Random select from datapoint
    var centroid = new Array(clusterNum);
    var randomHist = []
    for (let index = 0; index < clusterNum; index++) {
        // create random center
        var randomInd = Math.floor(Math.random() * clusterNum)
        while (randomHist.includes(randomInd)) {
            randomInd = Math.floor(Math.random() * clusterNum);
        }
        randomHist.push(randomInd);
        centroid[index] = dataList[randomInd];
    }


    var centroid_old = new Array(clusterNum);
	for (let index = 0; index < centroid_old.length; index++) {
        centroid_old[index] = [0.0, 0.0]
        
    }
    while ( compare(centroid, centroid_old) !== true ) {
        // update centroid_old
        centroid_old = centroid;

        // keep a list of cluster member. Init with []
        var clusterMember = new Array(clusterNum);
        for (let index = 0; index < clusterNum; index++) {
            clusterMember[index] = [];
        }

         // find NN for each data. Record in clusterMember array
         for (let dataID = 0; dataID < dataNum; dataID++) {
            // fetch data
            var curPoint = dataList[dataID];

            var minDist = 100000000;
            var nearestCenInd = -1;

            // find the nearest centroid
            for (let index = 0; index < clusterNum; index++) {
                if (distance(curPoint, centroid[index]) < minDist) {
                    nearestCenInd = index;
                    minDist = distance(curPoint, centroid[index]);
                }
            }
            clusterMember[nearestCenInd].push(curPoint)
         }

         // check biased or not
         if (biasCluster(clusterMember)) {
             console.log("biased cluster!");
             break
         }

         // update centroid
         centroid = centoridUpdate(clusterMember);
    }

	return centroid;
}


function biasCluster(clusterMember)
{
    for (let index = 0; index < clusterMember.length; index++) {
        const element = clusterMember[index];
        if (element.length == 0){
            return true;
        }
        
    }
}

function centoridUpdate(clusterMember){
    var centroid = new Array(clusterMember.length);
    for (let index = 0; index < clusterMember.length; index++) {
        var memList = clusterMember[index];
        var cenNew = new Array(memList[0].length);
        for (let dim = 0; dim < cenNew.length; dim++) {
            var dimList = [];
            for (let dataNum = 0; dataNum < memList.length; dataNum++) {
                dimList.push(memList[dataNum][dim])
            }
            cenNew[dim] = (dimList.reduce((a,b) => a + b, 0)) / memList.length;
        }
        centroid[index] = cenNew;
    }
    return centroid;
}

function compare(arr1,arr2){
    let result = true;
    for (let index = 0; index < arr1.length; index++) {
        if (arr1[index][0] === arr2[index][0] && 
            arr1[index][1] === arr2[index][1]) {
            result = true;
        }
        else{
            result = false;
            break;
        }
    }
	return result;
}  

function getMax(dim, dataList){
    return Math.max.apply(null, dataList.map(function(data){ return data[dim] }))
}


function distance(coorData, coorCent) {
    var sum = 0;
    for (let index = 0; index < coorData.length; index++) {
        sum = sum + Math.pow(coorData[index]-coorCent[index], 2);
    }

    return Math.sqrt(sum)
}