import axios from 'axios'
import FormData from 'form-data'

const Request = {
  /**
   * 通用 GET 请求
   */
  get: async (url, params = {}, responseType) => {
    try {
      const options = {
        headers: {
          'User-Agent': 'clarity-meme'
        },
        timeout: 5000
      }
      if (params) {
        options.params = params
      }
      if (responseType) {
        options.responseType = responseType
      }

      const response = await axios.get(url, options)
      return responseType === 'arraybuffer' ? Buffer.from(response.data) : response.data
    } catch (error) {
      logger.error(`请求 ${url} 失败: ${error.message}`)
      throw error
    }
  },

  /**
   * 通用 POST 请求
   */
  post: async (url, data = null, responseType) => {
    try {
      let formHeaders = {}
      let postData = data

      if (data instanceof FormData) {
        formHeaders = data.getHeaders()
      } else if (data === null) {
        postData = undefined
      }

      const response = await axios.post(url, postData, {
        headers: {
          'User-Agent': 'clarity-meme',
          ...formHeaders
        },
        timeout: 5000,
        ...(responseType && { responseType })
      })

      return responseType === 'arraybuffer' ? Buffer.from(response.data) : response.data
    } catch (error) {
      logger.error(`请求 ${url} 失败: ${error.message}`)
      throw error
    }
  }
}

export default Request
