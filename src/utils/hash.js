import fs from 'fs'
import SHA256 from 'crypto-js/sha256'

/**
 * Hash the content of the file at given path, using sha256
 *
 * @param {string} path - Absolute path of file
 * @returns {string} sha256 hash of file content
 */
const sha256File = async (path) => {
    return SHA256(await fs.readFileSync(path, { encoding: 'utf-8' })).toString()
}

export { sha256File }
