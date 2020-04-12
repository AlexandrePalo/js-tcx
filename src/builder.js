const buildTrackPoints = (track) => {
    const trackPoints = []

    for (let i = 0; i < track.Trackpoint.length; i++) {
        const t = track.Trackpoint[i]

        // Speed calc
        let speedCalc =
            i > 0
                ? ((+t.DistanceMeters[0] -
                      +track.Trackpoint[i - 1].DistanceMeters[0]) /
                      (new Date(t.Time[0]).getTime() -
                          new Date(
                              track.Trackpoint[i - 1].Time[0]
                          ).getTime())) *
                  1000
                : 0.0
        // 0 duration and/or undetermined 0/0 (static point)
        if (speedCalc === Infinity || isNaN(speedCalc)) {
            if (i >= 2) {
                speedCalc = trackPoints[i - 1].speed.calc
            } else {
                speedCalc = 0.0
            }
        }

        trackPoints.push({
            time: t.Time[0],
            latitude: +t.Position[0].LatitudeDegrees[0],
            longitude: +t.Position[0].LongitudeDegrees[0],
            altitude: +t.AltitudeMeters[0],
            distance: +t.DistanceMeters[0],
            speed: {
                file: +t['ns3:TPX'][0].Speed[0],
                calc: speedCalc,
            },
        })
    }

    return trackPoints
}

const buildLap = (lap) => {
    const trackPoints = buildTrackPoints(lap.Track[0])

    return {
        startTime: { file: lap.$.StartTime, calc: trackPoints[0].time },
        totalTime: {
            file: +lap.TotalTimeSeconds[0],
            calc:
                (new Date(trackPoints[trackPoints.length - 1].time).getTime() -
                    new Date(trackPoints[0].time).getTime()) /
                1000,
        },
        distance: {
            file: +lap.DistanceMeters[0],
            calc: trackPoints[trackPoints.length - 1].distance,
        },
        maximumSpeed: {
            file: +lap.MaximumSpeed[0],
            calc: trackPoints.reduce((m, c) => {
                return c.speed.calc > m ? c.speed.calc : m
            }, 0),
        },
        calories: {
            file: +lap.Calories[0], // calc: kg * dist (m) / 1000 => kcal (about 2500 a day for a man)
        },
        trackPoints,
    }
}

const buildActivity = (activity) => {
    return {
        id: activity.Id[0],
        sport: activity.$.Sport,
        laps: activity.Lap.map((l) => buildLap(l)),
    }
}

const buildTraining = (training) => {
    return {
        activities: training.Activity.map((a) => buildActivity(a)),
    }
}

const buildOneActivityOneLapTraining = (training) => {
    return {
        activity: {
            id: training.Activity[0].Id[0],
            sport: training.Activity[0].$.Sport,
            lap: buildLap(training.Activity[0].Lap[0]),
        },
    }
}

export {
    buildTraining,
    buildOneActivityOneLapTraining,
    buildActivity,
    buildLap,
    buildTrackPoints,
}
