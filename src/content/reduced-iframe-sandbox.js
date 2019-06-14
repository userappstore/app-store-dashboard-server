module.exports = {
  template: async (req, _, templateDoc) => {
    if (!req.urlPath.startsWith('/install/')) {
      return
    }
    const iframe = templateDoc.getElementById('application-iframe')
    iframe.attr.sandbox = [
      'allow-top-navigation',
      'allow-scripts',
      'allow-forms'
    ]
  }
}
