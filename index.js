var fs = require("fs");

var dataAbi = fs.readFileSync("contract.json");
const abi = JSON.parse(dataAbi);

var ControllerdataAbi = fs.readFileSync("contract.json");
const ControllerAbi = JSON.parse(ControllerdataAbi);

const express = require("express");
const app = express();
const cors = require("cors");
const Web3 = require("web3");
const provider = new Web3.providers.HttpProvider("https://emerald.oasis.dev");
const web3 = new Web3(provider);
var Jimp = require("jimp");

const ONS = new web3.eth.Contract(
  abi,
  "0xFFb32987c496364cd752cB196bFBE01D8D0D7e48"
);
const controller = new web3.eth.Contract(
  ControllerAbi,
  "0xBd295ab4BC7Cb4BDf4B7558B9d3f18C5Baee0AA5"
);
const port = 3000;
app.listen(port, () => console.log("Server Start at ", port, " Port"));

app.use(express.static("public"));
app.use(cors());

app.get("/token/:token/", getToken);
async function getToken(request, response) {
  var tokenID = request.params.token;
  const checkAvailable = await ONS.methods.available(tokenID).call();
  if (checkAvailable === false) {
    const getName = await ONS.methods.getNamebyID(tokenID).call();
    const getExpireDate = await ONS.methods.nameExpires(tokenID).call();
    var stringSplit = getName.split(".");
    var date = {
      is_normalized: true,
      name: getName,
      symbol: "ONS",
      description: getName + " is an ONS name.",
      image: "https://service-ons.com/image/" + tokenID,
      external_url: "https://ons.money/",
      attributes: [
        {
          trait_type: "Domain",
          value: stringSplit[1],
        },
        {
          trait_type: "Length",
          value: stringSplit[0].length,
        },
        {
          trait_type: "Expiration Date",
          value: timeConverter(+getExpireDate),
        },
      ],
    };
  } else {
    var date = {
      status: "The token not exist",
    };
  }
  response.send(date);
}

app.get("/image/:image/", getImage);
async function getImage(request, response) {
  var tokenID = request.params.image;
  const checkAvailable = await ONS.methods.available(tokenID).call();

  if (checkAvailable === false) {
    const getName = await ONS.methods.getNamebyID(tokenID).call();
    var stringSplit = getName.split(".");

    if (stringSplit[0].length === 1) {
      var fileName = "bg/bg6.png";
    } else if (stringSplit[0].length === 2) {
      var fileName = "bg/bg5.png";
    } else if (stringSplit[0].length === 3) {
      var fileName = "bg/bg4.png";
    } else if (stringSplit[0].length === 4) {
      var fileName = "bg/bg3.png";
    } else if (stringSplit[0].length === 5) {
      var fileName = "bg/bg2.png";
    } else {
      var fileName = "bg/bg1.png";
    }

    var imageCaption = getName;
    var loadedImage;
    Jimp.read(fileName)
      .then(function (image) {
        loadedImage = image;
        if (stringSplit[0].length <= 3) {
          return Jimp.loadFont("font/font256.fnt");
        } else if (stringSplit[0].length <= 13) {
          return Jimp.loadFont("font/font150.fnt");
        } else if (stringSplit[0].length <= 20) {
          return Jimp.loadFont("font/font120.fnt");
        } else {
          return Jimp.loadFont("font/font80.fnt");
        }
      })
      .then(async function (font) {
        const b64 = await loadedImage
          .print(font, 80, 1200, imageCaption.toString())
          .getBase64Async(Jimp.MIME_PNG, (res) => console.log(res));
        response.writeHead(200, {
          "Content-Type": "image/png",
        });
        var base64Data = b64.replace(/^data:image\/png;base64,/, "");
        var img = Buffer.from(base64Data, "base64");

        response.end(img);
      })
      .catch(function (err) {
        console.error(err);
      });
  }
}

function timeConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time =
    date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
  return time;
}
