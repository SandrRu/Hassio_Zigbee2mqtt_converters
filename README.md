<h2>ptvo_pwm.js</h2>
This is converter for PWM controllers based on firmares created by <a href ="https://ptvo.info/zigbee-configurable-firmware-features/">PTVO Firmware configurator</a>
<h3>Warning - at this moment (z2m version 1.17.0) Hassio inegration works only in Dev branch of zigbee2mqtt!</h3>
 (https://www.zigbee2mqtt.io/how_tos/how-to-switch-to-dev-branch.html)
<p>
<b>Install</b></br>
place ptvo_pwm.js to dtat folder of zigbee2mqtt</br>
Typicaly /share/zigbee2mqtt</br>
</p>
<p>
and add <i>- ptvo_pwm.js</i></br>
to <i>external_converters:</i></br>
In configuration of zigbee2mqtt</br>
</p>
<p>
example:</br>
<i>
data_path: /share/zigbee2mqtt</br>
external_converters:</br>
  - ptvo_pwm.js</br>
devices: devices.yaml</br>
groups: groups.yaml</br>
homeassistant: true</br>
permit_join: false</br>
mqtt:</br>
.......................</br>
 </i>
</p>

Also  <b>Model id</b> in Firmware configurator must be indeticali with <b>zigbeeModel:,</b> in ptvo_pwm.js</br>
example: <b>ptvo_PWM</b>
