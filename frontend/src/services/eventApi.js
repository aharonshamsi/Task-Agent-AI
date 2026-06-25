import axios from 'axios';
import { Config } from '../constants/config';

export const fetchEventsForUser = async (token, fromDate, toDate) => {
  const response = await axios.get(`${Config.BASE_URL}/event`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      from_date: fromDate,
      to_date: toDate,
    },
  });

  return response.data;
};
