module.exports = {
  after: (req) => {
    if (!req.route) {
      return
    }
    if (req.query && req.query.removeTemplate) {
      const routeWas = req.route
      req.route = {}
      for (const key in routeWas) {
        req.route[key] = routeWas[key]
      }
      req.route.template = false
    }
  }
}