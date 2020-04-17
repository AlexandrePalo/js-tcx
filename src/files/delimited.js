import fs from 'fs'

/**
 * Create a delimited file (csv, tsv, ...) at given path built with data
 *
 * @param {Object} object - Data
 * @param {string} path - Absolute path of created file, should provide the extension (.tsv, .csv, ...)
 * @param {string} [delimiter=';'] - File delimiter
 * @param {string} [decimalDelimiter='.'] - Decimal delimiter in file
 * @returns {string} Absolute path of created file
 */
const createDelimited = (
    object,
    path,
    delimiter = ';',
    decimalDelimiter = '.'
) => {
    const logger = fs.createWriteStream(path, {
        flags: 'a',
    })

    const n = (x) => String(x).replace('.', decimalDelimiter)

    // Activity data
    const { activity: a } = object
    logger.write(`id${delimiter}${a.id}\n`)
    logger.write(`sport${delimiter}${a.sport}\n\n`)

    // Lap data
    const { lap: l } = a
    logger.write(`attribute${delimiter}data\n`)
    logger.write(`startTime${delimiter}${l.startTime || ''}\n`)
    logger.write(`totalTime(s)${delimiter}${n(l.totalTime) || ''}\n`)
    logger.write(`distance(m)${delimiter}${n(l.distance) || ''}\n`)
    logger.write(`maximumSpeed(m/s)${delimiter}${n(l.maximumSpeed) || ''}\n`)
    logger.write(`calories(kcal)${delimiter}${n(l.calories) || ''}\n\n`)

    // Trackpoint data
    const { trackPoints: tps } = l
    logger.write(
        `index${delimiter}time${delimiter}latitude(deg)${delimiter}longitude(deg)${delimiter}altitude(m)${delimiter}distance(m)${delimiter}speed(m/s)\n`
    )
    for (let i = 0; i < tps.length; i++) {
        logger.write(
            `${i}${delimiter}${tps[i].time}${delimiter}${n(
                tps[i].latitude
            )}${delimiter}${n(tps[i].longitude)}${delimiter}${n(
                tps[i].altitude
            )}${delimiter}${n(tps[i].distance)}${delimiter}${n(tps[i].speed)}\n`
        )
    }

    logger.end()
    return path
}

export { createDelimited }
