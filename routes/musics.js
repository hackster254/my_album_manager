var express = require('express');
var router = express.Router();
var firebase = require('firebase');
var fbRef = firebase.database().ref();
/*
var firebaseConfig = {
	apiKey: "AIzaSyBHTauMGqI1pmnAk9RCWoYmZ8IHizFEG34",
	authDomain: "album-7716f.firebaseapp.com",
	databaseURL: "https://album-7716f.firebaseio.com",
	projectId: "album-7716f",
	storageBucket: "album-7716f.appspot.com",
	messagingSenderId: "641208383392",
	appId: "1:641208383392:web:414a7362a91f7e2b9e56c5"
};
// Initialize Firebase
//Firebase.initializeApp(firebaseConfig);
*/

var multer = require('multer');
var upload = multer({dest:'./public/musics/uploads'});

router.get('*', function(req, res, next) {
	// Check Authentication
	if(firebase.auth() === null){
	  	res.redirect('/users/login');
	}
	next();
});

router.get('/', function(req, res, next) {
	
	//var musicRef = fbRef.child('musics');
	

	var ref = firebase.database().ref('musics');
	var musics =[];
	ref.once('value')
		.then(function(snapshot){

			snapshot.forEach(function(childSnapshot){
				//var key = childSnapshot.key();
				var childData = childSnapshot.val();

				if(childData.uid == firebase.auth().uid){

					musics.push({
						id: childSnapshot.key,
						artist: childData.artist,
						song: childData.song
					})
				}
			});
			console.log(musics)
			

			res.render('music/index',{musics: musics});

		})
		/*

		musicRef.once('value', function(snapshot){
			var musics = [];
			snapshot.forEach(function(childSnapshot){
				var key = childSnapshot.key();
				var childData = childSnapshot.val();
				//if(childData.uid == fbRef.getAuth().uid){
					musics.push({
						id: key,
						artist: childData.artist,
						name: childData.name
					});
				//}
			});
			res.render('music/index',{musics: musics});
		});
		*/

});

router.get('/add', function(req, res, next) {
	var genreRef = fbRef.child('genres');
	
	
	res.render('music/add');

	
	

});

router.post('/add', /*upload.single('cover'),*/function(req, res, next) {
	// Check File Upload
	/*
	if(req.file){
	  	console.log('Uploading File...');
	  	var cover = req.file.filename;
	} else {
	  	console.log('No File Uploaded...');
	  	var cover = 'noimage.jpg';
	}
	*/

	// Build Album Object
	var music = {
		artist: req.body.artist,
		song: req.body.song ,
		//genre: req.body.genre
		
		uid: firebase.auth().currentUser.uid
	}
	console.log(music);
	//return;
	
	// Create Reference
	var musicRef = fbRef.child("musics");

	// Push Album
  	musicRef.push().set(music);

  	req.flash('success_msg', 'Album Saved');
  	res.redirect('/musics');
  	
});




router.get('/edit/:id', function(req, res, next) {
	var id = req.params.id;
	var musicRef = firebase.database().ref('musics/' + id);


	musicRef.once("value", function(snapshot) {
		var musics = snapshot.val();
		res.render('music/edit', {musics: musics, id: id});
	});

	
});

router.post('/edit/:id', function(req, res){
	var id = req.params.id;
	var artist = req.body.artist;
	var song = req.body.song;

	var musicRef = firebase.database().ref('musics/' + id);

	musicRef.update({
		artist: artist,
		song: song
	})
	req.flash('success_msg', 'Music Edited');
	res.redirect('/musics');
});



router.delete('/delete/:id', function(req, res, next) {
	var id = req.params.id;
	var musicRef = firebase.database().ref('/musics/' + id);


	musicRef.remove();

	req.flash('success_msg','Music Deleted');
	res.send(200);
});




module.exports = router;
