import { promises as fs } from 'fs'
import { create } from 'xmlbuilder2'
import parseXml from '../utils/parser'
import moment from 'moment-timezone'

const createTcx = async (
    path,
    {
        gpsPoints,

        heartRatePoints,

        id,
        startTime,
        calories,
        distance,
        duration,

        avgHeartRate,
        maxHeartRate,

        avgSpeed,
        maxSpeed,
    }
) => {
    const xml = create({ version: '1.0', encoding: 'UTF-8', standalone: false })
    const activity = xml
        .ele('TrainingCenterDatabase')
        .att(
            'xsi:schemaLocation',
            'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd'
        )
        .att('xmlns:ns5', 'http://www.garmin.com/xmlschemas/ActivityGoals/v1')
        .att(
            'xmlns:ns3',
            'http://www.garmin.com/xmlschemas/ActivityExtension/v2'
        )
        .att('xmlns:ns2', 'http://www.garmin.com/xmlschemas/UserProfile/v2')
        .att(
            'xmlns',
            'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2'
        )
        .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
        .att(
            'xmlns:ns4',
            'http://www.garmin.com/xmlschemas/ProfileExtension/v1'
        )

        .ele('Activities')
        .ele('Activity')
        .att('Sport', 'Running')

    // Activity
    activity
        .ele('Id')
        .txt(
            moment
                .tz(parseInt(startTime), 'Etc/GMT')
                .format('YYYY-MM-DD[T]HH:mm:ss[Z]')
        )
    const lap = activity
        .ele('Lap')
        .att(
            'StartTime',
            moment
                .tz(parseInt(startTime), 'Etc/GMT')
                .format('YYYY-MM-DD[T]HH:mm:ss[Z]')
        )

    // Lap
    duration && lap.ele('TotalTimeSeconds').txt(Math.round(duration / 1000))
    distance && lap.ele('DistanceMeters').txt(parseFloat(distance).toFixed(1))
    maxSpeed && lap.ele('MaximumSpeed').txt(maxSpeed / 3.6)
    calories && lap.ele('Calories').txt(Math.round(calories))
    avgHeartRate &&
        lap
            .ele('AverageHeartRateBpm')
            .ele('Value')
            .txt(Math.round(avgHeartRate))
    maxHeartRate &&
        lap
            .ele('MaximumHeartRateBpm')
            .ele('Value')
            .txt(Math.round(maxHeartRate))
    lap.ele('Intensity').txt('Active')
    lap.ele('TriggerMethod').txt('Manual')

    // Track
    const track = lap.ele('Track')
    for (let i = 0; i < gpsPoints.length; i++) {
        const trackPoint = track.ele('Trackpoint')
        const g = gpsPoints[i]
        trackPoint
            .ele('Time')
            .txt(
                moment
                    .tz(parseInt(g.time), 'Etc/GMT')
                    .format('YYYY-MM-DD[T]HH:mm:ss[Z]')
            )
        const p = trackPoint.ele('Position')
        p.ele('LatitudeDegrees').txt(g.latitude)
        p.ele('LongitudeDegrees').txt(g.longitude)

        trackPoint.ele('AltitudeMeters').txt(parseFloat(g.elevation).toFixed(1))
        trackPoint.ele('DistanceMeters').txt(parseFloat(g.distance).toFixed(1))
        trackPoint
            .ele('ns3:TPX')
            .ele('Speed')
            .txt(g.speed / 3.6)
    }

    return fs.writeFile(path, xml.end({ prettyPrint: true })).then((r) => path)
}

const readTcx = async (path) => {
    return parseXml(path).then((r) => ({
        activity: {
            id: r.TrainingCenterDatabase.Activities[0].Activity[0].Id[0],
            sport: r.TrainingCenterDatabase.Activities[0].Activity[0].$.Sport,
            lap: {
                startTime:
                    r.TrainingCenterDatabase.Activities[0].Activity[0].Lap[0].$
                        .StartTime,
                totalTime: +r.TrainingCenterDatabase.Activities[0].Activity[0]
                    .Lap[0].TotalTimeSeconds[0],
                distance: +r.TrainingCenterDatabase.Activities[0].Activity[0]
                    .Lap[0].DistanceMeters[0],
                maximumSpeed: +r.TrainingCenterDatabase.Activities[0]
                    .Activity[0].Lap[0].MaximumSpeed[0],
                calories: +r.TrainingCenterDatabase.Activities[0].Activity[0]
                    .Lap[0].Calories[0],
                trackPoints: r.TrainingCenterDatabase.Activities[0].Activity[0].Lap[0].Track[0].Trackpoint.map(
                    (t) => ({
                        time: t.Time[0],
                        latitude: +t.Position[0].LatitudeDegrees[0],
                        longitude: +t.Position[0].LongitudeDegrees[0],
                        altitude: +t.AltitudeMeters[0],
                        distance: +t.DistanceMeters[0],
                        speed: +t['ns3:TPX'][0].Speed[0],
                    })
                ),
            },
        },
    }))
}

export { createTcx, readTcx }
