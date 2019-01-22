module.exports = function (RED) {
  var axios = require('axios')

  function OpenFaaSServerNode (config) {
    RED.nodes.createNode(this, config)
    this.endpoint = config.endpoint
  }
  RED.nodes.registerType('openfaas-server', OpenFaaSServerNode)

  function OpenFaaSInvokeNode (config) {
    RED.nodes.createNode(this, config)
    this.serverConfig = RED.nodes.getNode(config.server)

    if (!this.serverConfig) {
      this.error("invalid server config")
    }

    const client = axios.create({
      baseURL: this.serverConfig.endpoint + "/function/" + config.name
    })

    this.on('input', msg => {
      client.post('/', msg.payload)
        .then(r => {
          msg.requestPayload = msg.payload
          msg.payload = r.data
          this.send([msg, null])
        }, e => {
          this.send([null, msg])
        })
    })

  }
  RED.nodes.registerType('openfaas-invoke', OpenFaaSInvokeNode)
}
