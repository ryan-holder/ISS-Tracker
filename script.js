const latLongPara = document.getElementById("latlong");
const timePara = document.getElementById("time");
const astroPara = document.getElementById("astronauts");

let latitude = 0;
let longitude = 0;

const map = L.map("map").setView([latitude, longitude], 4);
L.tileLayer(
	"https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
	{
		attribution:
			'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: "mapbox/streets-v11",
		tileSize: 512,
		zoomOffset: -1,
		accessToken: process.env.API_KEY,
	}
).addTo(map);

// const circle = L.circle([latitude, longitude], {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5,
//     radius: 150000
// }).addTo(map);

const imageUrl = "http://open-notify.org/Open-Notify-API/map/ISSIcon.png";
const imageBounds = [
	[0, 0],
	[0, 0],
];
const image = L.imageOverlay(imageUrl, imageBounds).addTo(map);

function updateMap() {
	fetch("http://api.open-notify.org/iss-now.json")
		.then((res) => res.json())
		.then((res) => {
			if (Object.keys(res.iss_position)[0] === "latitude") {
				// this is because the api seems to change...
				latitude = Object.values(res.iss_position)[0];
				longitude = Object.values(res.iss_position)[1];
			} else {
				latitude = Object.values(res.iss_position)[1];
				longitude = Object.values(res.iss_position)[0];
			}
			map.panTo([latitude, longitude], (animate = true));
			// circle.setLatLng([latitude, longitude]);
			let lat1 = Number(latitude) - 1.5;
			let lat2 = Number(latitude) + 1.5;
			let long1 = Number(longitude) - 1.5;
			let long2 = Number(longitude) + 1.5;
			image.setBounds([
				[lat1, long1],
				[lat2, long2],
			]);
		});
	setTimeout(updateMap, 5000);
}

function updateLocation() {
	let latDeg = parseInt(latitude);
	let latMin = parseInt((latitude - latDeg) * 60);
	let latSec = parseInt(((latitude - latDeg) * 60 - latMin) * 60);
	let longDeg = parseInt(longitude);
	let longMin = parseInt((longitude - longDeg) * 60);
	let longSec = parseInt(((longitude - longDeg) * 60 - longMin) * 60);

	latLongPara.innerHTML = `
		The ISS is at 
		<span class="highlight">
		${Math.abs(latDeg)}°${Math.abs(latMin)}'${Math.abs(latSec)}"${
		latitude >= 0 ? "N" : "S"
	}
		${Math.abs(longDeg)}°${Math.abs(longMin)}'${Math.abs(longSec)}"${
		longitude >= 0 ? "E" : "W"
	}
		</span>
		`;
	setTimeout(updateLocation, 5000);
}

function updateAstronauts() {
	fetch("http://api.open-notify.org/astros.json")
		.then((res) => res.json())
		.then(
			(res) =>
				(astroPara.innerHTML = `Astronauts <span class="highlight">
			${res.people
				.map((res) => Object.values(res))
				.map((astrounauts) => astrounauts[1])
				.join(", ")}
			</span> are currently on the ISS`)
		)
		.catch((err) => console.log(err));
}

function updateTime() {
	const time = new Date();
	let hours = time.getHours();
	let minutes = time.getMinutes();
	let seconds = time.getSeconds();

	timePara.innerHTML = `
		The current time is 
		<span class="highlight">
		${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}:${
		seconds < 10 ? "0" : ""
	}${seconds}
		</span>
	`;
	setTimeout(updateTime, 100);
}

updateMap();
updateLocation();
updateTime();
updateAstronauts();
