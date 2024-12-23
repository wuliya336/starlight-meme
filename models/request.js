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
        timeout: 5000,
        proxy: false
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
   * 通用 HEAD 请求
   */
  head: async (url) => {
    try {
      const options = {
        headers: {
          'User-Agent': 'clarity-meme'
        },
        timeout: 5000,
        proxy: false
      }

      const response = await axios.head(url, options)
      return response.headers
    } catch (error) {
      logger.error(`请求 ${url} 的头部信息失败: ${error.message}`)
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
        proxy: false,
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
