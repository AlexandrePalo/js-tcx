import path from 'path'
require('dotenv').config()

import { authenticate, sessions, session } from './apps/runtastic'
import { createTcx, readTcx } from './files/tcx'
import { createDelimited } from './files/delimited'

authenticate(process.env.RUNTASTIC_EMAIL, process.env.RUNTASTIC_PASSWORD)
  .then((user) => {
    sessions(user).then((r) => {
      session(r.sessions[r.sessions.length - 2].id, user).then((t) => {
        createTcx(path.join(__dirname, '../temp', '1.tcx'), {
          gpsPoints: t.runSessions.gpsData.data,
          id: t.runSessions.id,
          startTime: t.runSessions.startTime,
          calories: t.runSessions.calories,
          distance: t.runSessions.distance,
          duration: t.runSessions.duration,
          avgHeartRate: t.runSessions.heartRateData.avg,
          maxHeartRate: t.runSessions.heartRateData.avg,
          maxSpeed: t.runSessions.speedData.avg,
        }).then((u) => {
          console.log('exported to tcx')
        })
      })
      session(r.sessions[r.sessions.length - 1].id, user).then((t) => {
        createTcx(path.join(__dirname, '../temp', '2.tcx'), {
          gpsPoints: t.runSessions.gpsData.data,
          id: t.runSessions.id,
          startTime: t.runSessions.startTime,
          calories: t.runSessions.calories,
          distance: t.runSessions.distance,
          duration: t.runSessions.duration,
          avgHeartRate: t.runSessions.heartRateData.avg,
          maxHeartRate: t.runSessions.heartRateData.avg,
          maxSpeed: t.runSessions.speedData.avg,
        }).then((u) => {
          console.log('exported to tcx')
        })
      })
    })
  })
  .catch((e) => {
    throw new Error('Error during authentication process.')
  })
