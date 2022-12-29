/*
DEFINITIONS
Calorie [cal]  Quantité d'énergie nécessaire pour élever la température d’un gramme d'eau liquide de 1 °C. Vaut environ 4,184 joules
Joule []  Unité de puissance : un watt vaut 1 joule par seconde, soit environ 0,239 calorie par seconde
	*/

const solardecl = 23.44;
latitude = 46.47;
let v_solarcellnominalpower = 4;
const v_heaterperformance = {
  Electrique: {
    performance: 0.6, // Classe C https://www.hornbach.ch/shop/Chaudiere-Pacific-S-400-Litres-debout/7540029/article.html
    pricekwh: 18.15 + 7.82 + 1.74, //https://www.romande-energie.ch/images/files/prix-electricite/2023_prix-electricite_re.pdf
    tax: 0.023, //https://www.strom.ch/fr/connaissances-sur-lenergie/production-et-negoce/strompreise#:~:text=Les%20redevances%20publiques%20et%20la,taxes)%20constituent%20la%20troisi%C3%A8me%20composante.&text=En%202022%2C%20le%20prix%20de,.%2FkWh%20(moyenne).
    power: 3,
	volume:200,
  },
  Mazout: {
    performance: 0.9 * 0.95 * 0.95, //https://energieplus-lesite.be/evaluer/chauffage4/evaluer-efficacite-energetique-production-chaleur/evaluer-l-efficacite-energetique-des-chaudieres/
    pricekwh: 126 / 10.7,
    tax: 0.025, //https://www.avenergy.ch/fr/chauffer-au-mazout/legislation/loi-sur-le-co2#:~:text=La%20fa%C3%A7on%20dont%20la%20taxe,2%20dans%20la%20loi%20actuelle.
    power: 20,
	volume:70,
  },
};

sunhours = [4, 5, 7, 8, 9, 11, 11, 10, 8, 6, 5, 4]; // https://fr.climate-data.org/europe/suisse/geneve/geneve-839/
dayduration = [
  [8, 17],
  [8, 18],
  [7, 18],
  [8, 19],
  [6, 20],
  [6, 21],
  [6, 21],
  [6, 20],
  [8, 19],
  [7, 18],
  [8, 18],
  [8, 17],
];

function getDateTime(now) {
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  if (month.toString().length == 1) {
    month = "0" + month;
  }
  if (day.toString().length == 1) {
    day = "0" + day;
  }
  if (hour.toString().length == 1) {
    hour = "0" + hour;
  }
  if (minute.toString().length == 1) {
    minute = "0" + minute;
  }
  if (second.toString().length == 1) {
    second = "0" + second;
  }
  var dateTime =
    year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second;
  var dateTime =
    year + "-" + month + "-" + day + "T" + hour + ":" + minute;
  return dateTime;
}

function gramcal2joule(cal) {
  return cal * 4.184;
}

function ltrdeg2gramcal(ltr, deg) {
  return 1000 * ltr * deg;
}

function joule2kwh(joule) {
  return joule / (3600 * 1000);
}

function kwh2frs(kwh, pricekwh) {
  return (pricekwh * kwh) / 100;
}

function mixer(inTempA, inTempB, outTemp, outLiter) {
  inLiterA = (outLiter * (outTemp - inTempB)) / (inTempA - inTempB);
  inLiterB = outLiter - inLiterA;
  return {
    inTempA: inTempA,
    inTempB: inTempB,
    outTemp: outTemp,
    inLiterA: inLiterA,
    inLiterB: inLiterB,
  };
}

function solarcourse(month, hour) {
  sod = dayduration[month][0];
  eod = dayduration[month][1];
  ddur = eod - sod;
  angle = ((hour - sod) / ddur) * 180;
  if (hour < sod || hour > eod) angle = 0;
  return angle;
}

function dayofyear(date) {
  var start = new Date(date.getFullYear(), 0, 0);
  var diff =
    date -
    start +
    (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);
  return day;
}

function deg2rad(deg) {
  return (Math.PI / 180) * deg;
}

function rad2deg(rad) {
  return rad * (180 / Math.PI);
}

function sunangleatdatetime(date) {
  doy = dayofyear(date);
  equinox = dayofyear(new Date(date.getFullYear(), 2, 20));
  sin = Math.sin(deg2rad((((doy + 365 - equinox) % 365) / 365.242) * 360));
  declatdate = sin * solardecl;
  declatlatitude = declatdate + latitude;
  declatlatitudesin = Math.sin(deg2rad(declatlatitude));
  hoursin = Math.sin(deg2rad(solarcourse(date.getMonth(), date.getHours())));
  realsin = declatlatitudesin * hoursin;
  realangle = rad2deg(Math.asin(realsin));
  return realangle;
}

function ratiosun(month) {
  return sunhours[month] / 12;
}

function ratiolight(month) {
  return ratiosun(month);
}

function poweratdatetime(date) {
  let a = sunangleatdatetime(date);

  if (a > 0) {
    return (
      v_solarcellnominalpower * Math.sin(deg2rad(a)) * ratiolight(date.getMonth())
    );
  }
  return 0;
}
function visiblesolarangle(date) {
  let a = sunangleatdatetime(date);
  return a > 0 ? a : 0;
}
