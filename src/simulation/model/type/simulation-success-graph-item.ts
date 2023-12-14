import { Types } from 'mongoose';

interface SimulationSuccessGraphItem {
  id: Types.ObjectId;
  successRate: number;
  date: number; // UNIX timestamp
}

export { SimulationSuccessGraphItem };
