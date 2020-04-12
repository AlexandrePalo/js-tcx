import path from 'path'
import parseXml from './parser'
import { buildTraining, buildOneActivityOneLapTraining } from './builder'
import { exportToDelimitedFile } from './export'

const f = path.join(__dirname, '../examples', 'tcx-example.tcx')

parseXml(f).then((r) => {
    const a = buildOneActivityOneLapTraining(
        r.TrainingCenterDatabase.Activities[0]
    )
    console.log(a)
    exportToDelimitedFile(a, 'test.tsv', '\t', ',')
})
