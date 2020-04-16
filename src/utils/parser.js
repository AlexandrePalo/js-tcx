import fs from 'fs'
import { Parser } from 'xml2js'

const parseXml = (filePath) => {
    const parser = new Parser()
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                reject(err)
            }
            parser.parseString(data, (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve(result)
            })
        })
    })
}

export default parseXml
