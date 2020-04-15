import path from 'path'
import parseXml from './parser'
import { buildTraining, buildOneActivityOneLapTraining } from './builder'
import { exportToDelimitedFile } from './export'
require('dotenv').config()

import {
    authenticate,
    sessions,
    session,
    getGpsPointsFromTrace,
    getHeartRatePointsFromTrace,
} from './runtastic'
import tcxBuilder from './tcx'

tcxBuilder({})

/*
authenticate(process.env.RUNTASTIC_EMAIL, process.env.RUNTASTIC_PASSWORD).then(
    (r) => {
        sessions(r).then((s) => {
            const lastS = s.sessions[s.sessions.length - 1]

            session(lastS.id, r).then((t) => {
                console.log(t.heartRateData)
            })
        })
    }
)
*/

/*
const defaultOptions = {
    calc: false,
    activityData: true,
    lapData: true,
    trackPointsData: true,
}

const f = path.join(
    __dirname,
    '../examples',
    '2020-04-14 3636027654 Running Runtastic.tcx'
)

parseXml(f).then((r) => {
    const a = buildOneActivityOneLapTraining(
        r.TrainingCenterDatabase.Activities[0],
        {
            calc: false,
            activityData: true,
            lapData: true,
            trackPointsData: true,
        }
    )
    exportToDelimitedFile(
        a,
        path.join(__dirname, '../temp'),
        '2020-04-14 3636027654 Running Runtastic.tsv',
        '\t',
        ','
    )
})
*/
