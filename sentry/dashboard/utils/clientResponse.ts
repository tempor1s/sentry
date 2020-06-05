import { Response } from 'express';

interface ResponsePayload {
  data?: object;
}

interface ResponseOptions {
  data?: object;
}

const clientResponse = (
  res: Response,
  code: number,
  opts?: ResponseOptions
) => {
  let data: object | undefined;

  if (opts) {
    data = opts.data || undefined;
  }

  const payload: ResponsePayload = {
    data,
  };

  return res.status(code).json(payload);
};

export default clientResponse;
