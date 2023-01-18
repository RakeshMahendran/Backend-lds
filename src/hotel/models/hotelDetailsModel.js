const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const HotelDetailsSchema = new Schema({
    "code": {
      "type": "Number"
    },
    "name": {
      "content": {
        "type": "String"
      }
    },
    "description": {
      "content": {
        "type": "String"
      }
    },
    "countryCode": {
      "type": "String"
    },
    "stateCode": {
      "type": "String"
    },
    "destinationCode": {
      "type": "String"
    },
    "zoneCode": {
      "type": "Number"
    },
    "coordinates": {
      "longitude": {
        "type": "Number"
      },
      "latitude": {
        "type": "Number"
      }
    },
    "categoryCode": {
      "type": "String"
    },
    "categoryGroupCode": {
      "type": "String"
    },
    "chainCode": {
      "type": "String"
    },
    "accommodationTypeCode": {
      "type": "String"
    },
    "boardCodes": {
      "type": [
        "String"
      ]
    },
    "segmentCodes": {
      "type": [
        "Number"
      ]
    },
    "address": {
      "content": {
        "type": "String"
      },
      "street": {
        "type": "String"
      },
      "number": {
        "type": "String"
      }
    },
    "postalCode": {
      "type": "String"
    },
    "city": {
      "content": {
        "type": "String"
      }
    },
    "email": {
      "type": "String"
    },
    "license": {
      "type": "String"
    },
    "phones": {
      "type": [
        "Mixed"
      ]
    },
    "rooms": {
      "type": [
        "Mixed"
      ]
    },
    "facilities": {
      "type": [
        "Mixed"
      ]
    },
    "terminals": {
      "type": [
        "Mixed"
      ]
    },
    "issues": {
      "type": [
        "Mixed"
      ]
    },
    "interestPoints": {
      "type": [
        "Mixed"
      ]
    },
    "images": {
      "type": [
        "Mixed"
      ]
    },
    "wildcards": {
      "type": [
        "Mixed"
      ]
    },
    "web": {
      "type": "String"
    },
    "lastUpdate": {
      "type": "String"
    },
    "S2C": {
      "type": "String"
    },
    "ranking": {
      "type": "Number"
    }
  })


const hotelDetailsModel = mongoose.model("hotelDetailsModel", HotelDetailsSchema);

module.exports =  hotelDetailsModel;