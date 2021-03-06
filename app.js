const Eureka = require('eureka-js-client').Eureka;
const request = require('request');
const _ = require('lodash');
const async = require('async');
 
// example configuration
const client = new Eureka({
  // application instance information
  instance: {
    app: 'jqservice',
    hostName: 'localhost',
    ipAddr: 'localhost',
    port: {
      '$': 3000,
      '@enabled': true,
    },
    vipAddress: 'jq.test.something.com',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    // eureka server host / port
    host: 'localhost',
    port: 8761,
    servicePath: '/eureka/apps/',
    preferIpAddress: true
  },
});

const express = require('express')
const app = express()

app.get('/', (req, res) => {
    async.parallel({
        one: function(callback) {
            const shippingServer = getServerByAppId('shipping-service')
            request.get(shippingServer + '/inspector', (err, resp)=> {
                callback(err, resp.body)
            })
        },
        products: function(callback) {
            const shippingServer = getServerByAppId('product-service')
            request.get(shippingServer + '/products', (err, resp)=> {
                callback(err, resp.body)
            })
        }
    }, function(err, results) {
        res.send(results)
    });
})

app.listen(3000, () => {
    client.start();
    console.log('Example app listening on port 3000!')
})

const getServerByAppId = (appId)=> {
    const instances = client.getInstancesByAppId(appId);
    const server = 'http://' + _.get(instances, '0.ipAddr') + ':' + _.get(instances, '0.port.$')
    console.log(instances);
    return server
}