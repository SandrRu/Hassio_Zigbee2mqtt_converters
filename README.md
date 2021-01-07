This is converter for PWM controllers based on firmares created by <a href ="https://ptvo.info/zigbee-configurable-firmware-features/">PTVO Firmware configurator</a>
<h3>Warning - at this moment (z2m version 1.17.0) Hassio inegration works only in Dev branch of zigbee2mqtt!</h3>
 (https://www.zigbee2mqtt.io/how_tos/how-to-switch-to-dev-branch.html)

<b>Install</b>
place ptvo_pwm.js to dtat folder of zigbee2mqtt
Typicaly .share/zigbee2mqtt

and add to <i>- ptvo_pwm.js</i>
to <i>external_converters:</i>
In configuration of zigbee2mqtt

example:
<i>
data_path: /share/zigbee2mqtt
external_converters:
  - ptvo_pwm.js
devices: devices.yaml
groups: groups.yaml
homeassistant: true
permit_join: false
mqtt:
.......................
 </i>
