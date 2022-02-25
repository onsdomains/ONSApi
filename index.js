var fs=require('fs');

var dataAbi=fs.readFileSync('contract.json');
const abi = JSON.parse(dataAbi);

var ControllerdataAbi=fs.readFileSync('contract.json');
const ControllerAbi = JSON.parse(ControllerdataAbi);


const express = require("express");
const app = express();
const cors=require('cors');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/ab93e43c332040f38f3fa436417d01ec");
const web3 = new Web3(provider);
var Jimp = require("jimp");


web3.eth.getBlockNumber().then((result) => {
	console.log("Latest Emerald Block is ",result);
});

const ONS = new web3.eth.Contract(abi, "0x56c94D0d1340572eFFb21ea9E88252513E1f4319");
const controller = new web3.eth.Contract(ControllerAbi, "0x2bAf23a0F1C563792B106F6AB4d29D2Fe1d42aB4");

app.listen(5000, () => console.log("Server Start at 5000 Port"));

app.use(express.static('public'));
app.use(cors());
app.get('/token',alldata);
function alldata(request,response)
{
    response.send(elements);
}

app.get('/token/:token/',getToken);
async function getToken(request,response)
{
	var tokenID = request.params.token;

	const checkAvailable = await ONS.methods.available(tokenID).call() ;

	if(checkAvailable === false)
	{
		const getName = await ONS.methods.getNamebyID(tokenID).call() ;
		const getExpireDate = await ONS.methods.nameExpires(tokenID).call();
	//	const getExpireDate = await ONS.methods.controller(tokenID).call();
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
					value: ".ons"
				},
				{
					trait_type: "Length",
					display_type:"number",
					value: 6
				},{
					trait_type: "Registration Date",
					display_type:"date",
					value: 1639711359000
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
		var fileName = 'test.png'
		var imageCaption = getName
		var loadedImage

		Jimp.read(fileName)
			.then(function (image) {
				loadedImage = image
				return Jimp.loadFont(Jimp.FONT_SANS_16_BLACK)
			})
			.then(async function (font) {
				const b64 = await loadedImage
					.print(font, 10, 10, imageCaption.toString())
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

