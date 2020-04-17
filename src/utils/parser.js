import { promises as fs } from 'fs'
import { Parser } from 'xml2js'

/**
 * Parse xml file at given path into js Object
 *
 * @param {string} path - Absolute file path
 * @returns {Promise Object} xml data
 */
const parseXml = (path) => {
    const parser = new Parser()
    return fs.readFile(path).then((data) => {
        return parser.parseStringPromise(data)
    })
}

export { parseXml }
