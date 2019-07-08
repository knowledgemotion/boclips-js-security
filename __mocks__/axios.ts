const axios = {
  interceptors:{
    request: {
      use: jest.fn()
    }
  }
};



export default axios;