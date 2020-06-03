const Promise = () => {
  const promise = {} as Promise<any>;

  promise.then = jest.fn().mockReturnValue(promise);
  promise.catch = jest.fn().mockReturnValue(promise);

  return promise;
};

const axios = {
  interceptors: {
    request: {
      use: jest.fn(),
    },
  },
    post: jest.fn().mockReturnValue(Promise())
};

export default axios;
