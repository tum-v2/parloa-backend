import SimulationConfig from '../model/simulation-config.model';
import Simulation from '../model/simulation';
import SimulationStatus from '../enum/simulation-status';

// Simulation-specific functionality called by controllers or other services
async function initiate(simulationConfig: SimulationConfig) {
  console.log('Simulation initiated...');
  console.log('Configuration:', simulationConfig);

  console.log('Creating simulation object...');
  const simulation = new Simulation('1', simulationConfig, SimulationStatus.SCHEDULED);
  console.log(simulation);

  //TODO Wake agents up

  return simulation;
}

async function poll(simulationId: string) {
  console.log(simulationId);
  // TODO fetch simulation from db
  // TODO trim unnecessary details
}

async function getDetails(simulationId: string) {
  console.log(simulationId);
  // TODO fetch simulation from db
  // TODO trim unnecessary details

  // return {timeToRun, numOfInteractions, numOfRuns, successRate}
}

async function getConversations(simulationId: string) {
  console.log(simulationId);

  // TODO return conversations of a single simulation
}

export default {
  initiate,
  poll,
  getDetails,
  getConversations,
};
