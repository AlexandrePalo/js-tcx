import { create } from 'xmlbuilder2'
import moment from 'moment'

const tcxBuilder = ({
    gpsPoints,

    heartRatePoints,

    startTime,
    calories,
    distance,
    duration,

    avgHeartRate,
    maxHeartRate,

    avgSpeed,
    maxSpeed,
}) => {
    const obj = { root: { $: { id: 'my id' }, _: 'my inner text' } }

    const xml = create()
    const activity = xml
        .ele('TrainingCenterDatabase')
        .ele('Activities')
        .ele('Activity')
        .att('Sport', 'Running')

    // Activity
    activity.ele('Id').txt('xxxxxx')
    const lap = activity
        .ele('Lap')
        .att('StartTime', moment(startTime).format('......'))

    // Lap

    console.log(xml.end({ prettyPrint: true }))
    // XML encoding is auto

    //
}

export default tcxBuilder

/*
<TotalTimeSeconds>2842</TotalTimeSeconds>
<DistanceMeters>6088.0</DistanceMeters>
<MaximumSpeed>2.896590277777778</MaximumSpeed>
<Calories>506</Calories>
<AverageHeartRateBpm>
    <Value>0</Value>
</AverageHeartRateBpm>
<MaximumHeartRateBpm>
    <Value>0</Value>
</MaximumHeartRateBpm>
<Intensity>Active</Intensity>
<TriggerMethod>Manual</TriggerMethod>
*/
