import path from 'path'
import parseXml from './parser'
import { buildTraining, buildOneActivityOneLapTraining } from './builder'
const f = path.join(__dirname, '../examples', 'tcx-example.tcx')

parseXml(f).then((r) => {
    console.log(buildTraining(r.TrainingCenterDatabase.Activities[0]))
    console.log(
        buildOneActivityOneLapTraining(r.TrainingCenterDatabase.Activities[0])
    )
})
