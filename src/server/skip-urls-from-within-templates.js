module.exports = {
  before: async (req, res) => {
    // some browsers request URLs found within templates 
    // with the variable names that are waiting to be 
    // replaced with data eg ${install.installid}
    const tagOpen = req.url.indexOf('$%7B') // ${
    if (tagOpen === -1) {
      return
    }
    const tagClose = req.url.indexOf('%7D') // }
    if (tagClose < tagOpen) {
      return
    }
    res.ended = true
    return res.end()
  }
}