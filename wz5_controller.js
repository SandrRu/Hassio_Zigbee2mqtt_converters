/*
* Created by Sandr.ru at 08-01-2021
* MQTT Example command 
* zigbee2mqtt/PWM_PA2/l1/set
* {"brightness_l1":13, "transition":3} 
**/
const fz = {...require('zigbee-herdsman-converters/converters/fromZigbee'), legacy: require('zigbee-herdsman-converters/lib/legacy').fromZigbee};
const { tuyaGetDataValue } = require('zigbee-herdsman-converters/lib/legacy');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const { postfixWithEndpointName } = require('zigbee-herdsman-converters/lib/utils');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const e = exposes.presets;
const tuya = require('zigbee-herdsman-converters/lib/tuya');

const wz5dataPoints = {
    wz5_state: 2,
}

const fromZigbee = {
    wz5_controller: {
        cluster: 'manuSpecificTuya',
        type: ['commandGetData', 'commandSetDataResponse'],
        convert: (model, msg, publish, options, meta) => {
            const dp = msg.data.dp; // First we get the data point ID
            const value = tuya.getDataValue(msg.data.datatype, msg.data.data); // This function will take of converting the data to proper JS type

            switch (dp) {
            case tuya.dataPoints.state: // DPID that we added to common
                return { state: value ? 'ON' : 'OFF' }; 
            case tuya.dataPoints.mode:
                switch (value) {
                    default:
                        meta.logger.warn('WZ5: ' +
                            `preset ${value} is not recognized.`);
                        break;
                }
                break;            
            case wz5dataPoints:
                switch (value) {
                   default:
                    meta.logger.warn('WZ5: ' +
                        `preset ${value} is not recognized.`);
                    break;
                }
                break;            
            case tuya.dataPoints.dimmerLevel: // DPID that we added to common
                return {brightness: value}; //(value / 10).toFixed(1)
            default:
                meta.logger.warn(`WZ5: NOT RECOGNIZED DP #${dp} with data ${JSON.stringify(msg.data)}`); 
            }
        },
    },   
};

const toZigbee = {
};

const bind = async (endpoint, target, clusters) => {
    for (const cluster of clusters) {
        await endpoint.bind(cluster, target);
    }
};

const devices = [
    {
        fingerprint: [ 
            {
/*
Zigbee2MQTT:warn  2021-01-12 18:06:50: Unhandled DP #1: {"status":0,"transid":2,"dp":1,"datatype":1,"fn":0,"data":{"type":"Buffer","data":[1]}}
Zigbee2MQTT:warn  2021-01-12 18:06:50: Unhandled DP #2: {"status":0,"transid":3,"dp":2,"datatype":4,"fn":0,"data":{"type":"Buffer","data":[0]}}
Zigbee2MQTT:warn  2021-01-12 18:06:50: Unhandled DP #3: {"status":0,"transid":4,"dp":3,"datatype":2,"fn":0,"data":{"type":"Buffer","data":[0,0,3,232]}}
Zigbee2MQTT:warn  2021-01-12 18:06:50: Unhandled DP #4: {"status":0,"transid":5,"dp":4,"datatype":2,"fn":0,"data":{"type":"Buffer","data":[0,0,2,222]}}
Zigbee2MQTT:warn  2021-01-12 18:06:50: Unhandled DP #7: {"status":0,"transid":6,"dp":7,"datatype":2,"fn":0,"data":{"type":"Buffer","data":[0,0,0,0]}}

*/
                modelID: 'TS0601', // You may need to add \u0000 at the end of the name in some cases
                manufacturerName: '_TZE200_mde0utnv' 
            },
        ],
        model: 'WZ5',
        vendor: 'SageluMei',
        description: 'ZigBee & RF 5 in 1 LED Controller',
        supports: 'brightness, colortemperature',
        fromZigbee: [
            fromZigbee.wz5_controller,
            fz.on_off, 
            fz.tuya_led_controller, 
            fz.brightness, 
        ],
        toZigbee: [
            tz.tuya_dimmer_state,
            tz.tuya_dimmer_level,
            tz.on_off, 
            tz.tuya_led_control, 
            tz.tuya_led_controller,
            tz.tuya_data_point_test,
        ],
        exposes: [
            e.light_brightness()
            //e.light_brightness_colortemp_colorhs()
        ],

         onEvent: tuya.setTime, // Add this if you are getting no converter for 'commandSetTimeRequest'
        meta: {
            configureKey: 1,
        },
        configure: async (device, coordinatorEndpoint, logger) => {
            const endpoint = device.getEndpoint(1);
            await bind(endpoint, coordinatorEndpoint, ['genBasic']);
        },
    },

];

module.exports = devices;