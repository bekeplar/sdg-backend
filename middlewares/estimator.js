const covid19ImpactEstimator = (data) => {
  const {
    reportedCases,
    timeToElapse,
    periodType,
    totalHospitalBeds,
    region,
  } = data;
  let rate;
  let period;

  if (periodType === 'days') {
    rate = Math.floor(timeToElapse / 3);
    period = timeToElapse;
  } else if (periodType === 'weeks') {
    rate = Math.floor((timeToElapse * 7) / 3);
    period = timeToElapse * 7;
  } else {
    rate = Math.floor((timeToElapse * 30) / 3);
    period = timeToElapse * 30;
  }
  // pandemic computations.
  const impactCurrentlyInfected = reportedCases * 10;
  const impactInfectionsByRequestedTime = impactCurrentlyInfected * (2 ** rate);
  const casesByRequestedTime = Math.ceil(impactInfectionsByRequestedTime * 0.15);
  const totalBeds = Math.ceil(totalHospitalBeds * 0.35);
  const impactHospitalBedsByRequestedTime = Math.ceil(totalBeds - casesByRequestedTime);
  const impactCasesForICUByRequestedTime = Math.floor(impactInfectionsByRequestedTime * 0.05);
  const impactCasesForVentilatorsByRequestedTime = Math.floor(impactInfectionsByRequestedTime
                                                    * 0.02);
  const impactDollarsInFlight = Math.floor((impactInfectionsByRequestedTime
                                      * region.avgDailyIncomePopulation
                                      * region.avgDailyIncomeInUSD) / period);

  // worst case computations.
  const severeImpactCurrentlyInfected = reportedCases * 50;
  const severeImpactInfectionsByRequestedTime = severeImpactCurrentlyInfected * (2 ** rate);
  const severeCasesByRequestedTime = Math.ceil(severeImpactInfectionsByRequestedTime * 0.15);
  const hospitalBedsByRequestedTime = Math.ceil(totalBeds - severeCasesByRequestedTime);
  const casesForICUByRequestedTime = Math.floor(severeImpactInfectionsByRequestedTime * 0.05);
  const casesForVentilatorsByRequestedTime = Math.floor(severeImpactInfectionsByRequestedTime
                                                * 0.02);
  const dollarsInFlight = Math.floor((severeImpactInfectionsByRequestedTime
                              * region.avgDailyIncomePopulation
                              * region.avgDailyIncomeInUSD) / period);


  // data for best case scenarios.
  const impact = {
    currentlyInfected: impactCurrentlyInfected,
    infectionsByRequestedTime: impactInfectionsByRequestedTime,
    severeCasesByRequestedTime: casesByRequestedTime,
    hospitalBedsByRequestedTime: impactHospitalBedsByRequestedTime,
    casesForICUByRequestedTime: impactCasesForICUByRequestedTime,
    casesForVentilatorsByRequestedTime: impactCasesForVentilatorsByRequestedTime,
    dollarsInFlight: impactDollarsInFlight,
  };

  // worst case attributions.

  const severeImpact = {
    currentlyInfected: severeImpactCurrentlyInfected,
    infectionsByRequestedTime: severeImpactInfectionsByRequestedTime,
    severeCasesByRequestedTime,
    hospitalBedsByRequestedTime,
    casesForICUByRequestedTime,
    casesForVentilatorsByRequestedTime,
    dollarsInFlight,
  };


  return {
    data,
    impact,
    severeImpact,
  };
};
module.exports = covid19ImpactEstimator;