import SimulationConfig from '../model/simulation-config.model';
import Simulation from '../model/simulation';
import SimulationStatus from '../enum/simulation-status';

// Simulation-specific functionality called by controllers or other services
async function initSimulation(simulationConfig: SimulationConfig) {
  console.log('Simulation initiated...');
  console.log('Configuration:', simulationConfig);

  console.log('Creating simulation object...');
  const simulation = new Simulation('1', simulationConfig, SimulationStatus.SCHEDULED);
  console.log(simulation);

  //TODO Wake agents up

  return simulation;
}

async function pollSimulation(simulationId: string) {
  console.log(simulationId);
  // TODO fetch simulation from db
  // TODO trim unnecessary details
}

async function getSimulationDetails(simulationId: string) {
  console.log(simulationId);
  // TODO fetch simulation from db
  // TODO trim unnecessary details

  // return {timeToRun, numOfInteractions, numOfRuns, successRate}
}

export default {
  initSimulation,
  pollSimulation,
  getSimulationDetails,
};
