const Big = require('big-js');

// Returns the infectionsByRequestedTime value
const infections = (currentlyInfected, timeToElapse, periodType) => {
  let infectionsByRequestedTime = null;
  let days;
  switch (periodType) {
    case 'days':
      infectionsByRequestedTime = currentlyInfected * (2 ** (Math.trunc(timeToElapse / 3)));
      break;
    case 'weeks':
      days = timeToElapse * 7;
      infectionsByRequestedTime = currentlyInfected * (2 ** (Math.trunc(days / 3)));
      break;
    case 'months':
      days = timeToElapse * 30;
      infectionsByRequestedTime = currentlyInfected * (2 ** (Math.trunc(days / 3)));
      break;
    default:
      infectionsByRequestedTime = currentlyInfected * (2 ** (Math.trunc(timeToElapse / 3)));
      break;
  }

  return infectionsByRequestedTime;
};

const bedsByRequestedTime = (totalHospitalBeds, severeCasesByRequestedTime) => {
  const available = totalHospitalBeds * 0.35;
  return available - severeCasesByRequestedTime;
};

const dollarsInFlght = (infectionsBRTime, avgDIPopulation, avgDailyIIUSD, timeToE, periodType) => {
  let inflight = null;
  let days;
  switch (periodType) {
    case 'days':
      inflight = (infectionsBRTime * avgDIPopulation * avgDailyIIUSD) / timeToE;
      break;
    case 'weeks':
      days = timeToE * 7;
      inflight = (infectionsBRTime * avgDIPopulation * avgDailyIIUSD) / days;
      break;
    case 'months':
      days = timeToE * 30;
      inflight = (infectionsBRTime * avgDIPopulation * avgDailyIIUSD) / days;
      break;
    default:
      inflight = (infectionsBRTime * avgDIPopulation * avgDailyIIUSD) / timeToE;
      break;
  }
  return Math.trunc(inflight);
};

const severeCases = (infectionsBRTime) => Math.trunc(infectionsBRTime * 0.15);

const casesForICU = (infectionsBRTime) => infectionsBRTime * 0.05;

const casesForVentilators = (infectionsBRTime) => infectionsBRTime * 0.02;

const covid19ImpactEstimator = (req,res,next) => {
  const data = req.body;
  const {
    reportedCases,
    timeToElapse,
    periodType,
    totalHospitalBeds
  } = data;

  const { avgDailyIncomeInUSD, avgDailyIncomePopulation } = data.region;

  const periodT = periodType;
  const timeToE = Big(timeToElapse);
  const reported = Big(reportedCases);
  const hospitalBeds = Big(totalHospitalBeds);
  const avgDailyIncome = Big(avgDailyIncomeInUSD);
  const avgDailyPn = Big(avgDailyIncomePopulation);

  const impact = {
    currentlyInfected: reported * 10,
    get infectionsByRequestedTime() {
      return Math.trunc(infections(this.currentlyInfected, timeToE, periodT));
    },
    get severeCasesByRequestedTime() {
      return severeCases(this.infectionsByRequestedTime);
    },
    get hospitalBedsByRequestedTime() {
      return Math.trunc(bedsByRequestedTime(hospitalBeds, this.severeCasesByRequestedTime));
    },
    get casesForICUByRequestedTime() {
      return Math.trunc(casesForICU(this.infectionsByRequestedTime));
    },
    get casesForVentilatorsByRequestedTime() {
      return Math.trunc(casesForVentilators(this.infectionsByRequestedTime));
    },
    get dollarsInFlight() {
      return Math.trunc(dollarsInFlght(
        this.infectionsByRequestedTime,
        avgDailyPn,
        avgDailyIncome,
        timeToE,
        periodT
      ));
    }
  };

  const severeImpact = {
    currentlyInfected: reported * 50,
    get infectionsByRequestedTime() {
      return Math.trunc(infections(this.currentlyInfected, timeToE, periodT));
    },
    get severeCasesByRequestedTime() {
      return severeCases(this.infectionsByRequestedTime);
    },
    get hospitalBedsByRequestedTime() {
      return Math.trunc(bedsByRequestedTime(hospitalBeds, this.severeCasesByRequestedTime));
    },
    get casesForICUByRequestedTime() {
      return Math.trunc(casesForICU(this.infectionsByRequestedTime));
    },
    get casesForVentilatorsByRequestedTime() {
      return Math.trunc(casesForVentilators(this.infectionsByRequestedTime));
    },
    get dollarsInFlight() {
      return Math.trunc(dollarsInFlght(
        this.infectionsByRequestedTime,
        avgDailyPn,
        avgDailyIncome,
        timeToE,
        periodT
      ));
    }
  };

  res.body= {
    data,
    impact,
    severeImpact
  };


  next()
};

module.exports = covid19ImpactEstimator;