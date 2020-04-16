import fetch, { Headers } from 'node-fetch'
import crypto from 'crypto-js'
import moment from 'moment'

const post = (url, body, accessToken = null) => {
    const date = moment().format('YYYY-MM-DD HH:mm:ss')
    const appKey = 'com.runtastic.android'
    const appSecret =
        'T68bA6dHk2ayW1Y39BQdEnUmGqM8Zq1SFZ3kNas3KYDjp471dJNXLcoYWsDBd1mH'
    const appVersion = '6.9.2'
    const authorizationToken = crypto
        .SHA1(`--${appKey}--${appSecret}--${date}--`)
        .toString()

    const headers = new Headers([
        ['Content-Type', 'application/json'],
        ['X-App-Key', appKey],
        ['X-App-Version', appVersion],
        ['X-Auth-Token', authorizationToken],
        ['X-Date', date],
    ])
    if (accessToken) {
        headers.append('Authorization', `Bearer ${accessToken}`)
    }

    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers,
    })
        .then((res) => res.json())
        .catch((err) => console.log(err))
}

const authenticate = (email, password) => {
    return post('https://appws.runtastic.com/webapps/services/auth/login', {
        email,
        password,
    }).then((res) => res)
}

const sessions = async (user) => {
    // res.sessions Array
    return post(
        'https://appws.runtastic.com/webapps/services/runsessions/v3/sync',
        { perPage: 100, syncedUntil: 0 },
        user.accessToken
    ).then((res) => res)
}

const session = (id, user) => {
    return post(
        `https://appws.runtastic.com/webapps/services/runsessions/v2/${id}/details`,
        {
            includeGpsTrace: { include: true, version: 1 },
            includeHeartRateTrace: { include: true, version: 1 },
            includeHeartRateZones: true,
        },
        user.accessToken
    ).then((res) => {
        if (res.runSessions.gpsData.trace) {
            res.runSessions.gpsData.data = getGpsPointsFromTrace(
                res.runSessions.gpsData.trace
            )
        }
        if (res.runSessions.heartRateData.trace) {
            res.runSessions.heartRateData.data = getHeartRatePointsFromTrace(
                res.runSessions.heartRateData.trace
            )
        }
        return res
    })
}

const getGpsPointsFromTrace = (trace) => {
    let bytes = Buffer.from(trace, 'base64')
    // Nb of Gps points
    const length = bytes.readInt32BE(0)
    bytes = bytes.slice(4)

    /** Points data, each 38 bytes
     * time: long 8 bytes, epoch ms // BIGINT must be parse to Int
     * longitude: float 4 bytes, °
     * latitude: float 4 bytes, °
     * elevation: float 4 bytes, m
     * ?: short 2 bytes
     * speed: float 4 bytes, km/h
     * elasped: int 4 bytes, ms
     * distance: int 4 bytes, m
     * elevationGain: short 2 bytes, m
     * elevationLoss: short 2 bytes, m
     */

    const points = []
    for (let i = 0; i < length; i++) {
        const time = bytes.readBigInt64BE(0)
        const longitude = bytes.readFloatBE(8)
        const latitude = bytes.readFloatBE(12)
        const elevation = bytes.readFloatBE(16)
        // 2 bytes purpose at index bytes 20 ?
        const speed = bytes.readFloatBE(22)
        const elasped = bytes.readInt32BE(26)
        const distance = bytes.readInt32BE(30)
        const elevationGain = bytes.readInt16BE(34)
        const elevationLoss = bytes.readInt16BE(36)
        points.push({
            time,
            longitude,
            latitude,
            elevation,
            speed,
            elasped,
            distance,
            elevationGain,
            elevationLoss,
        })
        bytes = bytes.slice(38)
    }

    return points
}

const getHeartRatePointsFromTrace = (trace) => {
    let bytes = Buffer.from(trace, 'base64')
    // Nb of heartRate points
    const length = bytes.readInt32BE(0)
    bytes = bytes.slice(4)

    /** Points data, each 18 bytes
     * time: long 8 bytes, epoch ms // BIGINT must be parse to Int
     * heartRate:
     * ?: 1 byte
     * elasped: int 4 bytes, ms
     * distance: int 4 bytes, m
     */

    const points = []
    for (let i = 0; i < length; i++) {
        const time = bytes.readBigInt64BE(0)
        const heartRate = bytes.readIntBE(8, 1)
        // 1 byte purpose at index byte 9 ?
        const elasped = bytes.readInt32BE(10)
        const distance = bytes.readInt32BE(14)
        points.push({
            time,
            heartRate,
            elasped,
            distance,
        })
        bytes = bytes.slice(18)
    }

    return points
}

export { authenticate, sessions, session }
