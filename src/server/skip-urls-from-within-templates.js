module.exports = {
  before: async (req, res) => {
    // some browsers request URLs found within templates 
    // with the variable names that are waiting to be 
    // replaced with data eg ${install.installid}
    const tagOpen = req.url.indexOf('$%7B') // ${
    if (tagOpen) {
      const tagClose = req.url.indexOf('%7D') // }
      if (tagClose > tagOpen) {
        res.ended = true
        return res.end()
      }
    }
    const tagOpen2 = req.url.indexOf('${') // ${
    if (tagOpen2) {
      const tagClose2 = req.url.indexOf('}') // }
      if (tagClose2 < tagOpen2) {
        res.ended = true
        return res.end()
      }
    }
  }
}