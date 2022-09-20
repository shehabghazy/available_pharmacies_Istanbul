"use strict";

const afterSpinner = document.getElementById('afterSpinner')
const spinner = document.getElementById('spinner')
window.addEventListener('load',async ()=>{
  afterSpinner.classList.remove('d-none')
  spinner.classList.add('d-none')
})

const numberOfEczane = document.getElementById("numberOfEczane");
const nameOfarea = document.getElementById("nameOfarea");
const numberOfEczaneCase = document.getElementById("numberOfEczaneCase");
const dutyEczane = document.getElementById("dutyEczane");
const cityLocation = document.getElementById("cityLocation");
const mapContainer = document.getElementById("mapContainer");
const eczaneDetailsPopop = document.getElementById("eczaneDetailsPopop");
const clickGetLocation = document.getElementsByClassName("click-get-location");
let clickGetLocationArr = Array.from(clickGetLocation);
const displayCityBtn = document.getElementById("displayCityBtn");
const fillAreas = document.getElementsByClassName('fill-arieas') 
let fillAreasArr = Array.from(fillAreas);

let areaList = [];
let areaEczane = [];
let countPharmacy, areaName, selectedArea;
let map, marker, infowindow, contentString, latLng, latLon;
let markerArr = [];
let contentArr = [];
let allEczaneHeadToArr = [];

// ------------------------------------------------------------------------------------
// --- Get Data From API --------------------------------------------------------------
async function getDataFromAPI() {
  try {
    const eczaneApi = await fetch("https://yourmedicalfamily.com/eczaneAPI/proxy/?get=https://eczaneleri.net/api/eczane-api?key=49d7e314a30f868c478cefd10ed1083c", { mode: "cors" });
    const finalResult = await eczaneApi.json();
    areaList = finalResult.data[0].area;
    areaEczane = areaList[0].pharmacy;
    selectedArea = areaList[0]
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'عذرا !',
      text: 'نواجه مشكلة في تحديث البيانات .. من فضلك أعد المحاولة مرة أخرى',
    })
  }
  ;
}

function afterGettingData() {
        displayOnMap("defaulMap");
        displayAreaList()

// --- Display On Map -----------------------------------------------------------------
    function displayOnMap(forWhat, specialParam) {
      map = new google.maps.Map( mapContainer );
      marker = new google.maps.Marker({ map: map });
      switch (forWhat) {
        case "defaulMap":
          map.setZoom(10);
          map.setCenter({ lat: 41.01667, lng: 28.96667 }); // istanbul
          displayOnMapAllEczaneIncity();
          break;
  
        case "allEczaneOfArea":
          map.setZoom(13);
          displayOnMapAllEczaneInOneArea(selectedArea.pharmacy);
          break;
  
        case "selectedEczane":
          map.setZoom(15);
          displayOnMapSelectedEczane(specialParam);
          break;
  
        case "userLocation":
          map.setCenter({ lat: specialParam.lat, lng: specialParam.lng });
          marker.setPosition({ lat: specialParam.lat, lng: specialParam.lng });
          marker.setTitle("My Location")
          map.setZoom(15);
          marker.setIcon("./images/userLocationIconn.png");
          displayOnMapAllEczaneIncity();
          break;
  
        default:
          // default case
          break;
      }
    }
  
    function displayOnMapAllEczaneIncity() {
      markerArr = [];
      contentArr = [];
      areaList.forEach((area) => {
        area.pharmacy.forEach((eczane, i) => {
          generateMarkersForMap(eczane)
          generateInfoWindowForMap(eczane , i)
        });
      });
  
      for (let i = 0; i < markerArr.length; i++) {
        markerArr[i].addListener("click", () => {
          infowindow.setContent(contentArr[i]);
          infowindow.open({ anchor: markerArr[i], map });
        });
      }
    }
  
    displayCityBtn.addEventListener("click", () => {
      location.reload();
    });
  
  
    function displayOnMapAllEczaneInOneArea(areaEczaneArr) {
      let firstEczaneInAreaLatLng = areaEczaneArr[0].maps.split(",");
      map.setCenter({
        lat: +firstEczaneInAreaLatLng[0],
        lng: +firstEczaneInAreaLatLng[1],
      });
      markerArr = [];
      contentArr = [];
      areaEczaneArr.forEach((eczane, i) => {
        generateMarkersForMap(eczane)
        generateInfoWindowForMap(eczane , i)
        markerArr[i].addListener("click", () => {
          infowindow.setContent(contentArr[i]);
          infowindow.open({ anchor: markerArr[i], map });
        });
      });
    }
  
    function displayOnMapSelectedEczane(target) {
      const getEczaneFromList = target.id;
      let markerTitle = target.innerHTML;
      let ecLat = areaEczane[getEczaneFromList].maps.split(",")[0];
      let ecLng = areaEczane[getEczaneFromList].maps.split(",")[1];
      map.setCenter({ lat: +ecLat, lng: +ecLng });
      latLng = new google.maps.LatLng(ecLat, ecLng);
      marker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: markerTitle,
      });
      generateInfoWindowForMap(areaEczane[getEczaneFromList] , getEczaneFromList)
      marker.addListener("click", () => {
        infowindow.setContent(contentArr[getEczaneFromList]);
        infowindow.open({ anchor: marker, map });
      });
    }
  
    function displayOnMapUserLocation() {
      function getLocation() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(showPosition);
        }
      }
      function showPosition(position) {
        let userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        displayOnMap("userLocation", userCoords);
      }
      getLocation();
    }
    clickGetLocationArr.forEach((btn) => {
      btn.addEventListener("click", () => {
        displayOnMapUserLocation();
      });
    });

    function generateMarkersForMap(getEczane) {
      latLon = getEczane.maps.split(",");
          let eczaneName = getEczane.name;
          latLng = new google.maps.LatLng(latLon[0], latLon[1]);
          marker = new google.maps.Marker({
            position: latLng,
            map: map,
            title: eczaneName,
          });
          markerArr.push(marker);
    }

    function generateInfoWindowForMap(getEczane , getIndex) {
      contentString = `
          <div id="content" dir="ltr" class="pe-4 fs-6">
              <div class="text-danger text-uppercase fw-semibold text-center position-relative">
              ${getEczane.name}
              <span class="position-absolute top-0 end-0">
                <a class="text-decoration-none" href="http://maps.google.com/maps?q=${getEczane.maps}&ll=${getEczane.maps}&z=17" target="_blank">
                    <button id="activeEczaneBtn${getIndex}" class="all-eczane-btn btn btn-outline-danger rounded-5 fs-6 border-0"><i class="fa-solid fa-diamond-turn-right"></i></button>
                </a>
              </span>
              </div>
              <span><i class="fa-solid fa-square-phone"></i> ${getEczane.phone}</span>
              
              <div><i class="fa-solid fa-location-dot"></i> ${getEczane.address}</div>
          </div>`;
          contentArr.push(contentString);
          infowindow = new google.maps.InfoWindow({ content: contentArr[getIndex] , maxWidth : 300 });
    }


// --- Display Area List and Eczane List ----------------------------------------------
    function displayAreaList() {
      let areaPreparation = `<option dir="auto" class="all-area fs-5" selected value="${0}">${areaList[0].areaName}  </option>`;
      areaList.forEach((area, i) => {
        if (i > 0) {
          areaName = area.areaName;
        countPharmacy = area.countPharmacy;
        areaPreparation += `
          <option dir="auto" class="all-area fs-5" value="${i}"> ${areaName}</option>`;
        }  
      });
  
      fillAreasArr.forEach( element => {
        element.innerHTML = areaPreparation
        element.addEventListener("change", (e) => {
          selectedArea = areaList[e.target.value];
          areaEczane = selectedArea.pharmacy;
          displayEczaneListOfOneArea();
          displayOnMap("allEczaneOfArea");
        });
      })
      displayEczaneListOfOneArea();
    }
  
    function displayEczaneListOfOneArea() {
      let areaEczanePreparation = ``;
      areaEczane.forEach((eczane, i) => {
        areaEczanePreparation += 
          `<div dir="auto" id="activeEczane${i}"class="all-eczane-body bg-third-c mb-2 p-1 position-relative rounded rounded-1">
                <div class="">
                  <a class="text-decoration-none d-block" href="#map">
                    <h6 id="${i}" class="all-eczane-head text-danger text-uppercase fw-semibold" style="cursor: pointer">${eczane.name}</h6>
                  </a> 
                </div>
                <div class="m-0">
                  <p class="m-0 ms-1"><i class="fa-solid fa-square-phone"></i> ${eczane.phone}</p>
                  <p class="m-0 ms-1"><i class="fa-solid fa-location-dot"></i> ${eczane.address}</p>
                </div>  
                <a class="text-decoration-none position-absolute top-0 end-0" href="http://maps.google.com/maps?q=${eczane.maps}&ll=${eczane.maps}&z=17" target="_blank">
                    <button id="activeEczaneBtn${i}" class="all-eczane-btn btn btn-outline-danger rounded-5 fs-5 border-0"><i class="fa-solid fa-diamond-turn-right"></i></button>
                </a>
            </div>`;
      });
      switch (areaEczane.length) {
        case 1:
          numberOfEczane.innerHTML = "";
          numberOfEczaneCase.innerHTML = "صيدلية واحدة في";
          break;
        case 2:
          numberOfEczane.innerHTML = "";
          numberOfEczaneCase.innerHTML = "صيدليتان في";
          break;
        default:
          numberOfEczane.innerHTML = areaEczane.length;
          numberOfEczaneCase.innerHTML = "صيدليات في";
          break;
      }
      nameOfarea.innerHTML = selectedArea.areaName;
      dutyEczane.innerHTML = areaEczanePreparation;
      const allEczaneHead = document.getElementsByClassName(`all-eczane-head`);
      allEczaneHeadToArr = Array.from(allEczaneHead);
      allEczaneHeadToArr.forEach((eczaneHead) => {
        eczaneHead.addEventListener("click", (e) => {
          changeAppearanceOfSelectedEczaneCard(e);
          let eczaneNm = e.target.innerHTML;
          displayOnMap("selectedEczane", e.target);
        });
      });
    }
  
    function changeAppearanceOfSelectedEczaneCard(info) {
      const getEczaneFromList = info.target.id;
      const activeEczane = document.getElementById(
        `activeEczane${getEczaneFromList}`
      );
      const activeEczaneHead = document.getElementById(`${info.target.id}`);
      const activeEczaneBtn = document.getElementById(
        `activeEczaneBtn${getEczaneFromList}`
      );
      const allEczane = document.getElementsByClassName(`all-eczane-body`);
      const allEczaneToArr = Array.from(allEczane);
      const allEczaneBtn = document.getElementsByClassName(`all-eczane-btn`);
      const allEczaneBtnToArr = Array.from(allEczaneBtn);
      allEczaneToArr.forEach((eczane) => {
        eczane.classList.add("bg-third-c");
        eczane.classList.remove("bg-danger-c-95");
      });
      allEczaneHeadToArr.forEach((eczane) => {
        eczane.classList.add("text-danger");
        eczane.classList.remove("text-light");
      });
      allEczaneBtnToArr.forEach((eczane) => {
        eczane.classList.add("btn-outline-danger");
        eczane.classList.remove("btn-outline-light");
      });
      activeEczane.classList.replace("bg-third-c", "bg-danger-c-95");
      activeEczaneHead.classList.replace("text-danger", "text-light");
      activeEczaneBtn.classList.replace("btn-outline-danger", "btn-outline-light");
    }
}


// --- Wait For API -------------------------------------------------------------------
async function waitForApi() {
  await getDataFromAPI()
  afterGettingData()
}
waitForApi();
