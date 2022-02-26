var fs=require('fs');

var dataAbi=fs.readFileSync('contract.json');
const abi = JSON.parse(dataAbi);

var ControllerdataAbi=fs.readFileSync('contract.json');
const ControllerAbi = JSON.parse(ControllerdataAbi);


const express = require("express");
const app = express();
const cors=require('cors');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider("https://emerald.oasis.dev");
const web3 = new Web3(provider);
var Jimp = require("jimp");

const ONS = new web3.eth.Contract(abi, "0xFFb32987c496364cd752cB196bFBE01D8D0D7e48");
const controller = new web3.eth.Contract(ControllerAbi, "0xBd295ab4BC7Cb4BDf4B7558B9d3f18C5Baee0AA5");

app.listen(5000, () => console.log("Server Start at 5000 Port"));

app.use(express.static('public'));
app.use(cors());

app.get('/token/:token/',getToken);
async function getToken(request,response)
{
	var tokenID = request.params.token;
	const checkAvailable = await ONS.methods.available(tokenID).call() ;
	if(checkAvailable === false)
	{
		const getName = await ONS.methods.getNamebyID(tokenID).call() ;
		const getExpireDate = await ONS.methods.nameExpires(tokenID).call();
		var stringSplit = getName.split(".");
		var date = {
			is_normalized: true,
			name:getName,
			symbol:"ONS",
			description:getName + " is an ONS name.",
			image:"https://service-ons.com/image/" + tokenID,
			external_url:"https://ons.money/" +  tokenID,
			attributes:[
				{
					trait_type: "Domain",
					display_type:"string",
					value: stringSplit[1]
				},
				{
					trait_type: "Length",
					display_type:"number",
					value: stringSplit[0].length
				},{
					trait_type: "Expiration Date",
					display_type:"date",
					value: + getExpireDate
				}
			]


		};
		
	}
	else
	{
		var date={
			status:"The token not exist"
		}
	}
	response.send(date);

}

app.get('/image/:image/',getImage);
async function getImage(request, response) {
	var tokenID = request.params.image
	const checkAvailable = await ONS.methods.available(tokenID).call()

	if (checkAvailable === false) {
		const getName = await ONS.methods.getNamebyID(tokenID).call()
		var stringSplit = getName.split(".");

		var fileName = 'test.png'
		var imageCaption = getName
		var loadedImage

		Jimp.read(fileName)
			.then(function (image) {
				loadedImage = image
				if (stringSplit[0].length >= 3){
					return Jimp.loadFont(Jimp.FONT_SANS_128_BLACK)
				}else if (stringSplit[0].length >= 15){
					return Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)
				}else{
					return Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
				}
			})
			.then(async function (font) {
				const b64 = await loadedImage
					.print(font, 80, 800, imageCaption.toString())
					.getBase64Async(Jimp.MIME_PNG, (res) => console.log(res))
				response.writeHead(200, {
					'Content-Type': 'image/png',
				})
				var base64Data = b64.replace(/^data:image\/png;base64,/, '')
				var img = Buffer.from(base64Data, 'base64')

				response.end(img)
			})
			.catch(function (err) {
				console.error(err)
			})
	}
}

