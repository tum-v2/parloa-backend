import { Request, Response } from 'express';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from '@utils/errors';

import DashboardData from '@simulation/model/response/dashboard.response';
import simulationService from '@simulation/service/simulation.service';

/**
 * Get dashboard data
 * @param req - Request object. It requires a number of days.
 * @param res - Response object. It returns Dashboard data.
 * @throws Throws an internal server error if number of days is not provided.
 */
async function getDashboardData(req: Request, res: Response): Promise<void> {
  try {
    const daysQuery = req.query.days as string;
    if (!daysQuery) {
      res.status(400).send(BAD_REQUEST('Please provide a number of days: e.g. ?days=10'));
      return;
    }

    const days: number = parseInt(daysQuery, 10);
    const data: DashboardData = await simulationService.getDashboardData(days);
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(INTERNAL_SERVER_ERROR(error));
  }
}

export default {
  getDashboardData,
};
