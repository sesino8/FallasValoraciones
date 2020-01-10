const urlFallas = "http://mapas.valencia.es/lanzadera/opendata/Monumentos_falleros/JSON";
var secciones = new Array;

function filtroLetra(elemento) {
	let letra = document.querySelector(`input[name="nombre"]`).value;
	return elemento.properties.nombre.startsWith(letra);
}

function init() {

	document.querySelector(`input[type="button"]`).addEventListener("click", buscar);

	mapaDeFallas = new Map();


	const fetchPromesa = fetch(urlFallas);
	fetchPromesa.then(response => {
		return response.json();
	}).then(respuesta => {
		const resultado = respuesta.features;

		resultado.forEach(falla => {

			if (secciones.includes(falla.properties.seccion) === false) secciones.push(falla.properties.seccion);
			if (secciones.includes(falla.properties.seccion_i) === false) secciones.push(falla.properties.seccion_i);

		});
		cargarSecciones();
	});

}

function cargarSecciones() {
	let divSecciones = document.getElementById("secciones");
	for (let index = 0; index < secciones.length; index++) {
		var option = document.createElement("option");
		option.text = secciones[index];
		divSecciones.add(option);
	}
}

function buscar() {
	sector = document.getElementById("secciones");
	seccionAComprobar = sector.options[sector.selectedIndex].value;
	let listado = document.querySelector(".resultados");
	listado.innerText = "";

	const fetchPromesa = fetch(urlFallas);
	fetchPromesa.then(response => {
		return response.json();
	}).then(respuesta => {
		const resultado = respuesta.features;

		resultado.forEach(falla => {

			anoMin = document.getElementById("anoInicio").value;
			anoMax = document.getElementById("anoFinal").value;


			if (document.getElementById("boceto_i").checked) {
				fallaAComprobar = falla.properties.boceto_i;
				seccionBuena = falla.properties.seccion_i;
			} else if (document.getElementById("boceto").checked) {
				fallaAComprobar = falla.properties.boceto;
				seccionBuena = falla.properties.seccion;
			} else {
				fallaAComprobar = falla.properties.boceto;
				seccionBuena = falla.properties.seccion;
			}

			if (seccionBuena == seccionAComprobar || seccionAComprobar == "Todas") {

				if ((falla.properties.anyo_fundacion <= anoMax && falla.properties.anyo_fundacion >= anoMin) || (anoMin == "" && anoMax == "")) {

					let celdaResultado = document.createElement("div");
					celdaResultado.classList.add("celdas");
					celdaResultado.setAttribute("data-idfalla", falla.properties.id)
					let resultadoFallas = document.createElement("h4");
					resultadoFallas.innerText = falla.properties.nombre;
					let imagenFalla = document.createElement("img");
					imagenFalla.src = fallaAComprobar;

					celdaResultado.appendChild(resultadoFallas);
					celdaResultado.appendChild(imagenFalla);
					let valoracion = document.createElement("div");
					valoracion.classList.add("valoracion");
					for (let index = 1; index <= 5; index++) {
						let estrella = document.createElement("button");
						estrella.addEventListener("click", function () {
							colorEstrellaPulsada(this, index);
						});
						estrella.innerText = '★ ';
						estrella.dataset.index = index;
						estrella.dataset.fallaId = falla.properties.id;
						estrella.setAttribute("value", index)
						estrella.classList.add("estrellas");
						valoracion.appendChild(estrella);
					}
					celdaResultado.appendChild(valoracion);
					let ubicacion = document.createElement("button");
					ubicacion.innerText = "Ubicación";
					ubicacion.onclick = function () { buscarUbicacion(falla.geometry.coordinates, falla.properties.boceto); };
					ubicacion.classList.add("bntUbicacion");
					celdaResultado.appendChild(ubicacion);
					listado.appendChild(celdaResultado);
				}
			}
		});
	});
}

function valoracion(idFalla, valoracion) {


	/*Lo que haria yo abajo, seria una condicion de que busque si esa falla ha sido puntuada 
	y si lo ha sido por esta ip, si es asi entonces procederemos a hacer un if(falla ha sido puntuada)
	{revisa el valor de la puntuacion y rellena las estrellas}else {sigue cn rellenar estrellas}*/


}

async function colorEstrellaPulsada(ev, index) {

	var estrellas = document.querySelectorAll(`[  data-falla-id = '${ev.dataset.fallaId}' ]`);
	var index = ev.dataset.index;

	if (estrellas[0].style.color == "yellow") {
		for (let i = 0; i < 5; i++) {
			estrellas[i].style.color = "black";
		}
	}

	for (let i = 0; i < index; i++) {
		estrellas[i].style.color = "yellow";
	}

	ip = await getIp();

	puntuar(ev.dataset.fallaId, ev.dataset.index, ip);
}



function buscarUbicacion(coordenadas, urlImagen) {


	mapaContainer = document.getElementById('mapa');
	mapaContainer.style.visibility = 'visible';

	let coordenadasMapa = getWGSCoordinates(coordenadas);

	var map = L.map('mapa', { closePopupOnClick: false }).setView([coordenadasMapa[0], coordenadasMapa[1]], 16);
	mapaContainer.addEventListener('focusout', function () {
		mapaContainer.style.visibility = 'hidden';
		map.off();
		map.remove();

		padreMapa = document.getElementById('mapa').parentNode;
		padreMapa.removeChild(mapaContainer);

		var newMapaContainer = document.createElement("div");
		newMapaContainer.setAttribute("id", "mapa");
		padreMapa.appendChild(newMapaContainer);


	});


	let tilerMapUrl = 'https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=FeZF25xvZUuP463NS59g';
	L.tileLayer(tilerMapUrl, {
		attribution: 'Map data © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>, Imagery © <a href="http://www.kartena.se/">Kartena</a>',
	}).addTo(map);


	/* var imagenFalla = L.icon({
		iconUrl: urlImagen,
	
		iconSize:     [50, 50], // size of the icon
		iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
		popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
	}); */

	var popup = L.popup()
		.setContent(
			`<div class="popUpMapa">
			 <img src="${urlImagen}">
	 		</div>`)
		.openPopup();

	L.marker(coordenadasMapa).addTo(map).bindPopup(popup).openPopup();

	mapaContainer.focus();
}

function getWGSCoordinates(coordenadas) {

	// Cambiar la proyeccion de la referencia espacial 25830 a 4326
	let firstProjection = '+proj=utm +zone=30 +ellps=GRS80 +units=m +no_defs';
	let secondProjection = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
	coordenadas = proj4(firstProjection, secondProjection, coordenadas);

	return [coordenadas[1], coordenadas[0]];
}

function esconder() {

	busqueda = document.getElementsByClassName("busqueda")[0];

	if (busqueda.style.display != "block") {
		busqueda.style.display = "block";
	} else {
		busqueda.style.display = "none";
	}

}


window.onload = init;



function recogerIdMongoFalla(id) {
	fetch('/puntuaciones/' + id, {
		method: "GET"
	}).then(function (response) {
		return response.json();
	})
		.then(function (falla) {
			console.log(falla);
		});

}

function puntuar(idFalla, value, ip) {
	fetch('/puntuaciones/' + idFalla + "/" + value + "/" + ip, {
		method: "POST"
	}).then(function (response) {
		return response.json();
	})
		.then(function (falla) {
			console.log(falla);
		});

}

async function getIp() {
	let ipJson = await fetch('https://api6.ipify.org?format=json');
	let json = await ipJson.json();
	return json.ip;
}

