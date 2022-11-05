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

let areaList = [];
let areaEczane = [];
let countPharmacy, areaName, selectedArea;
let map, marker, infowindow, contentString, latLng, latLon , locationMarker;
let markerArr = [];
let contentArr = [];
let allEczaneHeadToArr = [];


// ------------------------------------------------------------------------------------
// --- Get Data From API --------------------------------------------------------------
async function getDataFromAPI() {
  try {
    // Demo API For Available pharmacies in Adana
    const eczaneApi = await fetch("https://eczaneleri.net/api/eczane-api?demo=1&type=json", { mode: "cors" });
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
          map.setZoom(12);
          //  map.setCenter({ lat: 41.01667, lng: 28.96667 }); // for istanbul
          map.setCenter({ lat: 37.0000000, lng: 35.3300000 }); // for Adana
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
          locationMarker = new google.maps.Marker({ map: map });
          map.setCenter({ lat: specialParam.lat, lng: specialParam.lng });
          locationMarker.setPosition({ lat: specialParam.lat, lng: specialParam.lng });
          locationMarker.setTitle("My Location")
          map.setZoom(15);
          displayOnMapAllEczaneIncity();
          locationMarker.setIcon("./images/userLocationIconn.png");

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
          // marker.setIcon("./images/zft.png")
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
        // marker.setIcon("./images/zft.png")
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
      // marker.setIcon("./images/zft.png")
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
          <div id="content" dir="ltr" class="pe-4 fs-6 position-relative">
              <div class="text-danger mb-2 text-uppercase fw-semibold text-center ">
              ${getEczane.name}
              <span class="position-absolute handle-eczane-card-btn">
                <a class="text-decoration-none" href="http://maps.google.com/maps?q=${getEczane.maps}&ll=${getEczane.maps}&z=17" target="_blank">
                    <button id="activeEczaneBtn${getIndex}" class="all-eczane-btn btn btn-outline-info rounded-5 fs-6 border-0"><i class="fa-solid fa-diamond-turn-right"></i></button>
                </a>
              </span>
              </div>
              <div class="my-1"><i class="fa-solid fa-square-phone me-2 text-info"></i> ${getEczane.phone}</div>
              <div class="my-1 d-flex">
                <div><i class="fa-solid fa-location-dot text-info me-2"></i></div>
                <div>${getEczane.address}</div>
              </div>
          </div>`;
          contentArr.push(contentString);
          infowindow = new google.maps.InfoWindow({ content: contentArr[getIndex] , maxWidth : 300 });
    }


// --- Display Area List and Eczane List ----------------------------------------------
    function displayAreaList() {
      let areaPreparationForMob = `<option dir="auto" class="all-area fs-5" selected value="${0}">${areaList[0].areaName}  </option>`;
      let areaPreparationForPC = 
                  `<div class="swiper-slide loco_cat__carousel_slide mx-0 border-start border-1 border-light">
                      <button id="${0}" class="all-area btn btn-info shadow-none rounded-0 swiper-slide loco_cat__carousel_slide mx-0">
                        ${areaList[0].areaName}
                      </button>
                    </div>`

      areaList.forEach((area, i) => {
        if (i > 0) {
          areaName = area.areaName;
          countPharmacy = area.countPharmacy;
          areaPreparationForMob += `
          <option dir="auto" class="all-area fs-5" value="${i}"> ${areaName}</option>`;
          areaPreparationForPC +=
          `<div class="swiper-slide loco_cat__carousel_slide mx-0 border-start border-1 border-light">
              <button id="${i}" class="all-area btn btn-info shadow-none rounded-0 swiper-slide loco_cat__carousel_slide mx-0">
                ${areaName}
              </button>
            </div>`
        }  
      });
      fillAreasForMOB.innerHTML = areaPreparationForMob
      fillAreasForMOB.addEventListener("change" , (e)=>{
        selectedArea = areaList[e.target.value];
        areaEczane = selectedArea.pharmacy;
        displayEczaneListOfOneArea();
        displayOnMap("allEczaneOfArea");
      })

      fillAreasForPC.innerHTML = areaPreparationForPC
      fillAreasForPC.addEventListener("click" , (e)=>{
        selectedArea = areaList[e.target.id];
        areaEczane = selectedArea.pharmacy;
        displayEczaneListOfOneArea();
        displayOnMap("allEczaneOfArea");
      })
      displayEczaneListOfOneArea();
    }
  
    function displayEczaneListOfOneArea() {
      let areaEczanePreparation = ``;
      areaEczane.forEach((eczane, i) => {
        areaEczanePreparation += 
          `<div dir="auto" id="activeEczane${i}"class="all-eczane-body shadow-sm border border-light border-2 mb-3 p-3 position-relative rounded rounded">
                <div class="">
                  <a class="text-decoration-none d-block" href="#map">
                    <h6 id="${i}" class="all-eczane-head text-danger text-uppercase fw-semibold" style="cursor: pointer">${eczane.name}</h6>
                  </a> 
                </div>
                <div class="m-0">
                  <p class="m-0 m-1"><i class="fa-solid fa-square-phone text-info me-2"></i>${eczane.phone}</p>
                  <div class="m-0 m-1 d-flex">
                    <div><i class="fa-solid fa-location-dot text-info me-2"></i></div>
                    <div>${eczane.address}</div>
                  </div>
                </div>  
                <a class="text-decoration-none position-absolute handle-eczane-card-btn" href="http://maps.google.com/maps?q=${eczane.maps}&ll=${eczane.maps}&z=17" target="_blank">
                    <button id="activeEczaneBtn${i}" class="all-eczane-btn btn btn-outline-info rounded-5 fs-5 border-0"><i class="fa-solid fa-diamond-turn-right"></i></button>
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
        eczane.classList.add("bg-third-c" , "border-light");
        eczane.classList.remove("bg-danger-c-95");

      });
      activeEczane.classList.replace("bg-third-c", "bg-danger-c-95");
      activeEczane.classList.remove("border-light")
      activeEczaneBtn.classList.replace("btn-outline-danger", "btn-outline-light");
    }
}

// --- Wait For API -------------------------------------------------------------------
async function waitForApi() {
  await getDataFromAPI()
  afterGettingData()
}
waitForApi();



// --- jQuery -------------------------------------------------------------------


  jQuery('.swiper-container').each(function () {
    var swiperThis = jQuery(this);
    var loopLength = swiperThis.data('slides-per-view');
    var divLength = jQuery(this).find("div.swiper-slide").length;
    var nextbtn = swiperThis.closest(".swiper-btns").find('.carousel__btn_next');
    var prevbtn = swiperThis.closest(".swiper-btns").find('.carousel__btn_prev');
    var sPagination = swiperThis.closest(".swiper-cpagination").find('.carousel__pagination');
    if (divLength >= loopLength) {
      var locoSwiper = new Swiper(swiperThis, {
        slidesPerView: swiperThis.data('slides-per-view'),
        observer: true,
        observeParents: true,
        spaceBetween: swiperThis.data("space-between"),
        loop: swiperThis.data("loop"),
        clickable: swiperThis.data("click"),
        centeredSlides: swiperThis.data("center-slide"),
        freeMode: swiperThis.data("free-mode"),
        effect: swiperThis.data("effect"),
        autoHeight: swiperThis.data("auto-height"),
        autoplay: swiperThis.data("auto-play"),
        pagination: {
          el: sPagination,
          clickable: true,
          dynamicBullets: swiperThis.data("dynamic-bullets"),
        },
        navigation: {
          nextEl: nextbtn,
          prevEl: prevbtn
        },
        scrollbar: {
          container: swiperThis,
          hide: true,
        },
        breakpoints: {
          // when window width is >= 320px
          320: {
            slidesPerView: swiperThis.data("spvxs"),
            spaceBetween: swiperThis.data("space-between"),
          },
          // when window width is >= 576px
          576: {
            slidesPerView: swiperThis.data("spvsm"),
            spaceBetween: swiperThis.data("space-between"),
          },
          // when window width is >= 768px
          768: {
            slidesPerView: swiperThis.data("spvmd"),
            spaceBetween: swiperThis.data("space-between"),
          },
          // when window width is >= 992px
          992: {
            slidesPerView: swiperThis.data("spvlg"),
            spaceBetween: swiperThis.data("space-between"),
          },
          1200:{
            slidesPerView: swiperThis.data("spvxl"),
            spaceBetween: swiperThis.data("space-between"),
          }
        }
      });
    }else{
      var locoSwiper = new Swiper(swiperThis, {
        slidesPerView: swiperThis.data("slides-per-view"),
        spaceBetween: swiperThis.data("space-between"),
        loop: false,
        clickable: swiperThis.data("click"),

        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.carousel__btn_next',
          prevEl: '.carousel__btn_prev',
        },
        scrollbar: {
          container: swiperThis,
          hide: true,
        },
        breakpoints: {
          // when window width is >= 320px
          320: {
            slidesPerView: swiperThis.data("spvxs"),
            spaceBetween: swiperThis.data("space-between"),
          },
          // when window width is >= 576px
          576: {
            slidesPerView: swiperThis.data("spvsm"),
            spaceBetween: swiperThis.data("space-between"),
          },
          // when window width is >= 768px
          768: {
            slidesPerView: swiperThis.data("spvmd"),
            spaceBetween: swiperThis.data("space-between"),
          },
          // when window width is >= 992px
          992: {
            slidesPerView: swiperThis.data("spvlg"),
            spaceBetween: swiperThis.data("space-between"),
          },
          1200: {
            slidesPerView: swiperThis.data("spvxl"),
            spaceBetween: swiperThis.data("space-between"),
          }
        }
      });
    }
  });
