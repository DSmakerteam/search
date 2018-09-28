const http = require('http');
const url = require('url');
const querystring = require('querystring');
const request = require("request");

let cnt = 0;
let key1 = "a68f084e-a7de-4280-b1fe-52e13fb564f3";
let key2 = "08cb5a50-d5d4-4a23-9188-91d914c30a69";
let nowKey = key1;

function getPathByPos(sX, sY, eX, eY){ //시작점X좌표, 시작점Y좌표, 도착점X좌표, 도착점Y좌표
    console.log(sX + " " + sY + " " + eX + " " + eY);
    console.log(typeof sX);
    if(cnt > 1000) nowKey = key2;
    let headers = {
        appKey : nowKey
    };
    let options = {
        url : "https://api2.sktelecom.com/tmap/routes",
        method : "POST",
        headers : headers,
        form : {reqCoordType : "WGS84GEO", resCoordType : "WGS84GEO", version : 1, format : "xml"}
    };
    options.form.startX = sX;
    options.form.startY = sY;
    options.form.endX = eX;
    options.form.endY = eY;
    request(options, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            let arr = data.split("<coordinates>");
            let path = [];
            arr.shift();
            for(let i=0; i<arr.length; i++) arr[i] = arr[i].split("</coordinates>")[0];
            for(let i of arr){
                let tmp = i.split(" ");
                if(i[i.length-1] === " ") tmp.pop();
                for(let j of tmp){
                    path.push({x : j.split(",")[0], y : j.split(",")[1]});
                }
            }
            let ret = {};
            ret.start = {x : sX, y : sY};
            ret.end = {x : eX, y : eY};
            ret.path = path;
            console.log(JSON.stringify(ret)); //결과
        }
    });
}

function getPathByPlace(start, end){ //시작 장소 이름, 도착 장소 이름
    new Promise(function(resolve, reject){
        console.log("..");
        let url = "https://maps.google.com/maps/api/geocode/json?key=AIzaSyDVSLFpyF8lv6v6_eyX52EK04yacsFOLK4&address=" + encodeURI(start);
        request(url, function(error, response, html){
            let s1 = html.split("\"location\"")[1].split("}")[0].replace(":", " ") + "}";
            let jsonarr = JSON.parse(s1);
            resolve(jsonarr);
        });
    }).then(function(jj){
        console.log("..");
        let url = "https://maps.google.com/maps/api/geocode/json?key=AIzaSyDVSLFpyF8lv6v6_eyX52EK04yacsFOLK4&address=" + encodeURI(end);
        request(url, function(error, response, html){
            let s1 = html.split("\"location\"")[1].split("}")[0].replace(":", " ") + "}";
            let jsonarr = JSON.parse(s1);
            let sX = jj.lng, sY = jj.lat;
            let eX = jsonarr.lng, eY = jsonarr.lat;
            console.log("..");
            getPathByPos(Number(sX), Number(sY), Number(eX), Number(eY));
        });
    }, undefined);
}
