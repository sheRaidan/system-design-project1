var labelText = "Searching for songs like "; // text for the results page to make sure it's always the same
var resultList = document.getElementById("list"); // made a section for just the results so that this section can be updated easily
const numR = 50; // limit the number of results shown

var genre = "";
var artistName = "none";

var searchBox = document.getElementById("search");
var searchBtn = document.getElementById("searchBtn");
var searcP2 = document.getElementById("specify");

var baseYear, baseCountry, baseStyle;

// ------------------------------ song search ------------------------------
function search(){
    searchBox.style.marginTop = "16px";
    searchBtn.style.marginTop = "16px";

    var search = document.getElementById("search").value.toLowerCase().replaceAll(" ", "-");
    // var results = document.getElementById("results");
    var artist = document.getElementById("artist");
    resultList.innerHTML = ""; // reset results every time a search is made
    searcP2.innerHTML = "";

    searcP2.style.display = "block"; // show results
    
    artist.style.display = "inline";

    // fetch the Discogs search for the song title
    fetch(`https://api.discogs.com/database/search?type=release&q=${search}`)
    .then(response => response.json())
    .then(data => {
        // genre = data.results[0].genre[0];
        data.results.forEach(result => {
            if (!searcP2.innerHTML.includes(result.title)){
                searcP2.innerHTML += `<p onclick="getSong(${result.id})">${result.title}</p>`;
            }
        });
    })
    .catch(error => console.error(error));
}

function getSong(id){
    console.log(id);
    searcP2.style.display = "none";

    var results = document.getElementById("results");
    results.style.display = "block";

    fetch(`https://api.discogs.com/releases/${id}`) // fetch the track I'm looking for
    .then(response => response.json())
    .then(data => { // create each result using the fetched data
        var label = document.getElementById("label");
        // change the label to match the search
        label.innerHTML = labelText + data.title + " by " + data.artists[0].name;

        baseCountry = data.country
        baseYear = String(data.year);
        genre = data.genres[0];
        baseStyle = data.styles;

        generateList(1);
    })
    .catch(error => console.error(error));
}

function generateList(page){
    var count = 0;
    var thisOne = 0;
    // fetch list of tracks in found genre
    fetch(`https://api.discogs.com/database/search?genre=${genre}&page=${page}&per_page=200`)
    .then(response => response.json())
    .then(data => {
        console.log(genre);
        // for (var i = 0; i < numR; i++){ // output each result
        //     getInfo(data.results[i].id, i);
        // }

        while (count < 10 || thisOne < 200){
            var match = 0;
            var checkStyle = false;
            var country = data.results[thisOne].country;
            var year = data.results[thisOne].year;
            var style = data.results[thisOne].style;
            // how to get style info
            // don't know - how many styles, what order, which could match
            // what about forEach that runs thru this song's styles n checks if the other list includes it

            style.forEach(list => {
                if (baseStyle.includes(list)){
                    match = 50;
                    checkStyle = true;
                }
            });

            if (checkStyle){
                if (country == baseCountry || (parseInt(year, 10) > parseInt(baseYear, 10)-10 && parseInt(year, 10) < parseInt(baseYear, 10)+10)){
                    console.log(`either ${country} matches ${baseCountry}, or ${year} is near ${baseYear}`);
                    match = 75;
                    getInfo(data.results[thisOne].id, count, match);
                    count++;
                }else{
                    console.log(country + ", " + year);
                }
            }else{
                console.log("wrong style");
            }
            
            thisOne++;
        }
    })
    .catch(error => console.error(error));
}

function getInfo(song, num, percent){
    fetch(`https://api.discogs.com/releases/${song}`) // fetch the track I'm looking for
    .then(response => response.json())
    .then(data => { // create each result using the fetched data
        if (artistName == data.artists[0].name || artistName == "none"){
            resultList.innerHTML += `<div class="result" id="${num}">
                <h3>${data.title} - ${data.artists[0].name}</h3>
                <img src="${data.images[0].uri}" style="width: 100%;">
                <p>${String(data.year)}</p>
                <p>${data.country}</p>
                <p>${data.tracklist[0].duration}</p>
                <h2 id="match">${percent}% Match</h2></div>`;
        }
    })
    .catch(error => console.error(error));
}

// ------------------------------ show the year input ------------------------------
var check = false; // create a boolean to hide/show content
function show(){
    var box = document.getElementById("dateRange");
    check = !check;
    console.log(check); 
    if (check){ // if the user wants to search by year, they need to access the year input boxes
        box.style.display = "inline";
    }else{
        box.style.display = "none";
    }
}
