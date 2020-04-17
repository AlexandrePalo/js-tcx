import fetch, { Headers } from 'node-fetch'
import crypto from 'crypto-js'
import moment from 'moment'

/**
 * TODO
 *
 */

/**
 * RUNTASTIC APP WORKFLOW
 *
 * All API calls are done via "post" function.
 *  "authenticate" --> get accessToken.
 *  "sessions" with accessToken --> get list of all session.
 *  "session" with session id and authToken --> get details of a session,
 *      including gps and heart rate data points decoded.
 */

/**
 * Fetch url with POST method, providing basic headers and specified body and auth token
 *
 * @param {string} url
 * @param {Object} body
 * @param {string} [accessToken=null] - Not needed for some routes
 * @returns {Promise Object} JSON data received
 */
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
    }).then((res) => res.json())
}

/**
 * Authenticate from Runtastic API, get auth token and user info
 *
 * @param {*} email
 * @param {*} password
 * @returns {Object} User and auth info
 *      {string} userId
 *      {string} uidt
 *      {string} refreshToken
 *      {string} accessToken
 *      {string} expiresIn
 *      {string} tokenType
 * @throws Error if no accessToken provided from the API
 */
const authenticate = (email, password) => {
    return post(process.env.RUNTASTIC_AUTHENTICATE_URL, {
        email,
        password,
    }).then((res) => {
        if (!res.accessToken) {
            throw new Error('Email / password error, no accessToken provided.')
        }
        return res
    })
}

/**
 * Fetch list of session for the given user
 *
 * @param {Object} user - Must contains accessToken
 * @returns {Promise Array of Object} Array of session object, not fully detailed
 */
const sessions = async (user) => {
    // res.sessions Array
    return post(
        `${process.env.RUNTASTIC_RUNSESSIONS_V3_URL}/sync`,
        { perPage: 100, syncedUntil: 0 },
        user.accessToken
    ).then((res) => res)
}

/**
 * Fetch full session object for the given session id
 *
 * @param {string} id
 * @param {Object} user - Must contains accessToken
 * @returns {Promise Object} Session object
 */
const session = (id, user) => {
    return post(
        `${process.env.RUNTASTIC_RUNSESSIONS_V2_URL}/${id}/details`,
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

/**
 * Build gps points array from encoded trace
 *
 * @param {string} trace - Base64 encoded trace
 * @returns {Array of Object} Gps points
 *      {string} time - epoch ms GMT
 *      {number} latitude - °
 *      {number} longitude - °
 *      {number} elevation - m
 *      {number} distance - m
 *      {number} speed - km/h
 */
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

/**
 * Build heart rate points array from encoded trace
 *
 * @param {string} trace - Base64 encoded trace
 * @returns {Array of Object} Heart rate points
 *      {string} time - epoch ms GMT
 *      {number} heartRate - bpm
 *      {number} elapsed - ms
 *      {number} distance - m
 */
const getHeartRatePointsFromTrace = (trace) => {
    let bytes = Buffer.from(trace, 'base64')
    // Nb of heartRate points
    const length = bytes.readInt32BE(0)
    bytes = bytes.slice(4)

    /** Points data, each 18 bytes
     * time: long 8 bytes, epoch ms // BIGINT must be parse to Int
     * heartRate: int 1 byte, bpm
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
