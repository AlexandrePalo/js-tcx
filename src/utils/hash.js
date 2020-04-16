import fs from 'fs'
import SHA256 from 'crypto-js/sha256'

const sha256File = async (path) => {
    return SHA256(await fs.readFileSync(path, { encoding: 'utf-8' })).toString()
}

export { sha256File }
