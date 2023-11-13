import { AgentModel } from '../models/agent.model';
import { SimulationModel } from '../models/simulation.model';

import { AgentRepository } from './agent.repository';
import { SimulationRepository } from './simulation.repository';

export default {
  agentRepository: new AgentRepository(AgentModel),
  simulationRepository: new SimulationRepository(SimulationModel),
};
