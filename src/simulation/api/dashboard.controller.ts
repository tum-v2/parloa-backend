/* eslint-disable require-jsdoc */
import DashboardData from '../db/models/dashboardData.model';
import { Request, Response } from 'express';

/**
 * Get dashboard data
 * @param req - Request
 * @param res - Response
 */
async function getDashboardData(req: Request, res: Response): Promise<void> {
  const days = req.query.days;
  if (!days) {
    res.status(500).send('Please provide a number of days: e.g. ?days=10 ');
    return;
  }
  const data: DashboardData = {
    interactions: 10,
    simulationRuns: 20,
    successRate: 0.1,
    simulationSuccessGraph: {},
    top10Simulations: [],
  };
  res.status(200).send(data);
}

export default {
  getDashboardData,
};
