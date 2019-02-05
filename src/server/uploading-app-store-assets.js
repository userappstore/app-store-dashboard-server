const fs = require('fs')
const Multiparty = require('multiparty')
const util = require('util')

module.exports = {
  after: async (req) => {
    if (!req.account ||  req.urlPath !== '/edit-store-page') {
      return
    }
    if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data;')) {
      await parseMultiPartData(req)
    }
  }
}

const parseMultiPartData = util.promisify((req, callback) => {
  const form = new Multiparty.Form()
  return form.parse(req, async (error, fields, files) => {
    if (error) {
      return callback(error)
    }
    const body = {}
    for (const field in fields) {
      if (field === 'fileid') {
        await deleteUploads(files)
        return callback(new Error('invalid-upload'))
      }
      body[field] = fields[field][0]
    }
    if (files && Object.keys(files).length > 5) {
      await deleteUploads(files)
      throw new Error('invalid-upload')
    }
    req.uploads = {}
    if (files.icon && files.icon[0].size) {
      const extension = files.icon[0].originalFilename.toLowerCase().split('.').pop()
      if (extension !== 'png') {
        await deleteUploads(files)
        return callback(new Error('invalid-icon'))
      }
      req.uploads.icon = {
        type: 'image/png',
        buffer: fs.readFileSync(files.icon[0].path),
        name: 'icon.png'
      }
    }
    for (let i = 1; i < 5; i++) {
      if (files[`screenshot${i}`] && files[`screenshot${i}`][0].size) {
        const extension = files[`screenshot${i}`][0].originalFilename.toLowerCase().split('.').pop()
        if (extension !== 'jpg' && extension !== 'jpeg') {
          await deleteUploads(files)
          return callback(new Error('invalid-upload'))
        }
        req.uploads[`screenshot${i}`] = {
          type: 'image/jpeg',
          buffer: fs.readFileSync(files[`screenshot${i}`][0].path),
          name: `screenshot${i}.jpg`
        }
      }
    }
    req.body = body
    await deleteUploads(files)
    return callback()
  })
})

async function deleteUploads(files) {
  for (const field in files) {
    if (!files[field] || !files[field].length) {
      continue
    }
    for (const file of files[field]) {
      fs.unlinkSync(file.path)
    }
  }
}
