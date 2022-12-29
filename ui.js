function function_initui(){
    function_init_heatingselector(document.forms["form_heatingSelector"]);
    function_initSolarcell();
    
    return;
}


function function_init_heatingselector(thisForm) {
    s = thisForm.formfield_heatingSelector;
    for (var v_system in v_heaterperformance) {
      opt = document.createElement("option");
      opt.value = v_system;
      opt.innerHTML = v_system;
      s.appendChild(opt);
      console.log(v_system);
    }
    function_onChange_heatingSelector(s);
  }

  function function_onChange_heatingSelector(e) {
    thisForm = e.form;
    v_performance = v_heaterperformance[e.value].performance;
    v_pricekwh = v_heaterperformance[e.value].pricekwh;
    v_heaterpower = v_heaterperformance[e.value].power;
    v_volume = v_heaterperformance[e.value].volume;
    thisForm.formfield_pricekwh.value = (v_pricekwh / 100).toFixed(3);
    thisForm.formfield_performance.value = (v_performance * 100).toFixed(2);
    thisForm.formfield_heaterpower.value = v_heaterpower;
    thisForm.formfield_volume.value = v_volume;
  }
  

function function_initSolarcell() {
  thisForm = document.forms["form_solarcell"];
  thisForm.formfield_datehour.value = getDateTime(new Date());
  thisForm.formfield_powermax.value = v_solarcellnominalpower;
  function_computeSolarcell();
  return;
}

function function_computeSolarcell() {
  thisForm = document.forms["form_solarcell"];
  v_solarcellnominalpower = thisForm.formfield_powermax.value;
  thisForm.formfield_solarangle.value = visiblesolarangle(     new Date(thisForm.formfield_datehour.value)   ).toFixed(0);
  thisForm.formfield_risehour.value = dayduration[new Date(thisForm.formfield_datehour.value).getMonth()][0];
  thisForm.formfield_sethour.value = dayduration[new Date(thisForm.formfield_datehour.value).getMonth()][1];
  thisForm.formfield_brighthour.value = sunhours[new Date(thisForm.formfield_datehour.value).getMonth()];
  thisForm.formfield_seasonalperformance.value = (ratiolight(new Date(thisForm.formfield_datehour.value).getMonth()) * 100).toFixed(0);
  thisForm.formfield_powerout.value = poweratdatetime(new Date(thisForm.formfield_datehour.value)).toFixed(3);
  return;
}

function function_computewatermixer(e) {
  thisForm = e.form;
  v_tc = thisForm.formfield_tc.value;
  v_tf = thisForm.formfield_tf.value;
  v_tm = thisForm.formfield_tm.value;
  v_vm = thisForm.formfield_vm.value;

  v_mix = mixer(v_tc, v_tf, v_tm, v_vm);
  v_vc = v_mix.inLiterA;
  v_vf = v_mix.inLiterB;

  thisForm.formfield_vc.value = v_vc.toPrecision(2);
  thisForm.formfield_vf.value = v_vf.toPrecision(2);

  v_rc = ((v_volume - v_vc) * v_tc + v_vc * v_tf) / v_volume;
  thisForm.formfield_rc.value = v_rc.toPrecision(2);
  return;
}

function function_computerequiredheatingpower(e) {
  thisForm = e.form;
  v_ta = thisForm.formfield_ta.value;
  v_tb = thisForm.formfield_tb.value;
  v_liters = thisForm.formfield_liters.value;
  v_kwh_net = joule2kwh(gramcal2joule(ltrdeg2gramcal(v_liters, v_tb - v_ta)));
  v_kwh_brut = v_kwh_net / v_performance;
  thisForm.formfield_kwh.value = v_kwh_brut.toPrecision(3);
  thisForm.formfield_frs.value = kwh2frs(v_kwh_brut, v_pricekwh).toPrecision(3);
  thisForm.formfield_duration.value = (v_kwh_brut / v_heaterpower).toFixed(2);
  return;
}

function function_computekwh2frs(e) {
  thisForm = e.form;
  thisForm.formfield_frs.value = kwh2frs(
    thisForm.formfield_kwh.value,
    v_pricekwh
  ).toPrecision(3);
  return;
}
function function_prefillkwh2frs(e) {
  thisForm = e.form;
  form_solarcell = document.forms["form_solarcell"];
  form_requiredheatingpower = document.forms["form_requiredheatingpower"];
  thisForm.formfield_kwh.value =
    (form_requiredheatingpower.formfield_kwh.value -
    form_requiredheatingpower.formfield_duration.value *
      form_solarcell.formfield_powerout.value).toFixed(2);
  return;
}
