/*
* Created by Sandr.ru at 08-01-2021
*
**/
const fz = {...require('zigbee-herdsman-converters/converters/fromZigbee'), legacy: require('zigbee-herdsman-converters/lib/legacy').fromZigbee};
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const { postfixWithEndpointName } = require('zigbee-herdsman-converters/lib/utils');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const e = exposes.presets;

const fromZigbee = {
    ptvo_brightness: {
        cluster: 'genAnalogInput',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            if (msg.data.hasOwnProperty('presentValue')) {
                const property = postfixWithEndpointName('brightness', msg, model);
                return {[property]: msg.data['presentValue']};
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
        zigbeeModel: ['ptvo_PWM'],
        model: 'ptvo_PWM',
        vendor: 'SandrRu',
        description: '[2 channel, PWM Controller](http://sandr.ru/?p=xxxx)',
        supports: '',
        exposes: [
           e.light_brightness().withEndpoint('l1')  ,
           e.light_brightness().withEndpoint('l2'), 
        ],
        fromZigbee: [
           fromZigbee.ptvo_brightness,
           fz.on_off, 
           fz.brightness,
           fz.ignore_basic_report,
        ],
        toZigbee: [
            tz.light_onoff_brightness, 
            tz.ignore_transition, 
            tz.ignore_rate, 
            tz.light_brightness_move, 
            tz.light_brightness_step,
            tz.on_off,
        ],
        meta: {multiEndpoint: true},
        endpoint: (device) => { return {'l1': 1, 'l2': 2,}; },
    },
];

module.exports = devices;