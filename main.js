var labelText = "Searching for songs like "; // text for the results page to make sure it's always the same
var resultList = document.getElementById("list"); // made a section for just the results so that this section can be updated easily
const numR = 50; // limit the number of results shown

var genre = "";
var artistName = "none"; // from unused feature

var searchBox = document.getElementById("search");
var searchBtn = document.getElementById("searchBtn");
var searcP2 = document.getElementById("specify");

var baseYear, baseCountry, baseStyle; // these get used to hold the year, country, & style(s) of the searched song to match against songs of the same genre
var ifYear, ifCountry = true;

var resultCollect = []; // create array of results in order to sort them

// ------------------------------ song search ------------------------------
function search(){
    // move the search stuff to make more room on the page
    searchBox.style.marginTop = "16px";
    searchBtn.style.marginTop = "16px";

    var search = document.getElementById("search").value.toLowerCase().replaceAll(" ", "-");
    // var results = document.getElementById("results");
    // var artist = document.getElementById("artist");
    resultList.innerHTML = ""; // reset results every time a search is made
    searcP2.innerHTML = ""; // omg I misspelt this variable name lmao I mean as long as it matches everywhere it's fine
    resultCollect = []; // empty the list of results from last search
    results.style.display = "none"; // hide last result page
    // wait a minute the var results is created in another function WHY DOES THIS CODE WORK ???
    searcP2.style.display = "block"; // show results
    
    // artist.style.display = "inline";

    // fetch the Discogs search for the song title
    fetch(`https://api.discogs.com/database/search?type=release&q=${search}`)
    .then(response => response.json())
    .then(data => {
        // genre = data.results[0].genre[0];
        data.results.forEach(result => {
            if (!searcP2.innerHTML.includes(result.title)){ // make sure there's no duplicates cuz that's annoying
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

        // collect the info to use as reference later
        baseCountry = data.country
        baseYear = String(data.year);
        genre = data.genres[0]; // so far I haven't found a song with multiple genres but idk man
        baseStyle = data.styles;

        generateList(1, parseInt(baseYear, 10)-10, parseInt(baseYear, 10)+10);
    })
    .catch(error => console.error(error));
}

// var isDone = false;
function generateList(page, min, max){ // params mean that the min & max can be changed to whatever the user inputs
    var count = 0;
    var thisOne = 0;
    // fetch list of tracks in found genre
    fetch(`https://api.discogs.com/database/search?genre=${genre}&page=${page}&per_page=100`)
    .then(response => response.json())
    .then(data => {
        console.log(genre);
        // for (var i = 0; i < numR; i++){ // output each result
        //     getInfo(data.results[i].id, i);
        // }

        while (count < 10 && thisOne < 100){ // once either one of these is done, check which
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
                    checkStyle = true;
                }
            });

            // only match if either the year or country match
            if ((ifCountry && country == baseCountry) || (parseInt(year, 10) > min && parseInt(year, 10) < max)){
                match = 60;
                // boost rating if both match
                if (country == baseCountry && (parseInt(year, 10) > min && parseInt(year, 10) < max)){
                    console.log(`${country} matches ${baseCountry}, & ${year} is near ${baseYear}`);
                    match += 15; 
                }else{
                    console.log(`either ${country} matches ${baseCountry}, or ${year} is near ${baseYear}`);
                }
                // boost rating if style matches
                // max rating as of now: 95
                if (checkStyle){
                    match += 20;
                }else{
                    console.log("wrong style");
                }
                // once the number is calculated, paste to the page
                getInfo(data.results[thisOne].id, count, match);
                // sortList();
                count++;
            }else{
                console.log(country + ", " + year);
            }            
            thisOne++;
        }
        if (count < 10){ // if <10, go to the next page
            thisOne = 0;
            generateList(page+1, parseInt(baseYear, 10)-10, parseInt(baseYear, 10)+10); // rerun on next page
        }else{
            // isDone = true;
        }
    })
    .catch(error => {
        // isDone = true;
        console.error(error);
    });
}

function getInfo(song, num, percent){
    fetch(`https://api.discogs.com/releases/${song}`) // fetch the track I'm looking for
    .then(response => response.json())
    .then(data => { // create each result using the fetched data
        if (artistName == data.artists[0].name || artistName == "none"){ // part of unused feature
            resultList.innerHTML = "";
            resultCollect.push({ // made as an array of objects to better sort
                "text": `<div class="result" id="${num}">
                    <h3>${data.title} - ${data.artists[0].name}</h3>
                    <img src="${data.images[0].uri}" style="width: 100%;">
                    <p>${String(data.year)}</p>
                    <p>${data.country}</p>
                    <p>${data.tracklist[0].duration}</p>
                    <h2 id="match">${percent}% Match</h2></div>`,
                "score": percent
            });
        }
        sortList(); // ok yes it's bad that I sort the list *every time* there's a new result added but honestly I couldn't think of a better solution without rewriting like half this file so it is what it is
    })
    .catch(error => {
        // sortList();
        console.error(error);
    });
}

// ------------------------------ sort items then add to page ------------------------------
function sortList(){
    resultCollect.sort((a, b) => b.score - a.score);

    resultCollect.forEach(item => {
        resultList.innerHTML += item.text;
    });
}

// ------------------------------ update the search reqs ------------------------------
function update(){
    resultCollect = []; // empty the list of results from last update
    resultList.innerHTML = "";
    var checkYear = document.getElementById("yearCheck");
    ifYear = checkYear.checked;
    var checkCountry = document.getElementById("originCheck");
    ifCountry = checkCountry.checked;

    if (ifYear){
        var userMin = document.getElementById("min").value;
        var userMax = document.getElementById("max").value;

        if (userMin.toString().length == 4 && userMax.toString().length == 4){ // only runs for valid years (I don't think people are searching for songs from the year 12 but who knows)
            generateList(1, userMin, userMax);
        }
    }
}

// ------------------------------ show the year input ------------------------------
function show(){
    var checkYear = document.getElementById("yearCheck");
    var box = document.getElementById("dateRange");
    if (checkYear.checked){ // if the user wants to search by year, they need to access the year input boxes
        box.style.display = "inline";
    }else{
        box.style.display = "none";
    }
}
