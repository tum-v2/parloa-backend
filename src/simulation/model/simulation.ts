import SimulationStatus from '../enum/simulation-status';
import SimulationConfig from './simulation-config.model';

// Simulation model class
class Simulation {
  id: string;
  config: SimulationConfig;
  status: SimulationStatus;

  constructor(id: string, config: SimulationConfig, status: SimulationStatus) {
    this.id = id;
    this.config = config;
    this.status = status;
  }
}

export default Simulation;
