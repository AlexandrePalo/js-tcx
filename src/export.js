import fs from 'fs'
import path from 'path'

const exportToDelimitedFile = (
    training,
    folderPath,
    fileName,
    delimiter = ';',
    decimalDelimiter = '.'
) => {
    /**
     * One activity
     * One lap
     */

    // Check feature
    const { calc, activityData, lapData, trackPointsData } = training.options

    const p = path.join(folderPath, fileName)
    // Delete file if already exists
    fs.existsSync(p) && fs.unlinkSync(p)

    const logger = fs.createWriteStream(p, {
        flags: 'a',
    })

    const n = (x) => String(x).replace('.', decimalDelimiter)

    // Activity data
    const { activity: a } = training
    if (activityData) {
        logger.write(`id${delimiter}${a.id}\n`)
        logger.write(`sport${delimiter}${a.sport}\n\n`)
    }

    // Lap data
    const { lap: l } = a
    if (lapData) {
        if (calc) {
            logger.write(
                `attribute${delimiter}file-data${delimiter}calc-data\n`
            )
            logger.write(
                `startTime${delimiter}${l.startTime.file || ''}${delimiter}${
                    l.startTime.calc || ''
                }\n`
            )
            logger.write(
                `totalTime(s)${delimiter}${
                    n(l.totalTime.file) || ''
                }${delimiter}${n(l.totalTime.calc) || ''}\n`
            )
            logger.write(
                `distance(m)${delimiter}${
                    n(l.distance.file) || ''
                }${delimiter}${n(l.distance.calc) || ''}\n`
            )
            logger.write(
                `maximumSpeed(m/s)${delimiter}${
                    n(l.maximumSpeed.file) || ''
                }${delimiter}${n(l.maximumSpeed.calc) || ''}\n`
            )
            logger.write(
                `calories(kcal)${delimiter}${
                    n(l.calories.file) || ''
                }${delimiter}${n(l.calories.calc) || ''}\n\n`
            )
        } else {
            logger.write(`attribute${delimiter}data\n`)
            logger.write(`startTime${delimiter}${l.startTime || ''}\n`)
            logger.write(`totalTime(s)${delimiter}${n(l.totalTime) || ''}\n`)
            logger.write(`distance(m)${delimiter}${n(l.distance) || ''}\n`)
            logger.write(
                `maximumSpeed(m/s)${delimiter}${n(l.maximumSpeed) || ''}\n`
            )
            logger.write(`calories(kcal)${delimiter}${n(l.calories) || ''}\n\n`)
        }
    }

    // Trackpoint data
    const { trackPoints: tps } = l
    if (trackPointsData) {
        logger.write(
            `index${delimiter}time${delimiter}latitude(deg)${delimiter}longitude(deg)${delimiter}altitude(m)${delimiter}distance(m)${delimiter}${
                calc
                    ? `speed-file(m/s)${delimiter}speed-calc(m/s)`
                    : `speed(m/s)`
            }\n`
        )
        for (let i = 0; i < tps.length; i++) {
            logger.write(
                `${i}${delimiter}${tps[i].time}${delimiter}${n(
                    tps[i].latitude
                )}${delimiter}${n(tps[i].longitude)}${delimiter}${n(
                    tps[i].altitude
                )}${delimiter}${n(tps[i].distance)}${delimiter}${
                    calc
                        ? `${n(tps[i].speed.file)}${delimiter}${n(
                              tps[i].speed.calc
                          )}`
                        : `${n(tps[i].speed)}`
                }\n`
            )
        }
    }

    logger.end()
    return p
}

export { exportToDelimitedFile }
