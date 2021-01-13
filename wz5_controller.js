/*
* Created by Sandr.ru at 12-01-2021
**/
const fz = {...require('zigbee-herdsman-converters/converters/fromZigbee'), legacy: require('zigbee-herdsman-converters/lib/legacy').fromZigbee};
const { tuyaGetDataValue } = require('zigbee-herdsman-converters/lib/legacy');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const { postfixWithEndpointName } = require('zigbee-herdsman-converters/lib/utils');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const e = exposes.presets;
const tuya = require('zigbee-herdsman-converters/lib/tuya');

const wz5dataPoints = {
    mode: 2,  //enum [ 0-255 ] {"status":0,"transid":3,"dp":2,"datatype":4,"fn":0,"data":{"type":"Buffer","data":[0]}}
    color_temp: 4, //value [ 4 byte ] {"status":0,"transid":5,"dp":4,"datatype":2,"fn":0,"data":{"type":"Buffer","data":[0,0,0,171]}}
    color: 7, //value [ 4 byte ] {"status":0,"transid":6,"dp":7,"datatype":2,"fn":0,"data":{"type":"Buffer","data":[0,0,0,0]}}
};
/*
const wz5exposes = {
    class Wz5light extends Base {
        constructor() {
            super();
            this.type = 'wz5light';
            this.features = [];
        }

        withSystemMode(modes, access=a.ALL) {
            assert(!this.endpoint, 'Cannot add feature after adding endpoint');
            const allowed = ['white', 'rgb'];
            modes.forEach((m) => assert(allowed.includes(m)));
            this.features.push(new Enum('system_mode', access, modes).withDescription('Mode of this device'));
            return this;
        }
    }
    module.exports = {
        access,
        wz5light: () => new Wz5light(),
        
    }
}
*/
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
                case tuya.dataPoints.dimmerLevel: 
                    return {brightness: value}; //(value / 10).toFixed(1)
                case tuya.dataPoints.mode: 
                    switch (value) {
                        case 0: // white
                            return {system_mode: 'white'};
                        case 1: // rgb
                            return {system_mode: 'rgb'};
                        default:
                            meta.logger.warn('WZ5:mode ' + `preset ${value} is not recognized.`);
                        break;
                    }
                    break;
                case wz5dataPoints.color_temp: 
                case wz5dataPoints.color: // DPID that we added to common
                    meta.logger.warn(`WZ5: #${dp} with data ${JSON.stringify(msg.data)}`); 
                default:
                    meta.logger.warn(`WZ5: NOT RECOGNIZED DP #${dp} with data ${JSON.stringify(msg.data)}`); 
            }
        },
    },   
};

const toZigbee = {
    system_mode: {
        key: ['system_mode'],
        convertSet: async (entity, key, value, meta) => {
            switch (value) {
                case 'white':
                    await tuya.sendDataPointBool(entity, tuya.dataPoints.state, true);
                    await utils.sleep(500);
                    await tuya.sendDataPointEnum(entity, tuya.dataPoints.mode, 0 /* white */);
                    break;
                case 'rgb':
                    await tuya.sendDataPointBool(entity, tuya.dataPoints.state, true);
                    await utils.sleep(500);
                    await tuya.sendDataPointEnum(entity, tuya.dataPoints.mode, 1 /* rgb */);
                    break;
                break;
            }
        },
    },
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
            tz.tuya_led_controller,
            toZigbee.system_mode
        ],
        exposes: [
            e.light_brightness(),
            //wz5exposes.wz5light().withSystemMode(['white', 'rgb']),
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
